# 🚀 Deploy do Contrato NFT

## Como Fazer Deploy

Você já tem a `PRIVATE_KEY` no `.env`. O Hardhat agora lê automaticamente do `.env`.

Execute:

```bash
npx hardhat run scripts/deploy.js --network arcTestnet
```

O script vai:
1. ✅ Compilar o contrato
2. ✅ Fazer deploy na Arc Testnet
3. ✅ Mostrar o endereço do contrato
4. ✅ Dar instruções para registrar no banco

## 📋 O que acontece no Deploy

O contrato é deployado com estes parâmetros:
- **Name**: "Cyber Punks Genesis"
- **Symbol**: "CPG"
- **Max Supply**: 1000 NFTs
- **Mint Price**: 0 USDC (grátis)
- **Wallet Limit**: 5 NFTs por wallet
- **Start Time**: Agora
- **End Time**: 30 dias a partir de agora

## 📝 Após o Deploy

Você receberá um endereço como `0x1234...`. Registre no banco:

**Via Prisma Studio:**
```bash
npm run db:studio
```
- Crie novo registro em "MintProject"
- Preencha: name, image, description, **contractAddress** (o endereço do deploy)

---

# 🖼️ Metadata e Imagens dos NFTs

## Como Funciona a Metadata

### 1. **No Contrato (On-Chain)**

O contrato tem uma função `tokenURI(tokenId)` que retorna:
```
https://api.mintsonarc.com/metadata/{tokenId}
```

Exemplo:
- Token ID 1 → `https://api.mintsonarc.com/metadata/1`
- Token ID 42 → `https://api.mintsonarc.com/metadata/42`

### 2. **API de Metadata (Off-Chain)**

Você precisa criar uma API que retorna JSON com metadata:

**GET** `/api/metadata/{tokenId}` deve retornar:
```json
{
  "name": "Cyber Punks Genesis #1",
  "description": "First generation of Cyber Punks...",
  "image": "https://seu-dominio.com/images/nft-1.jpg",
  "attributes": [
    { "trait_type": "Generation", "value": "Genesis" },
    { "trait_type": "Rarity", "value": "Common" }
  ]
}
```

### 3. **Onde Está a Imagem?**

A imagem **NÃO está na blockchain**. Ela está:
- ✅ No servidor (pasta `public/images/`)
- ✅ Ou em IPFS/Arweave (descentralizado)
- ✅ Ou em CDN (rápido)

O contrato apenas aponta para a URL da imagem via metadata JSON.

## 🔄 Fluxo Completo

```
1. Usuário faz mint
   ↓
2. Contrato cria NFT com tokenId (ex: 42)
   ↓
3. Wallet/marketplace chama tokenURI(42)
   ↓
4. Contrato retorna: "https://api.mintsonarc.com/metadata/42"
   ↓
5. API retorna JSON com imagem e atributos
   ↓
6. Frontend mostra NFT com imagem
```

## 📁 Estrutura Recomendada

```
public/
  images/
    cyber-punks/
      1.jpg
      2.jpg
      ...
      1000.jpg

app/api/
  metadata/
    [tokenId]/
      route.ts  ← Criar esta API
```

## 🎨 Criar API de Metadata

Crie `app/api/metadata/[tokenId]/route.ts`:

```typescript
export async function GET(request, { params }) {
  const { tokenId } = params
  
  // Buscar metadata do banco ou gerar
  return Response.json({
    name: `Cyber Punks Genesis #${tokenId}`,
    description: "...",
    image: `https://seu-dominio.com/images/cyber-punks/${tokenId}.jpg`,
    attributes: [...]
  })
}
```

## 💡 Resumo

- **Contrato**: Apenas armazena tokenId e retorna URL da metadata
- **Metadata**: JSON com nome, descrição, imagem, atributos
- **Imagem**: Arquivo físico no servidor/IPFS/CDN
- **API**: Serve o JSON quando solicitado

A blockchain não armazena imagens (seria muito caro). Ela apenas referencia onde encontrar a metadata!

## ✅ Sobre as Imagens

**SIM, as mesmas imagens do mockup são usadas!**

- ✅ Imagens estão em `public/` (ex: `/cyberpunk-neon-avatar.jpg`)
- ✅ API de metadata retorna essas mesmas imagens
- ✅ Todos os NFTs de um projeto usam a mesma imagem do projeto
- ✅ Em produção, você pode ter imagens individuais por tokenId

A API `/api/metadata/[tokenId]` foi criada e usa as imagens de `public/`.

## ⚠️ Se o Deploy Travar

Se o script travar em "Waiting for deployment confirmation...":

### Opção 1: Aguardar
- Normalmente leva 30-120 segundos
- Acompanhe no ArcScan (link é mostrado)

### Opção 2: Verificar Manualmente
Se cancelar (Ctrl+C), você pode verificar depois:

```bash
node scripts/get-contract-address.js <txHash>
```

Exemplo:
```bash
node scripts/get-contract-address.js 0x5b90feb39d79541f8a37857e6c1ff9760f2e65bc313703457ef16c4293296665
```

Este script vai:
- ✅ Verificar se a transação foi confirmada
- ✅ Mostrar o endereço do contrato quando pronto
- ✅ Dar instruções para registrar no banco

### Troubleshooting

1. **Transação não encontrada no ArcScan**: Normal, pode levar alguns minutos para indexar
2. **Saldo insuficiente**: Obtenha USDC em https://faucet.circle.com
3. **Timeout**: Use o script `get-contract-address.js` para verificar depois
