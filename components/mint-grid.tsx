"use client"

import { useEffect, useState } from "react"
import { MintCard } from "@/components/mint-card"
import { getMints } from "@/lib/api"
import type { MintProject, WalletState } from "@/lib/types"

interface MintGridProps {
  activeTab: "active" | "ended"
  walletState: WalletState
  onMintClick: (mint: MintProject) => void
}

export function MintGrid({ activeTab, walletState, onMintClick }: MintGridProps) {
  const [mints, setMints] = useState<MintProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMints() {
      try {
        setLoading(true)
        const allMints = await getMints()
        setMints(allMints)
      } catch (error) {
        console.error("Error fetching mints:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchMints()
  }, [])

  const filteredMints = mints.filter((mint) => {
    if (activeTab === "active") return mint.status === "live"
    if (activeTab === "ended") return mint.status === "ended"
    return false
  })

  const title = activeTab === "active" ? "Active Mints" : "Ended Mints"
  
  // Centralizar quando há apenas 1 mint ativo
  const isSingleActiveMint = activeTab === "active" && filteredMints.length === 1

  return (
    <section className="py-16 bg-[var(--bg2)]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">{title}</h2>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-[var(--muted)] text-lg">Loading mints from blockchain...</p>
          </div>
        ) : filteredMints.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--muted)] text-lg">No mints found in this category.</p>
            <p className="text-[var(--muted)] text-sm mt-2">
              Deploy a contract and register it in the database to see it here.
            </p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-6 ${
            isSingleActiveMint 
              ? "md:grid-cols-1 max-w-md mx-auto" 
              : "md:grid-cols-2 lg:grid-cols-3"
          }`}>
            {filteredMints.map((mint) => (
              <MintCard key={mint.id} mint={mint} onClick={() => onMintClick(mint)} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
