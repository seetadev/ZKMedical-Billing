# App Store Review Rejection Resolution Guide — IAP & Subscriptions

**Review Submission Details:**
* **Submission ID**: `2e3d775f-ed4b-4cce-9f38-7b4072343009`
* **Review Date**: August 21, 2026
* **Version Reviewed**: `4.0 (2)`
* **Review Devices**: iPhone 17 Pro Max, iPad Air 11-inch (M3)

---

## 📋 Executive Summary of Review Issues

Apple App Review identified three key issues regarding In-App Purchases (IAP) and Subscriptions:

| Guideline | Category | Rejection Reason | Resolution Summary |
|---|---|---|---|
| **2.1(b)** | Information Needed | Reviewer could not locate the In-App Purchases within the app. | Provided exact navigation steps & reply template for App Review; ensured multiple clear paths to paywall. |
| **2.1(b)** | App Completeness | IAP products were referenced in the app but not submitted with the version in App Store Connect. | Instructions to attach IAP products/subscription group to the App Store version & upload review screenshots. |
| **3.1.2(c)** | Payments & Subscriptions | Missing functional links to Terms of Use (EULA), Privacy Policy, and required subscription disclosure metadata. | Updated `PremiumPage.tsx` and `SettingsPage.tsx` with functional links, auto-renewal disclosures, and billing intervals. |

---

## 🛠️ Code Changes Implemented

### 1. Centralized Legal Configuration (`src/config/legal.ts`)
* Created a dedicated configuration file specifying the Terms of Use (EULA) and Privacy Policy URLs.
* Default EULA points to Apple's standard Licensed Application Agreement: `https://www.apple.com/legal/internet-services/itunes/dev/stdeula/`.
* Added `openLegalUrl(url)` helper to open external legal documents reliably across Web and iOS native environments.

### 2. Premium Paywall Enhancements (`src/pages/PremiumPage.tsx` & `PremiumPage.css`)
* **Auto-Renewable Subscription Details**:
  * Clearly stated subscription title, billing cycle, and pricing:
    * **Monthly Plan**: `$0.99 / month` — *Auto-renewing monthly subscription*
    * **Annual Plan**: `$9.99 / year` — *Auto-renewing 1-year subscription*
* **Subscription Terms Disclosure Card** (Strict Apple Guideline 3.1.2(c) requirement):
  * **Payment**: Charged to Apple ID Account at confirmation of purchase.
  * **Auto-Renewal**: Automatically renews unless turned off at least 24 hours prior to current billing period end.
  * **Renewal Pricing**: Clearly lists renewal rates ($0.99/mo or $9.99/yr).
  * **Manage/Cancel**: Explains how users can manage and cancel auto-renew in App Store account settings.
* **Functional Legal Links**:
  * Added direct buttons for **Terms of Use (EULA)**, **Privacy Policy**, and **Restore Purchases** directly on the paywall screen.

---

## 📲 Step-by-Step App Store Connect Resolution

Follow these steps in **App Store Connect** before submitting the next binary build.

