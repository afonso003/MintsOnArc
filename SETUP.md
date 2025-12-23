# 🚀 Guia de Setup Completo - MintsOnArc

## Visão Geral

Este guia irá ajudá-lo a configurar tanto o frontend quanto o backend da aplicação MintsOnArc.

## 📦 Passo 1: Instalar Dependências

```bash
npm install
# ou
pnpm install
```

Isso instalará todas as dependências necessárias, incluindo:
- Next.js 16
- Prisma ORM
- ethers.js (Web3)
- React e componentes UI

## 🗄️ Passo 2: Configurar Banco de Dados PostgreSQL

### 2.1 Instalar PostgreSQL

**Linux (Ubuntu/Debian)**:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**macOS**:
```bash
brew install postgresql
brew services start postgresql
```

**Windows**: Baixe do site oficial: https://www.postgresql.org/download/

### 2.2 Criar Banco de Dados

```bash
# Entrar no PostgreSQL
sudo -u postgres psql
# ou
psql -U postgres

# Criar banco de dados
CREATE DATABASE mintsonarc;

# Criar usuário (opcional)
CREATE USER mintuser WITH PASSWORD 'sua_senha';
GRANT ALL PRIVILEGES ON DATABASE mintsonarc TO mintuser;

# Sair
\q
```

## 🔐 Passo 3: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/mintsonarc?schema=public"

# Arc Blockchain RPC
ARC_RPC_URL="https://rpc-testnet.arc.network"

# Environment
NODE_ENV="development"
```

**⚠️ IMPORTANTE**: Substitua `usuario` e `senha` pelas suas credenciais do PostgreSQL.

## 🗃️ Passo 4: Configurar Banco de Dados com Prisma

```bash
# 1. Gerar cliente Prisma
npm run db:generate

# 2. Aplicar schema ao banco de dados
npm run db:push

# 3. (Opcional) Popular com dados iniciais
npm run db:seed
```

Se tudo correr bem, você verá:
```
✅ Created 7 mint projects
🎉 Seeding completed!
```

## 🚀 Passo 5: Iniciar Aplicação

```bash
npm run dev
```

A aplicação estará disponível em: `http://localhost:3000`

## ✅ Verificar se Está Funcionando

### 1. Testar API Backend

Abra outro terminal e teste:

```bash
# Listar projetos de mint
curl http://localhost:3000/api/mints

# Deve retornar JSON com lista de projetos
```

### 2. Verificar Frontend

Abra o navegador em `http://localhost:3000` e você deve ver:
- Página inicial com projetos de mint
- Cards de NFT com informações
- Botões de "Mint Now"

### 3. Verificar Banco de Dados (Opcional)

```bash
# Abrir Prisma Studio (GUI visual)
npm run db:studio
```

Isso abrirá uma interface web em `http://localhost:5555` onde você pode ver e editar os dados.

## 🧪 Testando o Fluxo Completo

### 1. Conectar Wallet (Simulado)

No frontend, clique em "Connect Wallet" - isso simula a conexão.

### 2. Fazer Mint (Simulado)

1. Clique em um projeto "live"
2. Clique em "Mint NFT"
3. Aguarde 2 segundos
4. Você verá "Mint Successful!"

### 3. Verificar no Banco

```bash
npm run db:studio
```

Verifique a tabela `MintTransaction` - você deve ver a transação criada.

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Iniciar servidor de desenvolvimento

# Banco de Dados
npm run db:generate      # Gerar cliente Prisma
npm run db:push          # Aplicar schema (desenvolvimento)
npm run db:migrate       # Criar migration (produção)
npm run db:studio        # Abrir Prisma Studio
npm run db:seed          # Popular banco com dados

# Build
npm run build            # Build de produção
npm run start            # Iniciar servidor de produção
npm run lint             # Verificar código
```

## 🐛 Troubleshooting

### Erro: "Prisma Client not generated"
```bash
npm run db:generate
```

### Erro: "Can't reach database server"
- Verifique se PostgreSQL está rodando: `sudo systemctl status postgresql`
- Verifique `DATABASE_URL` no `.env`
- Teste conexão: `psql -U usuario -d mintsonarc`

### Erro: "Port 3000 already in use"
```bash
# Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9
# ou mude a porta no package.json
```

### Erro: "Module not found"
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro no Prisma: "Migration failed"
```bash
# Resetar banco (CUIDADO: apaga todos os dados!)
npx prisma migrate reset

# Ou aplicar schema novamente
npm run db:push
```

## 📚 Próximos Passos

1. ✅ Setup completo
2. ⏳ Integrar wallet real (MetaMask, WalletConnect)
3. ⏳ Conectar com contrato NFT real na Arc blockchain
4. ⏳ Adicionar autenticação por assinatura
5. ⏳ Implementar pagamento real

## 📖 Documentação Adicional

- **Backend**: Veja `BACKEND.md` para detalhes da API
- **Setup Backend**: Veja `README-BACKEND.md` para guia do backend
- **Prisma**: https://www.prisma.io/docs
- **Next.js**: https://nextjs.org/docs
- **ethers.js**: https://docs.ethers.org

## 💡 Dicas

- Use `npm run db:studio` para visualizar dados facilmente
- O modo desenvolvimento simula mints (sem blockchain real)
- Para produção, configure `contractAddress` nos projetos
- Use variáveis de ambiente para diferentes ambientes (dev/staging/prod)

## 🆘 Precisa de Ajuda?

1. Verifique os logs do servidor no terminal
2. Verifique os logs do navegador (F12 > Console)
3. Verifique o banco de dados com `db:studio`
4. Consulte a documentação em `BACKEND.md`

