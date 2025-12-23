// API Route: GET /api/mints/[id]/wallet-count - Obter contagem de mints de uma wallet
// Lê dados diretamente da blockchain
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { isValidAddress } from "@/lib/web3"
import { getWalletMintCount, getContractData } from "@/lib/blockchain"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const walletAddress = searchParams.get("walletAddress")

    if (!walletAddress || !isValidAddress(walletAddress)) {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 })
    }

    const mintProject = await prisma.mintProject.findUnique({
      where: { id },
    })

    if (!mintProject) {
      return NextResponse.json({ error: "Mint project not found" }, { status: 404 })
    }

    // Ler dados da blockchain
    const contractData = await getContractData(mintProject.contractAddress)
    if (!contractData) {
      return NextResponse.json({ error: "Failed to read contract data" }, { status: 500 })
    }

    // Obter contagem de mints da wallet diretamente da blockchain
    const count = await getWalletMintCount(mintProject.contractAddress, walletAddress)
    const limit = contractData.walletMintLimit

    return NextResponse.json({
      walletAddress: walletAddress.toLowerCase(),
      count: Number(count),
      limit: Number(limit),
      canMintMore: count < limit,
    })
  } catch (error) {
    console.error("Error fetching wallet count:", error)
    return NextResponse.json({ error: "Failed to fetch wallet count" }, { status: 500 })
  }
}

