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

  // Verificar saldo da wallet antes de deployar
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer address:", deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "USDC");
  
  if (balance === 0n) {
    console.error("\n❌ ERROR: Wallet has no balance!");
    console.log("💡 Get testnet USDC from: https://faucet.circle.com");
    process.exit(1);
  }

  console.log("\n📦 Deploying NFTMint contract...");

  try {
    const NFTMint = await hre.ethers.getContractFactory("NFTMint");
    
    // Obter fee data da rede (EIP-1559)
    const feeData = await hre.ethers.provider.getFeeData();
    
    // Arc Testnet: Taxa base mínima é 160 Gwei
    // Usar valores mais altos para garantir prioridade
    const baseFee = feeData.gasPrice || hre.ethers.parseUnits("160", "gwei");
    const maxFeePerGas = feeData.maxFeePerGas || hre.ethers.parseUnits("300", "gwei");
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || hre.ethers.parseUnits("50", "gwei");
    
    // Garantir valores mínimos conforme documentação Arc
    const minMaxFee = hre.ethers.parseUnits("200", "gwei"); // Mínimo seguro: 200 gwei
    const finalMaxFee = maxFeePerGas > minMaxFee ? maxFeePerGas : minMaxFee;
    const finalPriorityFee = maxPriorityFeePerGas || hre.ethers.parseUnits("50", "gwei");
    
    console.log("   📊 Network Fee Data:");
    console.log("      Base Fee:", hre.ethers.formatUnits(baseFee, "gwei"), "gwei");
    console.log("      Max Fee Per Gas:", hre.ethers.formatUnits(finalMaxFee, "gwei"), "gwei");
    console.log("      Max Priority Fee:", hre.ethers.formatUnits(finalPriorityFee, "gwei"), "gwei");
    console.log("   ✅ Using EIP-1559 (recommended for Arc)");
    
    console.log("\n   Sending deployment transaction...");
    const nftMint = await NFTMint.deploy(
      name,
      symbol,
      maxSupply,
      mintPrice,
      walletMintLimit,
      startTime,
      endTime,
      {
        maxFeePerGas: finalMaxFee,
        maxPriorityFeePerGas: finalPriorityFee,
        // Não usar gasPrice quando usar EIP-1559
      }
    );

    console.log("   Transaction sent! Hash:", nftMint.deploymentTransaction()?.hash);
    const txHash = nftMint.deploymentTransaction()?.hash;
    console.log("⏳ Waiting for deployment confirmation...");
    console.log("   This may take 30-120 seconds...");
    console.log("   View on ArcScan:", `https://testnet.arcscan.app/tx/${txHash}`);
    console.log("\n💡 Tip: You can check the transaction manually on ArcScan");
    console.log("   If it takes too long, you can cancel (Ctrl+C) and check later");
    
    // Aguardar confirmação com polling manual para dar mais controle
    try {
      await nftMint.waitForDeployment();
    } catch (error) {
      if (error.message.includes("timeout") || error.message.includes("time")) {
        console.log("\n⏰ Deployment taking longer than expected...");
        console.log("📋 Transaction Hash:", txHash);
        console.log("🔗 Check status manually:", `https://testnet.arcscan.app/tx/${txHash}`);
        console.log("\n💡 You can:");
        console.log("   1. Wait and check ArcScan manually");
        console.log("   2. Get contract address from ArcScan once confirmed");
        console.log("   3. Or run this script again - it will show the address if already deployed");
        process.exit(0);
      }
      throw error;
    }
    
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

