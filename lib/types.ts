export type MintStatus = "live" | "upcoming" | "ended"
export type WalletState = "disconnected" | "connected" | "pending" | "confirmed" | "error"

export interface MintProject {
  id: string
  name: string
  image: string
  status: MintStatus
  price: string
  supply: number
  minted: number
  network: string
  startTime?: Date
  endTime?: Date
  description: string
  walletLimit: number
}
