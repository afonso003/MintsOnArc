# 🎨 MintsOnArc - NFT Mint Launchpad

A modern platform for minting NFTs on the **Arc Testnet** blockchain.

## 🎯 What the application does

**MintsOnArc** is a complete NFT minting platform that allows you to:

- 📋 **View mint projects** – Explore different NFT collections available  
- 🔍 **Filter by status** – Active, Upcoming, or Ended mints  
- 💼 **Connect wallet** – Use RainbowKit to connect MetaMask, WalletConnect, etc.  
- 🎨 **Mint NFTs** – Mint NFTs directly on the Arc Testnet blockchain  
- 📊 **View statistics** – Supply, minted count, price, wallet limits (on-chain data)  
- 🔐 **Full transparency** – All data comes directly from the blockchain  

## 🏗️ Architecture

- **Blockchain-First**: Arc Testnet is the source of truth for on-chain data  
- **PostgreSQL**: Off-chain cache and metadata only  
- **Next.js 16**: React framework with App Router  
- **RainbowKit**: Easy and intuitive wallet connection  
- **Wagmi + Viem**: Blockchain interaction  

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
2. Configure Environment Variables
Create a .env file:

env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mintsonarc?schema=public"

# Blockchain
ARC_RPC_URL="https://rpc.testnet.arc.network"

# WalletConnect (get it from https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_project_id"

# Environment
NODE_ENV="development"
3. Configure Database
bash
npm run db:generate
npm run db:push
npm run db:seed
4. Start Application
bash
npm run dev
Access: http://localhost:3000

📚 Documentation
SETUP.md – Complete installation guide

DEPLOY.md – How to deploy and understand metadata

🔧 Available Scripts
bash
npm run dev          # Development
npm run build        # Production build
npm run start        # Production server
npm run lint         # Code linting

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Apply schema
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database
🌐 Arc Testnet
Chain ID: 5042002

RPC: https://rpc.testnet.arc.network

Explorer: https://testnet.arcscan.app

Faucet: https://faucet.circle.com

Gas Token: USDC (18 decimals)

🎨 Features
✅ Wallet connection with RainbowKit

✅ View mint projects

✅ Filter by status (Active/Upcoming/Ended)

✅ Real-time on-chain data

✅ Mint directly on the blockchain

✅ Wallet limit control

✅ Modern and responsive interface

📦 Tech Stack
Frontend: Next.js 16, React 19, Tailwind CSS

Blockchain: Wagmi, Viem, ethers.js

Wallet: RainbowKit

Backend: Next.js API Routes

Database: PostgreSQL + Prisma

UI: Radix UI, shadcn/ui

🔐 Security
Authentication via message signature

On-chain validation of all operations

Rate limiting

Transactions signed by the user (not the backend)

📝 License
MIT

