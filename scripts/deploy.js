const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting contract deployment to Arc Testnet...\n");

  // Parâmetros do contrato
  const name = "Cyber Punks Genesis";
  const symbol = "CPG";
  const maxSupply = 1000;
  const mintPrice = hre.ethers.parseEther("0"); // 0 USDC (grátis)
  const walletMintLimit = 5;
  const startTime = Math.floor(Date.now() / 1000); // Agora
  const endTime = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 dias a partir de agora

  console.log("📋 Contract Parameters:");
  console.log("   Name:", name);
  console.log("   Symbol:", symbol);
  console.log("   Max Supply:", maxSupply);
  console.log("   Mint Price:", hre.ethers.formatEther(mintPrice), "USDC");
  console.log("   Wallet Limit:", walletMintLimit);
  console.log("   Start Time:", new Date(startTime * 1000).toLocaleString());
  console.log("   End Time:", new Date(endTime * 1000).toLocaleString());
  console.log("");

  // Verificar se tem private key configurada
  if (!process.env.PRIVATE_KEY) {
    console.error("❌ ERROR: PRIVATE_KEY not set in environment");
    console.log("\n💡 Set your private key:");
    console.log("   export PRIVATE_KEY='your_private_key_here'");
    process.exit(1);
  }

  console.log("📦 Deploying NFTMint contract...");

  try {
    const NFTMint = await hre.ethers.getContractFactory("NFTMint");
    const nftMint = await NFTMint.deploy(
      name,
      symbol,
      maxSupply,
      mintPrice,
      walletMintLimit,
      startTime,
      endTime
    );

    console.log("⏳ Waiting for deployment confirmation...");
    await nftMint.waitForDeployment();
    
    const address = await nftMint.getAddress();

    console.log("\n✅ Contract deployed successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📍 Contract Address:", address);
    console.log("🔗 View on ArcScan:", `https://testnet.arcscan.app/address/${address}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("💾 Next steps:");
    console.log("   1. Copy the contract address above");
    console.log("   2. Register it in the database:");
    console.log("      INSERT INTO \"MintProject\" (name, image, description, \"contractAddress\", network)");
    console.log("      VALUES ('Cyber Punks Genesis', '/cyberpunk-neon-avatar.jpg', 'Description...', '" + address + "', 'Arc Testnet');");
    console.log("\n   3. Or use Prisma Studio:");
    console.log("      npm run db:studio");
    console.log("\n   4. The app will automatically read on-chain data from this contract!");

  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error.message);
    
    if (error.message.includes("insufficient funds")) {
      console.log("\n💡 Tip: Make sure your wallet has USDC for gas fees");
      console.log("   Get testnet USDC from: https://faucet.circle.com");
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

