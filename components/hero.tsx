"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface HeroProps {
  onExploreClick: () => void
}

export function Hero({ onExploreClick }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[var(--bg)] via-[var(--bg2)] to-[var(--bg)] py-20 md:py-32">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-primary)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent-secondary)]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--accent-tertiary)]/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-[var(--surface)]/50 backdrop-blur-sm border border-[var(--border)] rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-[var(--accent-tertiary)]" />
            <span className="text-sm text-white/90">Testnet NFT Launchpad</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-balance">
            Discover. Mint.{" "}
            <span className="bg-gradient-to-r from-[var(--accent-primary)] via-[var(--accent-secondary)] to-[var(--accent-tertiary)] bg-clip-text text-transparent">
              Experiment.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto text-balance">
            A testnet launchpad for early NFT experiments.
          </p>

          <div className="pt-4">
            <Button
              size="lg"
              onClick={onExploreClick}
              className="bg-gradient-to-r from-[var(--accent-primary)] to-[#FFB347] text-white font-semibold text-lg px-8 py-6 rounded-xl hover:opacity-90 transition-all hover:scale-105"
            >
              Explore Active Mints
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
