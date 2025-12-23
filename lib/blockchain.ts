// Funções para ler dados diretamente da blockchain Arc
// A blockchain é a fonte de verdade para dados on-chain
import { ethers } from "ethers"
import { getArcProvider, ARC_TESTNET } from "./web3"

// ABI padrão ERC721
export const ERC721_ABI = [
  "function totalSupply() public view returns (uint256)",
  "function maxSupply() public view returns (uint256)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function mint(address to, uint256 tokenId) public",
  "function safeMint(address to, uint256 tokenId) public",
  "function mintPrice() public view returns (uint256)",
  "function mintingActive() public view returns (bool)",
  "function walletMintLimit() public view returns (uint256)",
  "function mintedBy(address wallet) public view returns (uint256)",
  "function startTime() public view returns (uint256)",
  "function endTime() public view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
] as const

// Interface para dados de um contrato NFT
export interface NFTContractData {
  address: string
  totalSupply: bigint
  maxSupply: bigint
  mintPrice: bigint
  mintingActive: boolean
  walletMintLimit: bigint
  startTime: bigint | null
  endTime: bigint | null
}

// Obter instância do contrato NFT
export function getNFTContract(contractAddress: string): ethers.Contract | null {
  const provider = getArcProvider()
  if (!provider) return null

  try {
    return new ethers.Contract(contractAddress, ERC721_ABI, provider)
  } catch (error) {
    console.error("Error creating contract instance:", error)
    return null
  }
}

// Ler dados do contrato NFT diretamente da blockchain
export async function getContractData(contractAddress: string): Promise<NFTContractData | null> {
  const contract = getNFTContract(contractAddress)
  if (!contract) return null

  try {
    const [
      totalSupply,
      maxSupply,
      mintPrice,
      mintingActive,
      walletMintLimit,
      startTime,
      endTime,
    ] = await Promise.all([
      contract.totalSupply().catch(() => 0n),
      contract.maxSupply().catch(() => 0n),
      contract.mintPrice().catch(() => 0n),
      contract.mintingActive().catch(() => false),
      contract.walletMintLimit().catch(() => 0n),
      contract.startTime().catch(() => null),
      contract.endTime().catch(() => null),
    ])

    return {
      address: contractAddress,
      totalSupply,
      maxSupply,
      mintPrice,
      mintingActive,
      walletMintLimit,
      startTime,
      endTime,
    }
  } catch (error) {
    console.error("Error reading contract data:", error)
    return null
  }
}

// Obter quantidade de NFTs mintados por uma wallet
export async function getWalletBalance(
  contractAddress: string,
  walletAddress: string
): Promise<bigint> {
  const contract = getNFTContract(contractAddress)
  if (!contract) return 0n

  try {
    return await contract.balanceOf(walletAddress)
  } catch (error) {
    console.error("Error getting wallet balance:", error)
    return 0n
  }
}

// Obter quantidade de mints feitos por uma wallet (se o contrato suportar)
export async function getWalletMintCount(
  contractAddress: string,
  walletAddress: string
): Promise<bigint> {
  const contract = getNFTContract(contractAddress)
  if (!contract) return 0n

  try {
    // Tentar função customizada primeiro
    return await contract.mintedBy(walletAddress)
  } catch {
    // Fallback para balanceOf se não houver função customizada
    return await getWalletBalance(contractAddress, walletAddress)
  }
}

// Verificar se uma wallet pode fazer mint
export async function canWalletMint(
  contractAddress: string,
  walletAddress: string
): Promise<{ canMint: boolean; reason?: string }> {
  const contractData = await getContractData(contractAddress)
  if (!contractData) {
    return { canMint: false, reason: "Contract not found or invalid" }
  }

  // Verificar se minting está ativo
  if (!contractData.mintingActive) {
    return { canMint: false, reason: "Minting is not active" }
  }

  // Verificar supply
  if (contractData.totalSupply >= contractData.maxSupply) {
    return { canMint: false, reason: "Max supply reached" }
  }

  // Verificar limite por wallet
  const walletMintCount = await getWalletMintCount(contractAddress, walletAddress)
  if (walletMintCount >= contractData.walletMintLimit) {
    return {
      canMint: false,
      reason: `Wallet limit reached (${contractData.walletMintLimit} per wallet)`,
    }
  }

  // Verificar período de mint
  const now = BigInt(Math.floor(Date.now() / 1000))
  if (contractData.startTime && now < contractData.startTime) {
    return { canMint: false, reason: "Minting has not started yet" }
  }

  if (contractData.endTime && now > contractData.endTime) {
    return { canMint: false, reason: "Minting has ended" }
  }

  return { canMint: true }
}

// Obter preço de mint em formato legível
export function formatMintPrice(price: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals)
  const wholePart = price / divisor
  const fractionalPart = price % divisor

  if (fractionalPart === 0n) {
    return `${wholePart.toString()} USDC`
  }

  const fractionalStr = fractionalPart.toString().padStart(decimals, "0")
  const trimmedFractional = fractionalStr.replace(/0+$/, "")
  return `${wholePart.toString()}.${trimmedFractional} USDC`
}

// Obter status do mint baseado em dados on-chain
export function getMintStatus(contractData: NFTContractData | null): "live" | "upcoming" | "ended" {
  if (!contractData) return "ended"

  if (!contractData.mintingActive) return "ended"

  const now = BigInt(Math.floor(Date.now() / 1000))

  if (contractData.startTime && now < contractData.startTime) {
    return "upcoming"
  }

  if (contractData.endTime && now > contractData.endTime) {
    return "ended"
  }

  if (contractData.totalSupply >= contractData.maxSupply) {
    return "ended"
  }

  return "live"
}

// Escutar eventos de Transfer para atualizar contadores
export async function listenToMintEvents(
  contractAddress: string,
  onMint: (from: string, to: string, tokenId: bigint) => void
): Promise<() => void> {
  const provider = getArcProvider()
  if (!provider) {
    throw new Error("Provider not available")
  }

  const contract = new ethers.Contract(contractAddress, ERC721_ABI, provider)

  const filter = contract.filters.Transfer(ethers.ZeroAddress) // Apenas mints (from = 0x0)

  const listener = (from: string, to: string, tokenId: bigint) => {
    onMint(from, to, tokenId)
  }

  contract.on(filter, listener)

  // Retornar função para parar de escutar
  return () => {
    contract.off(filter, listener)
  }
}

