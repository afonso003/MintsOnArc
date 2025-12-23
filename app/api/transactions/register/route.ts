// API Route: POST /api/transactions/register - Registrar transação após mint
// Chamado pelo frontend após mint bem-sucedido na blockchain
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { isValidAddress } from "@/lib/web3"
import { getTransactionInfo } from "@/lib/web3"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { txHash, contractAddress, walletAddress, tokenId } = body

    if (!txHash || !contractAddress || !walletAddress) {
      return NextResponse.json(
        { error: "Missing required fields: txHash, contractAddress, walletAddress" },
        { status: 400 }
      )
    }

    if (!isValidAddress(contractAddress) || !isValidAddress(walletAddress)) {
      return NextResponse.json({ error: "Invalid address" }, { status: 400 })
    }

    // Buscar projeto pelo contractAddress
    const project = await prisma.mintProject.findUnique({
      where: { contractAddress },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found for this contract" }, { status: 404 })
    }

    // Obter informações da transação da blockchain
    const txInfo = await getTransactionInfo(txHash)

    // Verificar se transação já existe
    const existing = await prisma.mintTransaction.findUnique({
      where: { txHash },
    })

    if (existing) {
      return NextResponse.json({
        success: true,
        transaction: existing,
        message: "Transaction already registered",
      })
    }

    // Criar registro da transação
    const transaction = await prisma.mintTransaction.create({
      data: {
        mintProjectId: project.id,
        walletAddress: walletAddress.toLowerCase(),
        txHash,
        tokenId: tokenId || null,
        status: txInfo?.status || "pending",
        blockNumber: txInfo?.blockNumber ? txInfo.blockNumber.toString() : null,
      },
    })

    return NextResponse.json({
      success: true,
      transaction,
      message: "Transaction registered successfully",
    })
  } catch (error) {
    console.error("Error registering transaction:", error)
    return NextResponse.json({ error: "Failed to register transaction" }, { status: 500 })
  }
}

