// API Route: GET /api/mints/[id] - Obter detalhes de um projeto de mint
// Lê dados on-chain da blockchain
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getContractData, getMintStatus, formatMintPrice } from "@/lib/blockchain"

// Fallback project quando banco não está disponível
const FALLBACK_PROJECT = {
  id: "fallback-1",
  name: "Cyber Punks Genesis",
  image: "/cyberpunk-neon-avatar.jpg",
  description: "First generation of Cyber Punks on Arc Testnet. Experimental NFT collection featuring neon-styled avatars.",
  contractAddress: process.env.CONTRACT_ADDRESS_1 || "0x177b3E8D4E3a4A2BFd191aaCafdae76E4444fbB2",
  network: "Arc Testnet",
}

async function getProjectFromDB(id: string) {
  try {
    return await prisma.mintProject.findUnique({
      where: { id },
    })
  } catch (error: any) {
    // Se não tiver DATABASE_URL ou banco não estiver configurado, usar fallback
    if (error.message?.includes("DATABASE_URL") || error.message?.includes("Environment variable")) {
      // Se for o fallback ID ou não encontrar, retornar fallback project
      if (id === "fallback-1" || !id) {
        return FALLBACK_PROJECT as any
      }
      return null
    }
    throw error
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const project = await getProjectFromDB(id)

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

    // Atualizar cache (async) - só se banco estiver disponível
    if (project.id !== "fallback-1") {
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
    }

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

