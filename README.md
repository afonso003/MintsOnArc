# 🎨 MintsOnArc - NFT Mint Launchpad

Uma plataforma moderna para mint de NFTs na blockchain **Arc Testnet**.

## 🎯 O que a aplicação faz?

**MintsOnArc** é uma plataforma completa de mint de NFTs que permite:

- 📋 **Visualizar projetos de mint** - Explore diferentes coleções NFT disponíveis
- 🔍 **Filtrar por status** - Active, Upcoming, ou Ended mints
- 💼 **Conectar wallet** - Use RainbowKit para conectar MetaMask, WalletConnect, etc.
- 🎨 **Fazer mint de NFTs** - Mint NFTs diretamente na blockchain Arc Testnet
- 📊 **Ver estatísticas** - Supply, minted, preço, limite por wallet (dados on-chain)
- 🔐 **Transparência total** - Todos os dados vêm diretamente da blockchain

## 🏗️ Arquitetura

- **Blockchain-First**: Arc Testnet é a fonte de verdade para dados on-chain
- **PostgreSQL**: Cache e metadados off-chain apenas
- **Next.js 16**: Framework React com App Router
- **RainbowKit**: Conexão de wallet fácil e intuitiva
- **Wagmi + Viem**: Interação com blockchain

## 🚀 Quick Start

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mintsonarc?schema=public"

# Blockchain
ARC_RPC_URL="https://rpc.testnet.arc.network"

# WalletConnect (obtenha em https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_project_id"

# Environment
NODE_ENV="development"
```

### 3. Configurar Banco de Dados

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Iniciar Aplicação

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## 📚 Documentação

- **[SETUP.md](./SETUP.md)** - Guia completo de instalação
- **[DEPLOY.md](./DEPLOY.md)** - Como fazer deploy e entender metadata

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Verificar código

# Database
npm run db:generate  # Gerar cliente Prisma
npm run db:push      # Aplicar schema
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Popular banco
```

## 🌐 Arc Testnet

- **Chain ID**: 5042002
- **RPC**: https://rpc.testnet.arc.network
- **Explorer**: https://testnet.arcscan.app
- **Faucet**: https://faucet.circle.com
- **Gas Token**: USDC (18 decimais)

## 🎨 Features

- ✅ Conexão de wallet com RainbowKit
- ✅ Visualização de projetos de mint
- ✅ Filtros por status (Active/Upcoming/Ended)
- ✅ Dados on-chain em tempo real
- ✅ Mint direto na blockchain
- ✅ Controle de limite por wallet
- ✅ Interface moderna e responsiva

## 📦 Stack Tecnológica

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Blockchain**: Wagmi, Viem, ethers.js
- **Wallet**: RainbowKit
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma
- **UI**: Radix UI, shadcn/ui

## 🔐 Segurança

- Autenticação por assinatura de mensagem
- Validação on-chain de todas as operações
- Rate limiting
- Transações assinadas pelo usuário (não pelo backend)

## 📝 Licença

MIT

