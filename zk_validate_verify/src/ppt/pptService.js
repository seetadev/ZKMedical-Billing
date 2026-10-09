import { ethers } from "ethers";

const PPT_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function faucet() external",
];

const PAYMENT_CONTROLLER_ABI = [
    "function invoiceFee() view returns (uint256)",
    "function subscriptions(address) view returns (uint8 plan, uint256 expiry)",
    "function hasActiveAccess(address) view returns (bool)",
    "function purchaseSubscription(uint8 plan) external",
    "function BASIC_MONTHLY_FEE() view returns (uint256)",
    "function PRO_MONTHLY_FEE() view returns (uint256)",
    "function ENTERPRISE_MONTHLY_FEE() view returns (uint256)",
];

export const PLANS = {
    NONE:       0,
    BASIC:      1,   // 100 PPT/month
    PRO:        2,   // 500 PPT/month
    ENTERPRISE: 3,   // 2000 PPT/month
};

export const PLAN_NAMES = {
    [PLANS.NONE]:       "None",
    [PLANS.BASIC]:      "Basic",
    [PLANS.PRO]:        "Pro",
    [PLANS.ENTERPRISE]: "Enterprise",
};

export class PPTService {
    /**
     * @param {ethers.Signer} signer
     * @param {string} pptAddress - MockPPT contract address
     * @param {string} paymentControllerAddress - PPTPaymentController address
     */
    constructor(signer, pptAddress, paymentControllerAddress) {
        this.signer     = signer;
        this.ppt        = new ethers.Contract(pptAddress, PPT_ABI, signer);
        this.controller = new ethers.Contract(paymentControllerAddress, PAYMENT_CONTROLLER_ABI, signer);
    }

    async getBalance(address) {
        const raw = await this.ppt.balanceOf(address);
        return ethers.formatEther(raw);  // PPT has 18 decimals
    }

    async getSubscription(address) {
        const { plan, expiry } = await this.controller.subscriptions(address);
        return {
            plan:       Number(plan),
            planName:   PLAN_NAMES[Number(plan)] ?? "Unknown",
            expiry:     Number(expiry),
            expiryDate: expiry > 0 ? new Date(Number(expiry) * 1000).toLocaleDateString() : null,
        };
    }

    async hasActiveAccess(address) {
        return this.controller.hasActiveAccess(address);
    }

    async getInvoiceFee() {
        const raw = await this.controller.invoiceFee();
        return ethers.formatEther(raw);
    }

    async getAllowance(ownerAddress, spenderAddress) {
        const raw = await this.ppt.allowance(ownerAddress, spenderAddress);
        return ethers.formatEther(raw);
    }

    async approvePPT(spenderAddress, amountEther) {
        const tx = await this.ppt.approve(spenderAddress, ethers.parseEther(amountEther.toString()));
        return tx.wait();
    }

    async approveForInvoices(controllerAddress, numInvoices = 1) {
        const feeRaw     = await this.controller.invoiceFee();
        const totalNeeded = feeRaw * BigInt(numInvoices);
        const tx = await this.ppt.approve(controllerAddress, totalNeeded);
        return tx.wait();
    }

    async purchaseSubscription(plan) {
        const tx = await this.controller.purchaseSubscription(plan);
        return tx.wait();
    }

    async preflightCheck(userAddress, controllerAddress) {
        const [balance, fee, allowance, access] = await Promise.all([
            this.ppt.balanceOf(userAddress),
            this.controller.invoiceFee(),
            this.ppt.allowance(userAddress, controllerAddress),
            this.controller.hasActiveAccess(userAddress),
        ]);

        return {
            hasAccess:          access,
            balanceFormatted:   ethers.formatEther(balance),
            feeFormatted:       ethers.formatEther(fee),
            allowanceFormatted: ethers.formatEther(allowance),
            hasSufficientFunds: balance >= fee,
            hasSufficientApproval: allowance >= fee,
            canSubmit: access && balance >= fee && allowance >= fee,
        };
    }
}
