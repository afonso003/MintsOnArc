"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { WalletState } from "@/lib/types"

interface NavbarProps {
  activeTab: "active" | "upcoming" | "ended"
  onTabChange: (tab: "active" | "upcoming" | "ended") => void
  walletState: WalletState
  onConnectWallet: () => void
}

export function Navbar({ activeTab, onTabChange, walletState, onConnectWallet }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-[var(--bg)]/80 backdrop-blur-xl border-b border-[var(--border)]">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
              MintsOnArc
            </h1>
          </div>

          {/* Tabs */}
          <div className="hidden md:flex items-center gap-2 bg-[var(--surface)] rounded-lg p-1">
            <button
              onClick={() => onTabChange("active")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "active"
                  ? "bg-[var(--accent-primary)] text-[var(--bg)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              Active Mints
            </button>
            <button
              onClick={() => onTabChange("upcoming")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "upcoming"
                  ? "bg-[var(--accent-primary)] text-[var(--bg)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => onTabChange("ended")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "ended"
                  ? "bg-[var(--accent-primary)] text-[var(--bg)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              Ended
            </button>
          </div>

          {/* Mobile Tabs */}
          <div className="flex md:hidden items-center gap-2">
            <select
              value={activeTab}
              onChange={(e) => onTabChange(e.target.value as "active" | "upcoming" | "ended")}
              className="bg-[var(--surface)] text-[var(--text)] px-3 py-2 rounded-lg text-sm font-medium border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-secondary)]"
            >
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="ended">Ended</option>
            </select>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="hidden sm:flex bg-[var(--surface)] text-[var(--accent-secondary)] border-[var(--accent-secondary)]/30 px-3 py-1"
            >
              Arc Testnet
            </Badge>
            <Button
              onClick={onConnectWallet}
              disabled={walletState === "connected"}
              className="bg-gradient-to-r from-[var(--accent-secondary)] to-[var(--accent-tertiary)] text-[var(--bg)] font-semibold hover:opacity-90 transition-opacity"
            >
              {walletState === "connected" ? "Connected" : "Connect Wallet"}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
