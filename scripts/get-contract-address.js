// Script para obter endereço do contrato após deploy
// Uso: node scripts/get-contract-address.js <txHash>
const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
  const txHash = process.argv[2];
  
  if (!txHash) {
    console.error("❌ Please provide transaction hash");
    console.log("\nUsage:");
    console.log("  node scripts/get-contract-address.js <txHash>");
    console.log("\nExample:");
    console.log("  node scripts/get-contract-address.js 0x5b90feb39d79541f8a37857e6c1ff9760f2e65bc313703457ef16c4293296665");
    process.exit(1);
  }

  console.log("🔍 Checking transaction:", txHash);
  console.log("🔗 ArcScan: https://testnet.arcscan.app/tx/" + txHash);
  console.log("");
  
  const provider = new ethers.JsonRpcProvider("https://rpc.testnet.arc.network");
  
  try {
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      console.log("⏳ Transaction not yet confirmed. Please wait...");
      console.log("\n💡 This is normal - transactions can take 30-120 seconds");
      console.log("   Keep checking the ArcScan link above");
      process.exit(0);
    }

    if (receipt.status === 0) {
      console.error("❌ Transaction failed!");
      process.exit(1);
    }

    // O endereço do contrato está em receipt.contractAddress
    const contractAddress = receipt.contractAddress;
    
    if (!contractAddress) {
      console.error("❌ No contract address found in receipt");
      process.exit(1);
    }
    
    console.log("✅ Contract deployed successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📍 Contract Address:", contractAddress);
    console.log("🔗 View on ArcScan:", `https://testnet.arcscan.app/address/${contractAddress}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("💾 Next step: Register in database");
    console.log("\nVia Prisma Studio:");
    console.log("  npm run db:studio");
    console.log("\nOr via SQL:");
    console.log(`  INSERT INTO "MintProject" (name, image, description, "contractAddress", network)`);
    console.log(`  VALUES ('Cyber Punks Genesis', '/cyberpunk-neon-avatar.jpg', 'First generation...', '${contractAddress}', 'Arc Testnet');`);
    
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

