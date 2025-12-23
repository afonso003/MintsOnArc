// Autenticação e validação de wallet
import { isValidAddress, verifySignature, generateAuthMessage } from "./web3"
import { prisma } from "./db"

// Nonces temporários para autenticação (em produção, usar Redis)
const nonceStore = new Map<string, { nonce: string; expiresAt: number }>()

// Gerar nonce para autenticação
export function generateNonce(address: string): string {
  const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutos

  nonceStore.set(address.toLowerCase(), { nonce, expiresAt })

  // Limpar nonces expirados periodicamente
  setTimeout(() => {
    nonceStore.delete(address.toLowerCase())
  }, 5 * 60 * 1000)

  return nonce
}

// Verificar nonce
export function verifyNonce(address: string, nonce: string): boolean {
  const stored = nonceStore.get(address.toLowerCase())
  if (!stored) return false
  if (Date.now() > stored.expiresAt) {
    nonceStore.delete(address.toLowerCase())
    return false
  }
  return stored.nonce === nonce
}

// Autenticar wallet com assinatura
export async function authenticateWallet(
  address: string,
  signature: string,
  nonce: string
): Promise<boolean> {
  if (!isValidAddress(address)) {
    return false
  }

  if (!verifyNonce(address, nonce)) {
    return false
  }

  const message = generateAuthMessage(address, nonce)
  const isValid = await verifySignature(message, signature, address)

  if (isValid) {
    // Limpar nonce após uso
    nonceStore.delete(address.toLowerCase())
  }

  return isValid
}

// Verificar se wallet pode fazer mint usando dados da blockchain
export async function canMint(
  walletAddress: string,
  contractAddress: string
): Promise<{ canMint: boolean; reason?: string; currentCount?: number }> {
  const { canWalletMint, getWalletMintCount } = await import("./blockchain")

  const result = await canWalletMint(contractAddress, walletAddress)
  
  if (!result.canMint) {
    return result
  }

  // Obter contagem atual da blockchain
  const currentCount = await getWalletMintCount(contractAddress, walletAddress)

  return {
    canMint: true,
    currentCount: Number(currentCount),
  }
}

