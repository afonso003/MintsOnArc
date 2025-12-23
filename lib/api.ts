// Cliente API para o frontend
import type { MintProject } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

export interface ApiResponse<T> {
  data?: T
  error?: string
}

// Listar todos os projetos de mint (dados reais da blockchain)
export async function getMints(status?: "live" | "upcoming" | "ended"): Promise<MintProject[]> {
  const url = status ? `${API_BASE_URL}/mints?status=${status}` : `${API_BASE_URL}/mints`
  const response = await fetch(url, { cache: "no-store" }) // Sempre buscar dados frescos da blockchain
  
  if (!response.ok) {
    throw new Error(`Failed to fetch mints: ${response.statusText}`)
  }
  
  const data = await response.json()
  
  if (!data.mints || data.mints.length === 0) {
    return []
  }
  
  return data.mints.map((mint: any) => ({
    ...mint,
    startTime: mint.startTime ? new Date(mint.startTime) : undefined,
    endTime: mint.endTime ? new Date(mint.endTime) : undefined,
  }))
}

// Obter detalhes de um projeto de mint
export async function getMint(id: string): Promise<MintProject> {
  const response = await fetch(`${API_BASE_URL}/mints/${id}`)
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch mint")
  }
  
  const mint = data.mint
  return {
    ...mint,
    startTime: mint.startTime ? new Date(mint.startTime) : undefined,
    endTime: mint.endTime ? new Date(mint.endTime) : undefined,
  }
}

// Obter nonce para autenticação
export async function getNonce(address: string): Promise<{ nonce: string; address: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/nonce?address=${address}`)
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || "Failed to get nonce")
  }
  
  return data
}

// Verificar assinatura e autenticar
export async function verifyAuth(
  address: string,
  signature: string,
  nonce: string
): Promise<{ success: boolean; authenticated: boolean; address: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, signature, nonce }),
  })
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || "Authentication failed")
  }
  
  return data
}

// Processar mint de NFT
export async function mintNFT(
  mintId: string,
  walletAddress: string,
  signature: string,
  nonce: string
): Promise<{ success: boolean; transactionId: string; status: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/mints/${mintId}/mint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress, signature, nonce }),
  })
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || "Failed to mint NFT")
  }
  
  return data
}

// Obter contagem de mints de uma wallet
export async function getWalletMintCount(
  mintId: string,
  walletAddress: string
): Promise<{ count: number; limit: number; canMintMore: boolean }> {
  const response = await fetch(
    `${API_BASE_URL}/mints/${mintId}/wallet-count?walletAddress=${walletAddress}`
  )
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || "Failed to get wallet count")
  }
  
  return data
}

// Obter status de uma transação
export async function getTransaction(txId: string) {
  const response = await fetch(`${API_BASE_URL}/transactions/${txId}`)
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || "Failed to get transaction")
  }
  
  return data.transaction
}

