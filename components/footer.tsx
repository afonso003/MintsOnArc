import { ExternalLink } from "lucide-react"

export function Footer() {
  const links = [
    { label: "Docs", href: "https://docs.arc.network/arc/concepts/welcome-to-arc" },
    { label: "Faucet", href: "https://faucet.circle.com" },
    { label: "Explorer", href: "https://testnet.arcscan.app" },
  ]

  return (
    <footer className="bg-[var(--bg)] border-t border-[var(--border)] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div>
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
              MintsOnArc
            </h3>
            <p className="text-white/75">MintsOnArc is a testnet-only NFT launchpad.</p>
          </div>

          <div className="flex items-center justify-center gap-6 flex-wrap">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-white/75 hover:text-[var(--accent-primary)] transition-colors flex items-center gap-1 font-medium"
              >
                {link.label}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>

          <div className="pt-6 border-t border-[var(--border)]">
            <p className="text-sm text-white/60">
              <strong>Disclaimer:</strong> No real assets involved. This is a testnet launchpad for experimental
              purposes only.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
