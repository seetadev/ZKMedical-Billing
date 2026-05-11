const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying MockPPT from:", deployer.address);

    const MockPPT = await ethers.getContractFactory("MockPPT");
    const ppt = await MockPPT.deploy(
        "Prescription Payment Token",
        "PPT",
        ethers.parseEther("1000000")  // 1M PPT initial supply to deployer
    );
    await ppt.waitForDeployment();
    const addr = await ppt.getAddress();

    console.log("MockPPT deployed:", addr);
    console.log("\nAdd to your .env:");
    console.log(`PPT_TOKEN_ADDRESS=${addr}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
