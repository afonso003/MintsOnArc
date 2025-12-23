// Web3 utilities para integração com Arc Blockchain
import { ethers } from "ethers"

// Configuração da rede Arc Testnet
export const ARC_TESTNET = {
  chainId: 5042002, // Arc Testnet Chain ID
  name: "Arc Testnet",
  rpcUrl: process.env.ARC_RPC_URL || "https://rpc.testnet.arc.network",
  wsUrl: process.env.ARC_WS_URL || "wss://rpc.testnet.arc.network",
  explorer: "https://testnet.arcscan.app",
  faucet: "https://faucet.circle.com",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18, // Gas token é USDC com 18 decimais
  },
}

// Provider para Arc Testnet
export function getArcProvider() {
  if (typeof window !== "undefined") {
    // No cliente, usar provider da wallet
    return null
  }
  
  // No servidor, usar RPC provider
  return new ethers.JsonRpcProvider(ARC_TESTNET.rpcUrl)
}

// Validar endereço de wallet
export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address)
  } catch {
    return false
  }
}

// Verificar assinatura de mensagem (para autenticação)
export async function verifySignature(
  message: string,
  signature: string,
  address: string
): Promise<boolean> {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature)
    return recoveredAddress.toLowerCase() === address.toLowerCase()
  } catch {
    return false
  }
}

// Gerar mensagem para assinatura
export function generateAuthMessage(address: string, nonce: string): string {
  return `MintsOnArc Authentication\n\nWallet: ${address}\nNonce: ${nonce}\n\nThis request will not trigger a blockchain transaction.`
}

// Interface para contrato NFT ERC721
export interface NFTContract {
  address: string
  abi: any[]
}

// Função para mint NFT (chamada do backend)
// NOTA: Em produção, o mint deve ser feito pelo frontend diretamente
// Esta função é apenas para casos especiais (mint automático com wallet privada)
export async function mintNFT(
  contractAddress: string,
  to: string,
  signer: ethers.Signer
): Promise<ethers.ContractTransactionResponse> {
  const { ERC721_ABI } = await import("./blockchain")
  const contract = new ethers.Contract(contractAddress, ERC721_ABI, signer)

  try {
    // Tentar safeMint primeiro (mais seguro) - tokenId será gerado pelo contrato
    // Se o contrato não suportar safeMint sem tokenId, tentar mint
    return await contract.safeMint(to)
  } catch {
    try {
      // Tentar mint sem tokenId (contrato gera automaticamente)
      return await contract.mint(to)
    } catch {
      // Se falhar, tentar com tokenId específico (último recurso)
      const contractData = await import("./blockchain").then((m) =>
        m.getContractData(contractAddress)
      )
      const nextTokenId = contractData ? contractData.totalSupply + 1n : 1n
      return await contract.mint(to, nextTokenId)
    }
  }
}

// Preparar transação de mint para ser assinada pelo frontend
export async function prepareMintTransaction(
  contractAddress: string,
  to: string
): Promise<{ to: string; data: string; value: bigint }> {
  const { getContractData, ERC721_ABI } = await import("./blockchain")
  const provider = getArcProvider()
  if (!provider) {
    throw new Error("Provider not available")
  }

  const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider)
  const contractData = await getContractData(contractAddress)

  if (!contractData) {
    throw new Error("Contract data not available")
  }

  // Preparar dados da transação
  const iface = new ethers.Interface(ERC721_ABI)
  const data = iface.encodeFunctionData("safeMint", [to])

  return {
    to: contractAddress,
    data,
    value: contractData.mintPrice,
  }
}

// Verificar se uma transação foi confirmada
export async function isTransactionConfirmed(txHash: string): Promise<boolean> {
  const provider = getArcProvider()
  if (!provider) return false

  try {
    const receipt = await provider.getTransactionReceipt(txHash)
    return receipt !== null && receipt.status === 1
  } catch {
    return false
  }
}

// Obter informações de uma transação
export async function getTransactionInfo(txHash: string) {
  const provider = getArcProvider()
  if (!provider) return null

  try {
    const [tx, receipt] = await Promise.all([
      provider.getTransaction(txHash),
      provider.getTransactionReceipt(txHash),
    ])

    return {
      hash: txHash,
      from: tx.from,
      to: tx.to,
      value: tx.value.toString(),
      status: receipt?.status === 1 ? "confirmed" : receipt?.status === 0 ? "failed" : "pending",
      blockNumber: receipt?.blockNumber,
      gasUsed: receipt?.gasUsed.toString(),
    }
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return null
  }
}

