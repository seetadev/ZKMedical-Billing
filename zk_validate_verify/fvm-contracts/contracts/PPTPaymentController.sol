// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * PPTPaymentController
 *
 * Handles all billing flows using PPT token (ERC-20):
 *  - Per-invoice submission fees
 *  - Monthly subscription plans (Basic / Professional / Enterprise)
 *  - Token-gated API access check for frontend/SDK use
 *  - Fee collection for OP Medicine treasury
 */
contract PPTPaymentController is Ownable, ReentrancyGuard {

    IERC20 public immutable pptToken;

    // Fee schedule (in PPT token units, 18 decimals)
    uint256 public invoiceSubmissionFee = 10 * 1e18;    // 10 PPT per invoice
    uint256 public basicPlanFee         = 100 * 1e18;   // 100 PPT/month
    uint256 public proPlanFee           = 500 * 1e18;   // 500 PPT/month
    uint256 public enterprisePlanFee    = 2000 * 1e18;  // 2000 PPT/month

    address public treasury;

    enum Plan { None, Basic, Professional, Enterprise }

    struct Subscription {
        Plan    plan;
        uint256 expiresAt;    // unix timestamp
        uint256 invoicesUsed;
        uint256 invoiceLimit; // 0 = unlimited (Enterprise)
    }

    mapping(address => Subscription) public subscriptions;

    // Only the registry can call collectInvoiceFee()
    mapping(address => bool) public authorisedCallers;

    event FeePaid(address indexed provider, uint256 amount, string reason);
    event SubscriptionPurchased(address indexed provider, Plan plan, uint256 expiresAt);
    event FeeUpdated(string feeType, uint256 newAmount);

    modifier onlyAuthorised() {
        require(
            authorisedCallers[msg.sender] || msg.sender == owner(),
            "PPT: not authorised"
        );
        _;
    }

    constructor(address _pptToken, address _treasury) Ownable(msg.sender) {
        pptToken = IERC20(_pptToken);
        treasury = _treasury;
    }

    // ── Called by MedicalBillingRegistry before storing each invoice ──

    function collectInvoiceFee(address provider) external onlyAuthorised nonReentrant {
        Subscription storage sub = subscriptions[provider];

        if (sub.plan != Plan.None && block.timestamp < sub.expiresAt) {
            // Subscriber: check invoice quota
            if (sub.invoiceLimit > 0) {
                require(
                    sub.invoicesUsed < sub.invoiceLimit,
                    "PPT: monthly invoice limit reached"
                );
                sub.invoicesUsed++;
            }
            // Enterprise: unlimited invoices, no per-invoice charge
            return;
        }

        // Pay-per-invoice: pull fee from provider wallet
        require(
            pptToken.transferFrom(provider, treasury, invoiceSubmissionFee),
            "PPT: fee transfer failed"
        );
        emit FeePaid(provider, invoiceSubmissionFee, "invoice_submission");
    }

    // ── Subscription purchase ──

    function purchaseSubscription(Plan plan) external nonReentrant {
        require(plan != Plan.None, "PPT: invalid plan");

        uint256 fee;
        uint256 limit;

        if (plan == Plan.Basic) {
            fee   = basicPlanFee;
            limit = 50;   // 50 invoices/month
        } else if (plan == Plan.Professional) {
            fee   = proPlanFee;
            limit = 300;  // 300 invoices/month
        } else {
            fee   = enterprisePlanFee;
            limit = 0;    // unlimited
        }

        require(
            pptToken.transferFrom(msg.sender, treasury, fee),
            "PPT: subscription payment failed"
        );

        subscriptions[msg.sender] = Subscription({
            plan:         plan,
            expiresAt:    block.timestamp + 30 days,
            invoicesUsed: 0,
            invoiceLimit: limit
        });

        emit SubscriptionPurchased(msg.sender, plan, block.timestamp + 30 days);
    }

    // ── Token-gated access check (read-only, for SDK middleware) ──

    function hasActiveAccess(address provider) external view returns (bool) {
        Subscription storage sub = subscriptions[provider];
        if (sub.plan != Plan.None && block.timestamp < sub.expiresAt) {
            return true;
        }
        return pptToken.balanceOf(provider) >= invoiceSubmissionFee;
    }

    function getSubscription(address provider)
        external view
        returns (Plan plan, uint256 expiresAt, uint256 invoicesUsed, uint256 invoiceLimit)
    {
        Subscription storage sub = subscriptions[provider];
        return (sub.plan, sub.expiresAt, sub.invoicesUsed, sub.invoiceLimit);
    }

    // ── Admin ──

    function setAuthorisedCaller(address caller, bool allowed) external onlyOwner {
        authorisedCallers[caller] = allowed;
    }

    function setInvoiceFee(uint256 newFee) external onlyOwner {
        invoiceSubmissionFee = newFee;
        emit FeeUpdated("invoice_submission", newFee);
    }

    function setTreasury(address newTreasury) external onlyOwner {
        treasury = newTreasury;
    }
}
