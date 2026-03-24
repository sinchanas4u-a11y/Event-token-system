const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  const TokenFactory = await hre.ethers.getContractFactory("TokenFactory");
  const factory = await TokenFactory.deploy();
  await factory.waitForDeployment();
  console.log("TokenFactory deployed to:", await factory.getAddress());

  const Distributor = await hre.ethers.getContractFactory("Distributor");
  const distributor = await Distributor.deploy();
  await distributor.waitForDeployment();
  console.log("Distributor deployed to:", await distributor.getAddress());

  console.log("\n--- SAVE THESE ADDRESSES ---");
  console.log("FACTORY_ADDRESS=" + await factory.getAddress());
  console.log("DISTRIBUTOR_ADDRESS=" + await distributor.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});