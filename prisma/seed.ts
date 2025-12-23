// Seed script para popular o banco de dados com dados iniciais
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Limpar dados existentes
  await prisma.mintTransaction.deleteMany()
  await prisma.walletMintCount.deleteMany()
  await prisma.mintProject.deleteMany()

  // Criar projetos de mint
  // NOTA: contractAddress é OBRIGATÓRIO - você precisa fazer deploy do contrato primeiro
  // Veja scripts/deploy.md para instruções
  const mints = [
    {
      name: "Cyber Punks Genesis",
      image: "/cyberpunk-neon-avatar.jpg",
      description:
        "First generation of Cyber Punks on Arc Testnet. Experimental NFT collection featuring neon-styled avatars.",
      contractAddress: process.env.CONTRACT_ADDRESS_1 || "", // ⚠️ Configure após deploy
      network: "Arc Testnet",
      // Dados on-chain serão lidos da blockchain automaticamente
    },
    // Adicione mais projetos aqui após fazer deploy dos contratos
    // Exemplo:
    // {
    //   name: "Digital Flora",
    //   image: "/digital-plant-art-neon.jpg",
    //   description: "Generative botanical art collection...",
    //   contractAddress: "0x...", // Endereço do contrato deployado
    //   network: "Arc Testnet",
    // },
  ]

  for (const mint of mints) {
    // Pular se não tiver contractAddress configurado
    if (!mint.contractAddress) {
      console.log(`⏭️  Skipping ${mint.name} - contractAddress not configured`)
      continue
    }

    await prisma.mintProject.create({
      data: mint,
    })
  }

  console.log("\n💡 Tip: Configure CONTRACT_ADDRESS_1 no .env após fazer deploy do contrato")
  console.log("   Veja scripts/deploy.md para instruções de deploy")

  console.log(`✅ Created ${mints.length} mint projects`)
  console.log("🎉 Seeding completed!")
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

