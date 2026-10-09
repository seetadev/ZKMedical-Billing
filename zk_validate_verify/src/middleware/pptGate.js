import { ethers } from "ethers";

const PAYMENT_CONTROLLER_ABI = [
    "function hasActiveAccess(address) view returns (bool)",
    "function subscriptions(address) view returns (uint8 plan, uint256 expiry)",
];

function getController(controllerAddress, rpcUrl) {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    return new ethers.Contract(controllerAddress, PAYMENT_CONTROLLER_ABI, provider);
}

/**
 * Express/Next.js middleware — returns 402 if caller has no active PPT access.
 *
 * Expects request header: x-wallet-address: 0x...
 */
export function requirePPTAccess(controllerAddress, rpcUrl) {
    return async (req, res, next) => {
        const walletAddress = req.headers["x-wallet-address"];

        if (!walletAddress || !ethers.isAddress(walletAddress)) {
            return res.status(400).json({ error: "Missing or invalid x-wallet-address header" });
        }

        try {
            const controller = getController(controllerAddress, rpcUrl);
            const hasAccess  = await controller.hasActiveAccess(walletAddress);

            if (!hasAccess) {
                return res.status(402).json({
                    error: "Payment required",
                    message: "Purchase a PPT subscription or approve invoice fees to access this endpoint.",
                });
            }

            req.walletAddress = walletAddress;
            next();
        } catch (err) {
            console.error("PPT gate check failed:", err);
            return res.status(500).json({ error: "PPT access check failed" });
        }
    };
}

/**
 * Stricter middleware — requires a specific minimum subscription plan.
 *
 * @param {number} minPlan - PLANS.BASIC (1), PLANS.PRO (2), or PLANS.ENTERPRISE (3)
 */
export function requireSubscription(minPlan, controllerAddress, rpcUrl) {
    return async (req, res, next) => {
        const walletAddress = req.headers["x-wallet-address"];

        if (!walletAddress || !ethers.isAddress(walletAddress)) {
            return res.status(400).json({ error: "Missing or invalid x-wallet-address header" });
        }

        try {
            const controller          = getController(controllerAddress, rpcUrl);
            const { plan, expiry }    = await controller.subscriptions(walletAddress);
            const planNum             = Number(plan);
            const now                 = Math.floor(Date.now() / 1000);

            if (planNum < minPlan || Number(expiry) < now) {
                return res.status(402).json({
                    error:          "Subscription required",
                    currentPlan:    planNum,
                    requiredPlan:   minPlan,
                    message:        `This endpoint requires plan ${minPlan} or higher.`,
                });
            }

            req.walletAddress     = walletAddress;
            req.subscriptionPlan  = planNum;
            next();
        } catch (err) {
            console.error("Subscription gate check failed:", err);
            return res.status(500).json({ error: "Subscription check failed" });
        }
    };
}
