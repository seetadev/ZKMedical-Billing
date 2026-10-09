const { expect } = require("chai");
const { ethers } = require("hardhat");

// Reusable zero-value proof components (MockVerifier and MockFraudVerifier accept anything)
const ZERO_PROOF = {
    pA:  [0n, 0n],
    pB:  [[0n, 0n], [0n, 0n]],
    pC:  [0n, 0n],
    fpA: [0n, 0n],
    fpB: [[0n, 0n], [0n, 0n]],
    fpC: [0n, 0n],
};
// Fraud pubSignals: score = 10 (below threshold of 75 — safe)
const SAFE_FRAUD_SIG  = [10n];
// Fraud pubSignals: score = 90 (above threshold — flagged, but MockFraudVerifier always passes)
const RISKY_FRAUD_SIG = [90n];

describe("MedicalBillingRegistry", function () {
    let registry, verifier, paymentController, fraudRegistry;
    let mockFraudVerifier, ppt;
    let owner, provider, insurer, treasury;

    beforeEach(async function () {
        [owner, provider, insurer, treasury] = await ethers.getSigners();

        // Deploy MockPPT
        const PPT = await ethers.getContractFactory("MockPPT");
        ppt = await PPT.deploy("PPT Token", "PPT", ethers.parseEther("1000000"));

        // Deploy mock verifiers (always return true)
        const MockVerifier      = await ethers.getContractFactory("MockVerifier");
        verifier                = await MockVerifier.deploy();

        const MockFraudVerifier = await ethers.getContractFactory("MockFraudVerifier");
        mockFraudVerifier       = await MockFraudVerifier.deploy();

        // Deploy FraudRegistry with mock fraud verifier
        const FR = await ethers.getContractFactory("FraudRegistry");
        fraudRegistry = await FR.deploy(await mockFraudVerifier.getAddress());

        // Deploy PPTPaymentController
        const PC = await ethers.getContractFactory("PPTPaymentController");
        paymentController = await PC.deploy(
            await ppt.getAddress(),
            treasury.address
        );

        // Deploy MedicalBillingRegistry
        const Registry = await ethers.getContractFactory("MedicalBillingRegistry");
        registry = await Registry.deploy(
            await verifier.getAddress(),
            await paymentController.getAddress(),
            await fraudRegistry.getAddress()
        );

        // Authorise registry to call collectInvoiceFee
        await paymentController.setAuthorisedCaller(await registry.getAddress(), true);

        // Fund provider with PPT and approve payment controller
        await ppt.faucet(provider.address, ethers.parseEther("1000"));
        await ppt.connect(provider).approve(
            await paymentController.getAddress(),
            ethers.parseEther("1000")
        );
    });

    // Helper: build pub signals from a fresh random commitment
    function freshPubSignals() {
        const commitment = ethers.toBigInt(ethers.randomBytes(31)); // keep under field size
        return { commitment, pubSignals: [commitment, 1n] };
    }

    async function submitValid(providerSigner = provider, cid = "bafybeitest123") {
        const { commitment, pubSignals } = freshPubSignals();
        const tx = await registry.connect(providerSigner).submitInvoice(
            ZERO_PROOF.pA, ZERO_PROOF.pB, ZERO_PROOF.pC, pubSignals,
            500000n, cid,
            ZERO_PROOF.fpA, ZERO_PROOF.fpB, ZERO_PROOF.fpC, SAFE_FRAUD_SIG
        );
        return { commitment, tx };
    }

    // ── Basic submission ──

    it("accepts a valid invoice submission", async function () {
        const { tx } = await submitValid();
        const receipt = await tx.wait();
        expect(receipt.status).to.equal(1);
    });

    it("increments totalInvoices after submission", async function () {
        expect(await registry.totalInvoices()).to.equal(0n);
        await submitValid();
        expect(await registry.totalInvoices()).to.equal(1n);
        await submitValid();
        expect(await registry.totalInvoices()).to.equal(2n);
    });

    it("stores provider address correctly", async function () {
        const { commitment } = await submitValid();
        const commitmentBytes32 = ethers.zeroPadValue(ethers.toBeHex(commitment), 32);
        const record = await registry.invoices(commitmentBytes32);
        expect(record.provider.toLowerCase()).to.equal(provider.address.toLowerCase());
    });

    // ── Duplicate rejection ──

    it("rejects duplicate invoice commitments", async function () {
        const { commitment, pubSignals: ps } = freshPubSignals();
        const pubSignals = [commitment, 1n];

        await registry.connect(provider).submitInvoice(
            ZERO_PROOF.pA, ZERO_PROOF.pB, ZERO_PROOF.pC, pubSignals,
            500000n, "bafybeitest_a",
            ZERO_PROOF.fpA, ZERO_PROOF.fpB, ZERO_PROOF.fpC, SAFE_FRAUD_SIG
        );

        await expect(
            registry.connect(provider).submitInvoice(
                ZERO_PROOF.pA, ZERO_PROOF.pB, ZERO_PROOF.pC, pubSignals,
                500000n, "bafybeitest_b",
                ZERO_PROOF.fpA, ZERO_PROOF.fpB, ZERO_PROOF.fpC, SAFE_FRAUD_SIG
            )
        ).to.be.revertedWith("Registry: duplicate invoice");
    });

    // ── Constraint validation ──

    it("rejects invoices with is_valid = 0", async function () {
        const commitment = ethers.toBigInt(ethers.randomBytes(31));
        await expect(
            registry.connect(provider).submitInvoice(
                ZERO_PROOF.pA, ZERO_PROOF.pB, ZERO_PROOF.pC,
                [commitment, 0n],   // is_valid = 0
                500000n, "bafybeitest_invalid",
                ZERO_PROOF.fpA, ZERO_PROOF.fpB, ZERO_PROOF.fpC, SAFE_FRAUD_SIG
            )
        ).to.be.revertedWith("Registry: invoice constraints not satisfied");
    });

    it("rejects submissions with empty IPFS CID", async function () {
        const commitment = ethers.toBigInt(ethers.randomBytes(31));
        await expect(
            registry.connect(provider).submitInvoice(
                ZERO_PROOF.pA, ZERO_PROOF.pB, ZERO_PROOF.pC,
                [commitment, 1n],
                500000n, "",         // empty CID
                ZERO_PROOF.fpA, ZERO_PROOF.fpB, ZERO_PROOF.fpC, SAFE_FRAUD_SIG
            )
        ).to.be.revertedWith("Registry: IPFS CID required");
    });

    // ── isVerified ──

    it("isVerified returns true for a stored invoice", async function () {
        const { commitment } = await submitValid();
        const commitmentBytes32 = ethers.zeroPadValue(ethers.toBeHex(commitment), 32);
        expect(await registry.isVerified(commitmentBytes32)).to.be.true;
    });

    it("isVerified returns false for an unknown commitment", async function () {
        const unknown = ethers.zeroPadValue("0x01", 32);
        expect(await registry.isVerified(unknown)).to.be.false;
    });

    // ── PPT fee ──

    it("transfers PPT fee to treasury on each submission", async function () {
        const before = await ppt.balanceOf(treasury.address);
        await submitValid();
        const after  = await ppt.balanceOf(treasury.address);
        expect(after - before).to.equal(ethers.parseEther("10"));
    });

    it("reverts if provider has no PPT balance", async function () {
        const [, , , , broke] = await ethers.getSigners();
        // broke has zero PPT — no approval needed since it will fail before that
        const commitment = ethers.toBigInt(ethers.randomBytes(31));
        await expect(
            registry.connect(broke).submitInvoice(
                ZERO_PROOF.pA, ZERO_PROOF.pB, ZERO_PROOF.pC,
                [commitment, 1n],
                500000n, "bafybeitest_broke",
                ZERO_PROOF.fpA, ZERO_PROOF.fpB, ZERO_PROOF.fpC, SAFE_FRAUD_SIG
            )
        ).to.be.reverted;
    });

    // ── Insurer access ──

    it("allows provider to grant insurer access", async function () {
        const { commitment } = await submitValid();
        const commitmentBytes32 = ethers.zeroPadValue(ethers.toBeHex(commitment), 32);
        await registry.connect(provider).grantInsurerAccess(commitmentBytes32, insurer.address);
        expect(await registry.insurerAccess(insurer.address, commitmentBytes32)).to.be.true;
    });

    it("allows insurer to dispute an invoice they have access to", async function () {
        const { commitment } = await submitValid();
        const commitmentBytes32 = ethers.zeroPadValue(ethers.toBeHex(commitment), 32);
        await registry.connect(provider).grantInsurerAccess(commitmentBytes32, insurer.address);
        await registry.connect(insurer).disputeInvoice(commitmentBytes32);
        expect(await registry.isVerified(commitmentBytes32)).to.be.false;
    });

    it("prevents insurer from disputing without access", async function () {
        const { commitment } = await submitValid();
        const commitmentBytes32 = ethers.zeroPadValue(ethers.toBeHex(commitment), 32);
        await expect(
            registry.connect(insurer).disputeInvoice(commitmentBytes32)
        ).to.be.revertedWith("Registry: no access");
    });

    // ── Provider invoice list ──

    it("tracks provider invoices correctly", async function () {
        await submitValid();
        await submitValid();
        const invoices = await registry.getProviderInvoices(provider.address);
        expect(invoices.length).to.equal(2);
    });

    // ── Pause ──

    it("owner can pause and unpause", async function () {
        await registry.connect(owner).pause();
        const commitment = ethers.toBigInt(ethers.randomBytes(31));
        await expect(
            registry.connect(provider).submitInvoice(
                ZERO_PROOF.pA, ZERO_PROOF.pB, ZERO_PROOF.pC,
                [commitment, 1n],
                500000n, "bafybeitest_paused",
                ZERO_PROOF.fpA, ZERO_PROOF.fpB, ZERO_PROOF.fpC, SAFE_FRAUD_SIG
            )
        ).to.be.reverted;

        await registry.connect(owner).unpause();
        const { tx } = await submitValid();
        expect((await tx.wait()).status).to.equal(1);
    });
});
