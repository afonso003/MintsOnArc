#!/bin/bash

# Script para configurar DATABASE_URL facilmente
# Uso: ./scripts/setup-db.sh

echo "🗄️  Database Setup for MintsOnArc"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar se .env existe
if [ ! -f .env ]; then
  echo "⚠️  .env file not found. Creating one..."
  touch .env
fi

# Verificar se DATABASE_URL já está configurado
if grep -q "DATABASE_URL" .env; then
  echo "✅ DATABASE_URL already configured in .env"
  echo ""
  echo "Current value:"
  grep "DATABASE_URL" .env | sed 's/=.*/=***/' # Não mostrar senha
  echo ""
  read -p "Do you want to update it? (y/n) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Keeping existing DATABASE_URL"
    exit 0
  fi
fi

echo "📋 Database Options:"
echo ""
echo "1. PostgreSQL (local) - postgresql://user:password@localhost:5432/mintsonarc"
echo "2. PostgreSQL (Docker) - postgresql://postgres:postgres@localhost:5432/mintsonarc"
echo "3. Supabase (cloud) - https://supabase.com"
echo "4. Neon (cloud) - https://neon.tech"
echo "5. Railway (cloud) - https://railway.app"
echo "6. Custom connection string"
echo ""
read -p "Choose option (1-6): " choice

case $choice in
  1)
    read -p "Enter PostgreSQL connection string: " db_url
    ;;
  2)
    db_url="postgresql://postgres:postgres@localhost:5432/mintsonarc"
    echo "Using: $db_url"
    ;;
  3)
    echo "Get your connection string from Supabase Dashboard > Settings > Database"
    read -p "Enter Supabase connection string: " db_url
    ;;
  4)
    echo "Get your connection string from Neon Dashboard > Connection Details"
    read -p "Enter Neon connection string: " db_url
    ;;
  5)
    echo "Get your connection string from Railway Dashboard > PostgreSQL > Connect"
    read -p "Enter Railway connection string: " db_url
    ;;
  6)
    read -p "Enter custom connection string: " db_url
    ;;
  *)
    echo "Invalid option"
    exit 1
    ;;
esac

# Remover DATABASE_URL existente se houver
sed -i '/^DATABASE_URL=/d' .env

# Adicionar nova DATABASE_URL
echo "" >> .env
echo "# Database" >> .env
echo "DATABASE_URL=\"$db_url\"" >> .env

echo ""
echo "✅ DATABASE_URL configured!"
echo ""
echo "Next steps:"
echo "  1. Run migrations: npx prisma db push"
echo "  2. Register contract: node scripts/register-contract.js"
echo "  3. Start app: npm run dev"
echo ""

