// Simple test script to verify IPFS functionality
// Run this with: node test-ipfs.js

import { uploadJSONToIPFS, downloadFromIPFS } from "./src/utils/ipfs.js";

async function testIPFS() {
  try {
    console.log("Testing IPFS upload and download...");

    // Test data (similar to what would be saved from spreadsheet)
    const testData = {
      cells: {
        A1: { v: "Invoice #12345" },
        A2: { v: "Date: 2025-01-24" },
        A3: { v: "Customer: Test Company" },
        B3: { v: "Amount: $1000" },
      },
      meta: {
        created: new Date().toISOString(),
        filename: "test-invoice",
        version: "1.0",
      },
    };

    console.log("Uploading test data to IPFS...");
    const ipfsHash = await uploadJSONToIPFS(testData, "test-invoice");
    console.log("Upload successful! IPFS Hash:", ipfsHash);

    console.log("Downloading data from IPFS...");
    const retrievedData = await downloadFromIPFS(ipfsHash);
    console.log("Download successful!");
    console.log("Retrieved data:", JSON.stringify(retrievedData, null, 2));

    // Verify data integrity
    const originalJSON = JSON.stringify(testData);
    const retrievedJSON = JSON.stringify(retrievedData);

    if (originalJSON === retrievedJSON) {
      console.log("✅ Test PASSED: Data integrity verified!");
    } else {
      console.log("❌ Test FAILED: Data mismatch!");
      console.log("Original:", originalJSON);
      console.log("Retrieved:", retrievedJSON);
    }
  } catch (error) {
    console.error("❌ Test FAILED with error:", error.message);
    console.error("Full error:", error);

    // Check if it's a configuration issue
    if (error.message.includes("Pinata API credentials not configured")) {
      console.log("\n💡 To fix this:");
      console.log("1. Create a Pinata account at https://pinata.cloud");
      console.log("2. Get your API key and secret from the API Keys section");
      console.log("3. Add them to your .env file:");
      console.log("   VITE_PINATA_API_KEY=your_api_key_here");
      console.log("   VITE_PINATA_SECRET_KEY=your_secret_key_here");
      console.log("4. Optionally set custom gateway:");
      console.log("   VITE_PINATA_GATEWAY=https://your-custom-gateway.com");
    }
  }
}

// Run the test
testIPFS();
