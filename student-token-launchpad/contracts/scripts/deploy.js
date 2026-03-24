const hre = require("hardhat");

async function main() {
  const PointLedger = await hre.ethers.getContractFactory("PointLedger");
  const ledger = await PointLedger.deploy();

  await ledger.waitForDeployment();

  console.log(`PointLedger deployed to: ${await ledger.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
