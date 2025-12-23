// API Route: GET /api/transactions/[txId] - Obter status de uma transação
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ txId: string }> }
) {
  try {
    const { txId } = await params

    const transaction = await prisma.mintTransaction.findUnique({
      where: { id: txId },
      include: {
        mintProject: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json({
      transaction: {
        id: transaction.id,
        status: transaction.status,
        txHash: transaction.txHash,
        tokenId: transaction.tokenId,
        walletAddress: transaction.walletAddress,
        amount: transaction.amount,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
        mintProject: transaction.mintProject,
      },
    })
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return NextResponse.json({ error: "Failed to fetch transaction" }, { status: 500 })
  }
}

