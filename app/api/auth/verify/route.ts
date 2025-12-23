// API Route: POST /api/auth/verify - Verificar assinatura e autenticar wallet
import { NextRequest, NextResponse } from "next/server"
import { authenticateWallet } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, signature, nonce } = body

    if (!address || !signature || !nonce) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const isValid = await authenticateWallet(address, signature, nonce)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      address,
    })
  } catch (error) {
    console.error("Error verifying signature:", error)
    return NextResponse.json({ error: "Failed to verify signature" }, { status: 500 })
  }
}

