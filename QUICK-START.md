# 🚀 Quick Start - MintsOnArc

## ✅ Contrato Deployado

O contrato NFT já está deployado na Arc Testnet:
- **Endereço**: `0x177b3E8D4E3a4A2BFd191aaCafdae76E4444fbB2`
- **ArcScan**: https://testnet.arcscan.app/address/0x177b3E8D4E3a4A2BFd191aaCafdae76E4444fbB2

## 🎯 Opção 1: Usar SEM Banco de Dados (Mais Rápido)

A aplicação funciona **sem banco de dados** usando dados do contrato deployado:

```bash
# 1. Configure o endereço do contrato no .env
echo "CONTRACT_ADDRESS_1=0x177b3E8D4E3a4A2BFd191aaCafdae76E4444fbB2" >> .env

# 2. Inicie a aplicação
npm run dev
```

A aplicação vai:
- ✅ Ler dados on-chain diretamente da blockchain
- ✅ Usar metadados hardcoded do contrato deployado
- ✅ Permitir mint de NFTs reais

## 🗄️ Opção 2: Usar COM Banco de Dados (Recomendado para Produção)

Para usar com banco de dados (cache e metadados off-chain):

### 1. Configurar Banco de Dados

```bash
# Opção A: Script interativo
./scripts/setup-db.sh

# Opção B: Manualmente no .env
echo 'DATABASE_URL="postgresql://user:password@localhost:5432/mintsonarc"' >> .env
```

### 2. Criar Schema no Banco

```bash
npx prisma db push
```

### 3. Registrar Contrato no Banco

```bash
node scripts/register-contract.js
```

### 4. Iniciar Aplicação

```bash
npm run dev
```

## 🔧 Variáveis de Ambiente Necessárias

Mínimo necessário (sem banco):
```env
CONTRACT_ADDRESS_1=0x177b3E8D4E3a4A2BFd191aaCafdae76E4444fbB2
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=seu_project_id_aqui
```

Com banco:
```env
DATABASE_URL=postgresql://...
CONTRACT_ADDRESS_1=0x177b3E8D4E3a4A2BFd191aaCafdae76E4444fbB2
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=seu_project_id_aqui
```

## 🐛 Problemas Comuns

### Erro: "DATABASE_URL not found"
**Solução**: Use a Opção 1 (sem banco) ou configure DATABASE_URL com `./scripts/setup-db.sh`

### Erro: "WalletConnect Core is already initialized"
**Solução**: Já corrigido! Se ainda aparecer, reinicie o servidor de desenvolvimento.

### Transações não aparecem no ArcScan
**Solução**: Verifique se está usando gas price adequado (EIP-1559 com 200+ gwei)

## 📚 Próximos Passos

1. ✅ Contrato deployado
2. ✅ Aplicação funcionando (com ou sem banco)
3. 🔄 Conectar wallet e fazer mint de teste
4. 🔄 Verificar NFTs mintados no ArcScan

