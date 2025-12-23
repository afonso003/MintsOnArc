"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { MintGrid } from "@/components/mint-grid"
import { Footer } from "@/components/footer"
import { MintModal } from "@/components/mint-modal"
import type { MintProject, WalletState } from "@/lib/types"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"active" | "upcoming" | "ended">("active")
  const [walletState, setWalletState] = useState<WalletState>("disconnected")
  const [selectedMint, setSelectedMint] = useState<MintProject | null>(null)

  const handleConnectWallet = () => {
    setWalletState("connected")
  }

  const scrollToMints = () => {
    document.getElementById("mint-list")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        walletState={walletState}
        onConnectWallet={handleConnectWallet}
      />
      <Hero onExploreClick={scrollToMints} />
      <div id="mint-list" className="scroll-mt-20">
        <MintGrid activeTab={activeTab} walletState={walletState} onMintClick={setSelectedMint} />
      </div>
      <Footer />

      {selectedMint && (
        <MintModal
          mint={selectedMint}
          walletState={walletState}
          onClose={() => setSelectedMint(null)}
          onConnectWallet={handleConnectWallet}
        />
      )}
    </div>
  )
}
