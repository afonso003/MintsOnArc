// API Route: POST /api/mints/[id]/mint - Preparar transação de mint
// NOTA: O mint real deve ser feito pelo frontend diretamente na blockchain
// Esta API apenas valida e prepara a transação
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { canMint } from "@/lib/auth"
import { mintRateLimiter } from "@/lib/rate-limit"
import { isValidAddress, prepareMintTransaction } from "@/lib/web3"
import { getContractData, formatMintPrice } from "@/lib/blockchain"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { walletAddress } = body

    // Validações básicas
    if (!walletAddress || !isValidAddress(walletAddress)) {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 })
    }

    // Rate limiting por IP
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const rateLimitKey = `mint:${ip}:${walletAddress.toLowerCase()}`
    
    const canProceed = await mintRateLimiter.check(10, rateLimitKey)
    if (!canProceed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
    }

    // Obter projeto de mint
    const mintProject = await prisma.mintProject.findUnique({
      where: { id },
    })

    if (!mintProject) {
      return NextResponse.json({ error: "Mint project not found" }, { status: 404 })
    }

    // Verificar se pode fazer mint usando dados da blockchain
    const checkResult = await canMint(walletAddress, mintProject.contractAddress)
    if (!checkResult.canMint) {
      return NextResponse.json(
        { error: checkResult.reason || "Cannot mint at this time" },
        { status: 400 }
      )
    }

    // Obter dados do contrato
    const contractData = await getContractData(mintProject.contractAddress)
    if (!contractData) {
      return NextResponse.json({ error: "Failed to read contract data" }, { status: 500 })
    }

    // Preparar transação para o frontend assinar
    try {
      const txData = await prepareMintTransaction(mintProject.contractAddress, walletAddress)

      return NextResponse.json({
        success: true,
        contractAddress: mintProject.contractAddress,
        transaction: {
          to: txData.to,
          data: txData.data,
          value: txData.value.toString(),
        },
        price: formatMintPrice(contractData.mintPrice),
        message: "Transaction prepared. Sign with your wallet to complete the mint.",
      })
    } catch (error) {
      console.error("Error preparing transaction:", error)
      return NextResponse.json(
        { error: "Failed to prepare transaction. Please try again." },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error processing mint:", error)
    return NextResponse.json({ error: "Failed to process mint" }, { status: 500 })
  }
}

