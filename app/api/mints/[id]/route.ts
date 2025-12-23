// API Route: GET /api/mints/[id] - Obter detalhes de um projeto de mint
// Lê dados on-chain da blockchain
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getContractData, getMintStatus, formatMintPrice } from "@/lib/blockchain"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const project = await prisma.mintProject.findUnique({
      where: { id },
    })

    if (!project) {
      return NextResponse.json({ error: "Mint project not found" }, { status: 404 })
    }

    // Ler dados on-chain da blockchain
    const contractData = await getContractData(project.contractAddress)

    if (!contractData) {
      // Se não conseguir ler da blockchain, usar cache
      return NextResponse.json({
        mint: {
          id: project.id,
          name: project.name,
          image: project.image,
          status: project.adminStatus || project.cachedStatus || "ended",
          price: project.cachedPrice || "0 USDC",
          supply: project.cachedSupply || 0,
          minted: project.cachedMinted || 0,
          network: project.network,
          startTime: project.adminStartTime || null,
          endTime: project.adminEndTime || null,
          description: project.description,
          walletLimit: 0,
          contractAddress: project.contractAddress,
        },
      })
    }

    // Atualizar cache (async)
    prisma.mintProject
      .update({
        where: { id },
        data: {
          cachedSupply: Number(contractData.maxSupply),
          cachedMinted: Number(contractData.totalSupply),
          cachedPrice: formatMintPrice(contractData.mintPrice),
          cachedStatus: getMintStatus(contractData),
          lastSyncAt: new Date(),
        },
      })
      .catch(console.error)

    const status = getMintStatus(contractData)
    const price = formatMintPrice(contractData.mintPrice)

    return NextResponse.json({
      mint: {
        id: project.id,
        name: project.name,
        image: project.image,
        status: project.adminStatus || status,
        price,
        supply: Number(contractData.maxSupply),
        minted: Number(contractData.totalSupply),
        network: project.network,
        startTime: project.adminStartTime || (contractData.startTime ? new Date(Number(contractData.startTime) * 1000) : null),
        endTime: project.adminEndTime || (contractData.endTime ? new Date(Number(contractData.endTime) * 1000) : null),
        description: project.description,
        walletLimit: Number(contractData.walletMintLimit),
        contractAddress: project.contractAddress,
      },
    })
  } catch (error) {
    console.error("Error fetching mint:", error)
    return NextResponse.json({ error: "Failed to fetch mint" }, { status: 500 })
  }
}

