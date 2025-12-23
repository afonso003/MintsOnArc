"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { Clock, Users } from "lucide-react"
import type { MintProject } from "@/lib/types"
import { useEffect, useState } from "react"

interface MintCardProps {
  mint: MintProject
  onClick: () => void
}

export function MintCard({ mint, onClick }: MintCardProps) {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    if (!mint.endTime || mint.status === "ended") return

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const targetTime =
        mint.status === "upcoming" && mint.startTime ? mint.startTime.getTime() : mint.endTime.getTime()
      const distance = targetTime - now

      if (distance < 0) {
        setTimeLeft("Ended")
        clearInterval(timer)
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24))
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h`)
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`)
        } else {
          setTimeLeft(`${minutes}m`)
        }
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [mint.endTime, mint.startTime, mint.status])

  const buttonText = mint.status === "live" ? "Mint Now" : mint.status === "upcoming" ? "Coming Soon" : "View Details"

  const progress = (mint.minted / mint.supply) * 100

  return (
    <Card
      className="group bg-[var(--surface)] border-[var(--border)] hover:border-[var(--accent-secondary)]/50 hover:bg-[var(--surface-hover)] transition-all cursor-pointer overflow-hidden hover:shadow-lg hover:shadow-[var(--accent-secondary)]/10 hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="aspect-square relative overflow-hidden bg-[var(--bg2)]">
        <img
          src={mint.image || "/placeholder.svg"}
          alt={mint.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute top-3 right-3">
          <StatusBadge status={mint.status} />
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--accent-primary)] transition-colors">
            {mint.name}
          </h3>
          <p className="text-sm text-white/90 font-mono bg-[var(--bg)]/50 px-2 py-1 rounded inline-block">
            {mint.network}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/75">Price</span>
            <span className="font-semibold text-[var(--accent-tertiary)]">{mint.price}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/75 flex items-center gap-1">
                <Users className="w-4 h-4" />
                Supply
              </span>
              <span className="font-semibold">
                {mint.minted} / {mint.supply}
              </span>
            </div>
            <div className="w-full bg-[var(--bg)] rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {timeLeft && mint.status !== "ended" && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/75 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {mint.status === "upcoming" ? "Starts in" : "Ends in"}
              </span>
              <span className="font-semibold text-[var(--accent-secondary)]">{timeLeft}</span>
            </div>
          )}
        </div>

        <Button
          className={`w-full font-semibold ${
            mint.status === "live"
              ? "bg-gradient-to-r from-[var(--accent-primary)] to-[#FFB347] hover:opacity-90 text-white"
              : mint.status === "upcoming"
                ? "bg-[var(--bg2)] text-white/60 cursor-not-allowed"
                : "bg-[var(--surface-hover)] hover:bg-[var(--bg2)] text-white"
          }`}
          disabled={mint.status === "upcoming"}
        >
          {buttonText}
        </Button>
      </div>
    </Card>
  )
}
