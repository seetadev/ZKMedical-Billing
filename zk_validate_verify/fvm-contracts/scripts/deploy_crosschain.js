const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await ethers.getSigners();
    const network    = await ethers.provider.getNetwork();
    const chainId    = network.chainId;
    console.log("Deploying on chainId:", chainId.toString());
    console.log("Deployer:", deployer.address);

    const isFilecoin  = chainId === 314159n;
    const isOptimism  = chainId === 11155420n;
    const deployments = {};

    if (isFilecoin) {
        console.log("\n--- Deploying FVM contracts ---");

        const existing = JSON.parse(
            fs.readFileSync(path.join(__dirname, "../deployments/calibration.json"))
        );
        const relayerAddress = process.env.RELAYER_ADDRESS;
        if (!relayerAddress) throw new Error("RELAYER_ADDRESS env var not set");

        const Bridge = await ethers.getContractFactory("BillingBridge");
        const bridge = await Bridge.deploy(existing.pptToken, relayerAddress);
        await bridge.waitForDeployment();
        deployments.fvmBridge = await bridge.getAddress();
        console.log("BillingBridge (FVM):", deployments.fvmBridge);

        const outFile = path.join(__dirname, "../deployments/crosschain_fvm.json");
        fs.writeFileSync(outFile, JSON.stringify({
            ...deployments,
            relayer:     relayerAddress,
            deployedAt:  new Date().toISOString(),
            chainId:     chainId.toString(),
        }, null, 2));
        console.log("Saved to", outFile);
    }

    if (isOptimism) {
        console.log("\n--- Deploying Optimism contracts ---");

        const relayerAddress = process.env.RELAYER_ADDRESS;
        if (!relayerAddress) throw new Error("RELAYER_ADDRESS env var not set");

        const Mirror = await ethers.getContractFactory("PPTMirrorToken");
        const mirror = await Mirror.deploy(relayerAddress);
        await mirror.waitForDeployment();
        deployments.opMirrorToken = await mirror.getAddress();
        console.log("PPTMirrorToken (OP):", deployments.opMirrorToken);

        const Anchor = await ethers.getContractFactory("ProofAnchor");
        const anchor = await Anchor.deploy(relayerAddress);
        await anchor.waitForDeployment();
        deployments.opProofAnchor = await anchor.getAddress();
        console.log("ProofAnchor (OP):", deployments.opProofAnchor);

        const outFile = path.join(__dirname, "../deployments/crosschain_op.json");
        fs.writeFileSync(outFile, JSON.stringify({
            ...deployments,
            relayer:    relayerAddress,
            deployedAt: new Date().toISOString(),
            chainId:    chainId.toString(),
        }, null, 2));
        console.log("Saved to", outFile);
    }

    if (!isFilecoin && !isOptimism) {
        throw new Error(`Unknown network chainId: ${chainId}. Use --network calibration or --network optimismSepolia`);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
