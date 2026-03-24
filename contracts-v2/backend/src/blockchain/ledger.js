const { ethers } = require("ethers");

const factoryAbi = [
  "event TokenDeployed(address indexed tokenAddress, address indexed creator, string name, string symbol, uint256 initialSupply, string metadataURI)",
  "function createToken(string name, string symbol, uint256 initialSupply, string metadataURI) external returns (address)"
];

const tokenAbi = [
  "function mint(address to, uint256 amount) external",
  "function burn(uint256 amount) external"
];

let provider;
let wallet;
let campusToken;
const studentWallets = {};

async function init() {
  try {
    if (!process.env.FACTORY_ADDRESS || !process.env.PRIVATE_KEY) {
      console.log("[Blockchain] Skipped init: missing .env variables");
      return;
    }
    provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const factory = new ethers.Contract(process.env.FACTORY_ADDRESS, factoryAbi, wallet);
    
    console.log("[Blockchain] Deploying session Campus Token via Factory...");
    const tx = await factory.createToken("CampusPoints", "CPTS", 0, "");
    const receipt = await tx.wait();
    
    // Find event
    const event = receipt.logs.map(log => {
      try { return factory.interface.parseLog({ topics: [...log.topics], data: log.data }); } catch(e) { return null; }
    }).find(e => e && e.name === 'TokenDeployed');

    if (event) {
      campusToken = new ethers.Contract(event.args.tokenAddress, tokenAbi, wallet);
      console.log(`[Blockchain] ✅ CampusToken deployed at: ${event.args.tokenAddress}`);
    }
  } catch (error) {
    console.error(`[Blockchain] ⚠️ Init failed. Ensure Hardhat node is running and .env is correct. Error: ${error.message}`);
  }
}

function getWallet(srn) {
  if (!studentWallets[srn]) {
    studentWallets[srn] = ethers.Wallet.createRandom();
    console.log(`[Blockchain] Generated new abstracted wallet for ${srn}: ${studentWallets[srn].address}`);
  }
  return studentWallets[srn];
}

async function recordCredit(srn, points) {
  const student = getWallet(srn);
  if (campusToken) {
    try {
      console.log(`[Blockchain] Minting ${points} tokens to ${srn}...`);
      const tx = await campusToken.mint(student.address, points);
      await tx.wait();
      console.log(`[Blockchain] ✅ Mint successful! TX Hash: ${tx.hash}`);
    } catch(err) { console.error(`[Blockchain] Mint failed:`, err.message); }
  } else {
    console.log(`[Blockchain Mock Simulation] Credited ${points} to ${srn}`);
  }
}

async function recordDebit(srn, vendorName, points) {
  console.log(`[Blockchain] Logged Vendor Deduction: ${points} points for ${srn} at ${vendorName}`);
}

module.exports = { init, recordCredit, recordDebit, getWallet };