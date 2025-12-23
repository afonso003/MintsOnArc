"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { X, Clock, Users, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import type { MintProject, WalletState } from "@/lib/types"

interface MintModalProps {
  mint: MintProject
  walletState: WalletState
  onClose: () => void
  onConnectWallet: () => void
}

export function MintModal({ mint, walletState, onClose, onConnectWallet }: MintModalProps) {
  const [mintState, setMintState] = useState<"idle" | "pending" | "confirmed" | "error">("idle")
  const [showDevButton, setShowDevButton] = useState(false)

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [onClose])

  const handleMint = () => {
    if (walletState !== "connected") {
      onConnectWallet()
      return
    }

    setMintState("pending")

    // Simulate mint transaction
    setTimeout(() => {
      setMintState("confirmed")
      // Reset after 3 seconds
      setTimeout(() => {
        setMintState("idle")
      }, 3000)
    }, 2000)
  }

  const simulateError = () => {
    setMintState("error")
    setTimeout(() => {
      setMintState("idle")
    }, 3000)
  }

  const progress = (mint.minted / mint.supply) * 100
  const canMint = mint.status === "live" && walletState === "connected"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <Card
        className="relative max-w-2xl w-full bg-[var(--surface)] border-[var(--border)] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-[var(--bg)]/50 hover:bg-[var(--bg)] transition-colors text-[var(--muted)] hover:text-[var(--text)] z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-[var(--bg2)]">
          <img src={mint.image || "/placeholder.svg"} alt={mint.name} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4">
            <StatusBadge status={mint.status} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">{mint.name}</h2>
            <p className="text-white/80 leading-relaxed">{mint.description}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
              <div className="text-white/75 text-sm mb-1">Price</div>
              <div className="text-2xl font-bold text-[var(--accent-tertiary)]">{mint.price}</div>
            </div>
            <div className="bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
              <div className="text-white/75 text-sm mb-1">Network</div>
              <div className="text-xl font-semibold font-mono">{mint.network}</div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-3 bg-[var(--bg)] rounded-lg p-4 border border-[var(--border)]">
            <div className="flex items-center justify-between">
              <span className="text-white/75 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Minted / Total
              </span>
              <span className="font-bold text-lg">
                {mint.minted} / {mint.supply}
              </span>
            </div>
            <div className="w-full bg-[var(--surface)] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/75 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Wallet Limit
              </span>
              <span className="font-semibold">{mint.walletLimit} per wallet</span>
            </div>
          </div>

          {/* Timestamps */}
          {(mint.startTime || mint.endTime) && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              {mint.startTime && (
                <div>
                  <div className="text-white/75 mb-1">Start Time</div>
                  <div className="font-mono text-[var(--text)]">{mint.startTime.toLocaleString()}</div>
                </div>
              )}
              {mint.endTime && (
                <div>
                  <div className="text-white/75 mb-1">End Time</div>
                  <div className="font-mono text-[var(--text)]">{mint.endTime.toLocaleString()}</div>
                </div>
              )}
            </div>
          )}

          {/* Mint Status Messages */}
          {mintState === "confirmed" && (
            <div className="flex items-center gap-3 bg-[var(--accent-tertiary)]/10 border border-[var(--accent-tertiary)]/30 rounded-lg p-4">
              <CheckCircle2 className="w-5 h-5 text-[var(--accent-tertiary)] flex-shrink-0" />
              <div>
                <div className="font-semibold text-[var(--accent-tertiary)]">Mint Successful!</div>
                <div className="text-sm text-white/75">Your NFT has been minted on testnet</div>
              </div>
            </div>
          )}

          {mintState === "error" && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <div className="font-semibold text-red-400">Mint Failed</div>
                <div className="text-sm text-white/75">Transaction was rejected or failed</div>
              </div>
            </div>
          )}

          {/* Mint Button */}
          <div className="space-y-3">
            <Button
              onClick={handleMint}
              disabled={mint.status !== "live" || mintState === "pending"}
              onDoubleClick={() => setShowDevButton(true)}
              className={`w-full h-14 text-lg font-bold ${
                mint.status === "live" && walletState === "connected"
                  ? "bg-gradient-to-r from-[var(--accent-primary)] to-[#FFB347] hover:opacity-90 text-white"
                  : "bg-[var(--bg2)] text-[var(--muted)] cursor-not-allowed"
              }`}
            >
              {mintState === "pending" ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Minting...
                </span>
              ) : walletState !== "connected" ? (
                "Connect Wallet to Mint"
              ) : mint.status === "upcoming" ? (
                "Coming Soon"
              ) : mint.status === "ended" ? (
                "Mint Ended"
              ) : (
                "Mint NFT"
              )}
            </Button>

            {/* Dev button for error simulation */}
            {showDevButton && mint.status === "live" && walletState === "connected" && (
              <Button
                onClick={simulateError}
                variant="outline"
                className="w-full text-sm text-white/75 border-red-500/30 hover:bg-red-500/10 bg-transparent"
              >
                [Dev] Simulate Error
              </Button>
            )}

            <p className="text-center text-sm text-white/60">Testnet mint. No real value.</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
