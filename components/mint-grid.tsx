"use client"

import { mockMints } from "@/lib/mock-data"
import { MintCard } from "@/components/mint-card"
import type { MintProject, WalletState } from "@/lib/types"

interface MintGridProps {
  activeTab: "active" | "upcoming" | "ended"
  walletState: WalletState
  onMintClick: (mint: MintProject) => void
}

export function MintGrid({ activeTab, walletState, onMintClick }: MintGridProps) {
  const filteredMints = mockMints.filter((mint) => {
    if (activeTab === "active") return mint.status === "live"
    if (activeTab === "upcoming") return mint.status === "upcoming"
    if (activeTab === "ended") return mint.status === "ended"
    return false
  })

  const title = activeTab === "active" ? "Active Mints" : activeTab === "upcoming" ? "Upcoming Mints" : "Ended Mints"

  return (
    <section className="py-16 bg-[var(--bg2)]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">{title}</h2>

        {filteredMints.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--muted)] text-lg">No mints found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMints.map((mint) => (
              <MintCard key={mint.id} mint={mint} onClick={() => onMintClick(mint)} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
