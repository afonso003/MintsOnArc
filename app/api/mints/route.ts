// API Route: GET /api/mints - Listar todos os projetos de mint
// Lê dados on-chain da blockchain e combina com metadados off-chain do banco
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getContractData, getMintStatus, formatMintPrice } from "@/lib/blockchain"

// Fallback: Dados do contrato deployado quando banco não está disponível
const FALLBACK_PROJECTS = [
  {
    id: "fallback-1",
    name: "Cyber Punks Genesis",
    image: "/cyberpunk-neon-avatar.jpg",
    description: "First generation of Cyber Punks on Arc Testnet. Experimental NFT collection featuring neon-styled avatars.",
    contractAddress: process.env.CONTRACT_ADDRESS_1 || "0x177b3E8D4E3a4A2BFd191aaCafdae76E4444fbB2",
    network: "Arc Testnet",
  },
]

async function getProjectsFromDB() {
  try {
    return await prisma.mintProject.findMany({
      orderBy: [{ createdAt: "desc" }],
    })
  } catch (error: any) {
    // Se não tiver DATABASE_URL ou banco não estiver configurado, usar fallback
    if (error.message?.includes("DATABASE_URL") || error.message?.includes("Environment variable")) {
      console.log("⚠️  Database not configured, using fallback projects")
      return FALLBACK_PROJECTS as any[]
    }
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const requestedStatus = searchParams.get("status") // "live" | "upcoming" | "ended" | null

    // Buscar projetos do banco (metadados off-chain) ou usar fallback
    const dbProjects = await getProjectsFromDB()

    // Buscar dados on-chain da blockchain para cada projeto
    const mints = await Promise.all(
      dbProjects.map(async (project) => {
        try {
          // Ler dados da blockchain
          const contractData = await getContractData(project.contractAddress)

          if (!contractData) {
            // Se não conseguir ler da blockchain, usar cache do banco
            return {
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
              walletLimit: Number(contractData?.walletMintLimit || 0),
              contractAddress: project.contractAddress,
            }
          }

          // Calcular status baseado em dados on-chain
          const status = getMintStatus(contractData)
          const price = formatMintPrice(contractData.mintPrice)

          // Atualizar cache no banco (async, não bloqueia resposta)
          // Só atualiza se o banco estiver disponível
          if (project.id !== "fallback-1") {
            prisma.mintProject
              .update({
                where: { id: project.id },
                data: {
                  cachedSupply: Number(contractData.maxSupply),
                  cachedMinted: Number(contractData.totalSupply),
                  cachedPrice: price,
                  cachedStatus: status,
                  lastSyncAt: new Date(),
                },
              })
              .catch(console.error)
          }

          return {
            id: project.id,
            name: project.name,
            image: project.image,
            status: project.adminStatus || status, // Admin pode fazer override
            price,
            supply: Number(contractData.maxSupply),
            minted: Number(contractData.totalSupply),
            network: project.network,
            startTime: project.adminStartTime || (contractData.startTime ? new Date(Number(contractData.startTime) * 1000) : null),
            endTime: project.adminEndTime || (contractData.endTime ? new Date(Number(contractData.endTime) * 1000) : null),
            description: project.description,
            walletLimit: Number(contractData.walletMintLimit),
            contractAddress: project.contractAddress,
          }
        } catch (error) {
          console.error(`Error fetching contract data for ${project.contractAddress}:`, error)
          // Retornar dados do cache em caso de erro
          return {
            id: project.id,
            name: project.name,
            image: project.image,
            status: project.cachedStatus || "ended",
            price: project.cachedPrice || "0 USDC",
            supply: project.cachedSupply || 0,
            minted: project.cachedMinted || 0,
            network: project.network,
            startTime: project.adminStartTime || null,
            endTime: project.adminEndTime || null,
            description: project.description,
            walletLimit: 0,
            contractAddress: project.contractAddress,
          }
        }
      })
    )

    // Filtrar por status se solicitado
    const filteredMints = requestedStatus
      ? mints.filter((mint) => mint.status === requestedStatus)
      : mints

    // Ordenar: live primeiro, depois por data
    filteredMints.sort((a, b) => {
      if (a.status === "live" && b.status !== "live") return -1
      if (a.status !== "live" && b.status === "live") return 1
      return 0
    })

    return NextResponse.json({ mints: filteredMints })
  } catch (error) {
    console.error("Error fetching mints:", error)
    return NextResponse.json({ error: "Failed to fetch mints" }, { status: 500 })
  }
}