### Step 1: Ensure Paid Apps Agreement is Signed
1. Go to [App Store Connect](https://appstoreconnect.apple.com/).
2. In the top navigation, select **Agreements, Tax, and Banking**.
3. Under the **Agreements** tab, check the **Paid Apps** agreement.
4. If it is in `Action Needed` or `New` status, the Account Holder must accept the terms and enter valid banking/tax details. *(IAPs cannot function in production or review without this).*

---

### Step 2: Upload App Review Screenshots for IAP Products
Apple requires a screenshot of the paywall for **every** In-App Purchase product before it can be submitted for review.

1. Go to **My Apps** → Select **Pocket Budget**.
2. In the left sidebar under **Subscriptions**, click **Subscription Groups** → Select your group (e.g., `Pocket Budget Premium Subscriptions` or `PocketBudgetSubscriptions`).
3. Click on **Monthly Plan** (`com.pocketbudget.subscription.monthly`):
   * Scroll down to **App Review Information**.
   * Upload a screenshot (minimum 640 x 920 pixels, PNG/JPEG) of the in-app `PremiumPage` showing the $0.99 monthly plan.
   * Add review notes if needed: *"Accessible via Settings > Upgrade or File limits in app."*
   * Click **Save**.
4. Click on **Annual Plan** (`com.pocketbudget.subscription.annual`):
   * Scroll down to **App Review Information**.
   * Upload a screenshot showing the $9.99 annual plan.
   * Click **Save**.

---

### Step 3: Attach In-App Purchases to the App Version Submission
*(This was the main reason for rejection Guideline 2.1(b) - App Completeness).*

1. In the left sidebar, navigate to **iOS App** → Select the current draft version (e.g., **4.0** or **4.0.1**).
2. Scroll down to the section titled **In-App Purchases and Subscriptions**.
3. Click the **+** (Select In-App Purchases and Subscriptions) button.
4. Check the boxes for:
   * `com.pocketbudget.subscription.monthly`
   * `com.pocketbudget.subscription.annual`
   *(or select the whole Subscription Group).*
5. Click **Done** and then click **Save** at the top-right of the page.

---

### Step 4: Add EULA & Privacy Policy to App Store Metadata
1. In App Store Connect, go to **General** → **App Information**.
2. **Privacy Policy URL**: Ensure a functional URL is entered in the **Privacy Policy URL** field:
   `https://its-me-ani.github.io/Pocket-Budget/` (or your domain/repo URL).
3. **Terms of Use (EULA)**:
   * If using Apple's standard EULA, add the following lines at the end of the **Description** field on the App Store Version page:
     ```text
     Terms of Use (EULA): https://www.apple.com/legal/internet-services/itunes/dev/stdeula/
     Privacy Policy: https://its-me-ani.github.io/Pocket-Budget/
     ```
   * If using a custom EULA, scroll to **License Agreement** in App Information → Select **Custom** and paste your custom agreement.

---

## 💬 Ready-to-Copy Reply Template for App Review

Copy and paste the following reply directly into the **App Store Connect Resolution Center** / reply message for Submission `2e3d775f-ed4b-4cce-9f38-7b4072343009`:

```markdown
Dear Apple App Review Team,

Thank you for your review and detailed feedback. We have addressed all outstanding items regarding Guidelines 2.1(b) and 3.1.2(c):

1. Steps to Locate In-App Purchases in the App (Guideline 2.1(b)):
To locate and test the In-App Purchases, please follow any of these simple steps within the app:

Primary Entry Point:
- Launch the app and complete or skip the initial onboarding by tapping "Get Started".
- From the bottom navigation tab bar, tap the "Settings" tab (gear icon).
- Under the "Premium Membership" section at the top, tap the "Upgrade" button.
- This immediately opens the Premium Subscriptions paywall screen displaying the Monthly ($0.99/mo) and Annual ($9.99/yr) subscription tiers.

Contextual Entry Points:
- Inside the Home spreadsheet editor, tap the top-right "Share" (export) icon and select "Export as PDF" or "Email". On a free account, a prompt titled "Upgrade Required" will appear with a "Go Premium" button directing to the paywall.
- In the "Files" tab, attempting to create or save more than 1 budget file will trigger the "Upgrade Required" prompt with a direct link to the paywall.

2. In-App Purchase Products Submitted for Review (Guideline 2.1(b)):
- We have attached both auto-renewable subscription products (Product IDs: com.pocketbudget.subscription.monthly and com.pocketbudget.subscription.annual) to this version submission in App Store Connect.
- App Review screenshots illustrating the subscription paywall have been uploaded to each product's metadata in App Store Connect.
- Our Paid Apps Agreement is active and configured for testing in the Apple-provided Sandbox environment.

3. Subscription Terms, EULA, and Privacy Policy Disclosures (Guideline 3.1.2(c)):
- The Premium paywall screen (PremiumPage) now clearly displays:
  - Title and billing period of each subscription tier (Monthly Plan: 1 Month, Annual Plan: 1 Year).
  - Explicit subscription pricing ($0.99/month and $9.99/year).
  - Complete Apple StoreKit auto-renewal disclosures (payment terms, 24-hour auto-renewal policy, and account cancellation guidance).
  - Functional, tappable links to the Terms of Use (EULA), Privacy Policy, and Restore Purchases.
- The App Store metadata description and App Information fields have also been updated with functional links to our Privacy Policy and Terms of Use (EULA).

We have uploaded a new binary build with these updates and look forward to your review. Please let us know if any additional information is required.

Best regards,
Pocket Budget Development Team
```

---

## 🚀 Build, Sync & Upload Checklist for New Binary

When you are ready to upload the updated binary build (e.g., version 4.0, build 3):

1. **Verify TypeScript & Production Web Build**:
   ```bash
   npx tsc --noEmit
   npm run build
   ```
2. **Sync Native iOS Project**:
   ```bash
   npx cap sync ios
   ```
3. **Open Xcode & Increment Build Number**:
   ```bash
   npx cap open ios
   ```
   * In Xcode, select target `App` → **General** → Increment **Build** to `3` (or next sequential number).
4. **Archive & Upload**:
   * Select `Any iOS Device (arm64)` as build destination.
   * Menu: **Product** → **Archive**.
   * Click **Distribute App** → **App Store Connect** → **Upload**.
5. **Attach Build & Submit in App Store Connect**:
   * Select the newly uploaded build under the version page.
   * Verify the IAP products are attached in the "In-App Purchases and Subscriptions" section.
   * Click **Submit for Review**.
