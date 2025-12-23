// API Route: GET /api/auth/nonce - Gerar nonce para autenticação
import { NextRequest, NextResponse } from "next/server"
import { generateNonce } from "@/lib/auth"
import { isValidAddress } from "@/lib/web3"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const address = searchParams.get("address")

    if (!address || !isValidAddress(address)) {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 })
    }

    const nonce = generateNonce(address)

    return NextResponse.json({ nonce, address })
  } catch (error) {
    console.error("Error generating nonce:", error)
    return NextResponse.json({ error: "Failed to generate nonce" }, { status: 500 })
  }
}

