// API Route: GET /api/metadata/[tokenId] - Retornar metadata do NFT
// Esta API serve a metadata que o contrato referencia via tokenURI()
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getNFTContract } from "@/lib/blockchain"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params
    const tokenIdNum = parseInt(tokenId)

    if (isNaN(tokenIdNum) || tokenIdNum < 1) {
      return NextResponse.json({ error: "Invalid token ID" }, { status: 400 })
    }

    // Buscar qual projeto este NFT pertence
    // Por enquanto, vamos assumir que todos os NFTs são do primeiro projeto
    // Em produção, você pode ter um mapeamento tokenId -> contractAddress
    
    const projects = await prisma.mintProject.findMany({
      where: {
        contractAddress: { not: null },
      },
      orderBy: { createdAt: "asc" },
      take: 1, // Pegar o primeiro projeto deployado
    })

    if (projects.length === 0) {
      return NextResponse.json({ error: "No projects found" }, { status: 404 })
    }

    const project = projects[0]

    // Verificar se o token existe na blockchain
    if (project.contractAddress) {
      const contract = getNFTContract(project.contractAddress)
      if (contract) {
        try {
          // Verificar se o token existe
          await contract.ownerOf(tokenIdNum)
        } catch {
          return NextResponse.json({ error: "Token does not exist" }, { status: 404 })
        }
      }
    }

    // Retornar metadata usando a mesma imagem do projeto
    // Em produção, você pode ter imagens individuais por tokenId
    const metadata = {
      name: `${project.name} #${tokenId}`,
      description: project.description,
      image: project.image.startsWith("http") 
        ? project.image 
        : `${request.nextUrl.origin}${project.image}`, // URL completa
      external_url: `${request.nextUrl.origin}`,
      attributes: [
        {
          trait_type: "Collection",
          value: project.name,
        },
        {
          trait_type: "Token ID",
          value: tokenId,
        },
        {
          trait_type: "Network",
          value: project.network,
        },
      ],
    }

    return NextResponse.json(metadata, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("Error fetching metadata:", error)
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 })
  }
}

