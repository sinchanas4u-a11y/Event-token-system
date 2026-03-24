# Student Token Launchpad - Run Guide

This guide explains how to start the entire Student Token Launchpad project from scratch. You will need **three separate PowerShell windows** running simultaneously.

## Step 1: Start the Local Blockchain Node
This terminal will run the Hardhat network. It acts as our local testing blockchain.

1. Open your **1st PowerShell window**.
2. Navigate to your project folder:
   ```powershell
   cd C:\Users\sinch\Desktop\StudentLaunchpad\contracts-v2
   ```
3. Start the node:
   ```powershell
   npx hardhat node
   ```
*(Leave this window open and running. Do not press Ctrl+C.)*

---

## Step 2: Deploy the Smart Contracts & Save Addresses
Now we need to deploy our Token Factory and Distributor contracts to the local node we just started.

1. Open your **2nd PowerShell window**.
2. Navigate to the project folder:
   ```powershell
   cd C:\Users\sinch\Desktop\StudentLaunchpad\contracts-v2
   ```
3. Run the deployment script:
   ```powershell
   npx hardhat run scripts/deploy.js --network localhost
   ```
4. **Important:** When the deployment finishes, it will print two addresses: `FACTORY_ADDRESS` and `DISTRIBUTOR_ADDRESS`. 
5. Open the `.env` files located in your `backend/` and `frontend/` folders and update those addresses with the newly generated ones. (Note: The default local Hardhat node private key `0xac09...` will always remain the same).

---

## Step 3: Start the Backend Server
The backend handles our API and acts as the bridge to the blockchain.
*(You can use the same 2nd PowerShell window for this since the deployment script in Step 2 finished).*

1. In your **2nd PowerShell window**, navigate into the backend folder:
   ```powershell
   cd C:\Users\sinch\Desktop\StudentLaunchpad\contracts-v2\backend
   ```
2. Start the development server:
   ```powershell
   npm run dev
   ```
*(You should see `Server running on port 3001`. Leave this window open and running.)*

---

## Step 4: Start the Frontend Application
The frontend is the UI for the Admin, Students, and Vendors.

1. Open a **3rd PowerShell window**.
2. Navigate into the frontend folder:
   ```powershell
   cd C:\Users\sinch\Desktop\StudentLaunchpad\contracts-v2\frontend
   ```
3. Start the React development server:
   ```powershell
   npm run dev
   ```
4. Once it starts, it will provide a local link (e.g., `http://localhost:5173` or `http://localhost:3000`). `Ctrl + Click` that link or paste it into your browser to view the Launchpad interface!

---

### Troubleshooting
- **ECONNREFUSED Error in Backend or Deploy Script:** You forgot to keep Terminal 1 running (`npx hardhat node`).
- **Contract Calls Failing:** Double check that your `.env` addresses match the ones generated in Step 2. *Important:* If you ever close Terminal 1 and restart the Hardhat node, you **must** run Step 2 again to deploy new contracts, and copy the new addresses to your `.env` files!
