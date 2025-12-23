// Script para registrar o contrato deployado no banco de dados
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const contractAddress = "0x177b3E8D4E3a4A2BFd191aaCafdae76E4444fbB2";
  
  console.log("📝 Registering contract in database...");
  console.log("   Contract Address:", contractAddress);
  
  try {
    // Verificar se já existe
    const existing = await prisma.mintProject.findUnique({
      where: { contractAddress },
    });
    
    if (existing) {
      console.log("✅ Contract already registered!");
      console.log("   Project ID:", existing.id);
      console.log("   Name:", existing.name);
      return;
    }
    
    // Criar novo projeto
    const project = await prisma.mintProject.create({
      data: {
        name: "Cyber Punks Genesis",
        image: "/cyberpunk-neon-avatar.jpg",
        description: "First generation of Cyber Punks on Arc Testnet. Experimental NFT collection featuring neon-styled avatars.",
        contractAddress: contractAddress,
        network: "Arc Testnet",
      },
    });
    
    console.log("\n✅ Contract registered successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📍 Project ID:", project.id);
    console.log("📍 Contract Address:", project.contractAddress);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    console.log("💡 Next steps:");
    console.log("   The app will automatically read on-chain data from this contract!");
    console.log("   Start the app: npm run dev");
    
  } catch (error) {
    console.error("\n❌ Error registering contract:");
    console.error(error.message);
    
    if (error.message.includes("DATABASE_URL")) {
      console.log("\n💡 Make sure DATABASE_URL is set in .env");
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

