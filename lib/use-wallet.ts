"use client"

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi"
import { useConnectModal } from "@rainbow-me/rainbowkit"

export function useWallet() {
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { openConnectModal } = useConnectModal()
  const { switchChain } = useSwitchChain()
  const currentChainId = useChainId()

  const connectWallet = () => {
    if (openConnectModal) {
      openConnectModal()
    } else {
      // Fallback se modal não estiver disponível
      connect({ connector: connectors[0] })
    }
  }

  const disconnectWallet = () => {
    disconnect()
  }

  const switchToArcTestnet = async () => {
    if (currentChainId !== 5042002) {
      try {
        await switchChain({ chainId: 5042002 })
      } catch (error) {
        console.error("Failed to switch chain:", error)
      }
    }
  }

  return {
    address,
    isConnected,
    chainId,
    connectWallet,
    disconnectWallet,
    switchToArcTestnet,
    isCorrectChain: chainId === 5042002,
  }
}

