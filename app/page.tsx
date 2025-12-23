"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { MintGrid } from "@/components/mint-grid"
import { Footer } from "@/components/footer"
import { MintModal } from "@/components/mint-modal"
import { useWallet } from "@/lib/use-wallet"
import type { MintProject } from "@/lib/types"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"active" | "ended">("active")
  const [selectedMint, setSelectedMint] = useState<MintProject | null>(null)
  const { isConnected } = useWallet()

  const scrollToMints = () => {
    document.getElementById("mint-list")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <Hero onExploreClick={scrollToMints} />
      <div id="mint-list" className="scroll-mt-20">
        <MintGrid activeTab={activeTab} walletState={isConnected ? "connected" : "disconnected"} onMintClick={setSelectedMint} />
      </div>
      <Footer />

      {selectedMint && (
        <MintModal
          mint={selectedMint}
          walletState={isConnected ? "connected" : "disconnected"}
          onClose={() => setSelectedMint(null)}
        />
      )}
    </div>
  )
}
