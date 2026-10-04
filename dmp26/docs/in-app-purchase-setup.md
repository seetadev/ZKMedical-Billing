# Manual iOS & Apple App Store Connect Configuration Guide

This guide details the manual setup required on the Apple Developer Portal, App Store Connect, and Xcode to support In-App Purchases (IAP) and Subscriptions.

---

## 1. App Store Connect Product Registration

To enable purchases in the app, you must register the product identifiers on **App Store Connect**.

### Step-by-Step Registration:
1. Log in to [App Store Connect](https://appstoreconnect.apple.com/).
2. Select your App from **My Apps**.
3. In the sidebar, navigate to **In-App Purchases** -> **Manage**.
4. Click the `+` button to add new products.

### Product Mappings & Configurations:

#### A. Auto-Renewing Subscriptions
*First, create a Subscription Group (e.g. `PocketBudgetSubscriptions`) so users can upgrade/downgrade between tiers.*

*   **Monthly Subscription**
    *   **Product ID**: `com.pocketbudget.subscription.monthly`
    *   **Price**: $0.99
    *   **Subscription Period**: 1 Month
*   **Annual Subscription**
    *   **Product ID**: `com.pocketbudget.subscription.annual`
    *   **Price**: $9.99
    *   **Subscription Period**: 1 Year

#### B. Non-Consumables (One-Time Unlock)
*   **Lifetime Premium Unlock**
    *   **Product ID**: `com.pocketbudget.lifetime`
    *   **Price**: $34.99

#### C. Consumable Credit Packs
*Register these as **Consumable** so users can buy them repeatedly.*

*   **Send up to 10 PDFs**
    *   **Product ID**: `com.pocketbudget.consumable.send_10`
    *   **Price**: $0.99
*   **Send up to 25 PDFs**
    *   **Product ID**: `com.pocketbudget.consumable.send_25`
    *   **Price**: $1.99
*   **Send up to 50 PDFs**
    *   **Product ID**: `com.pocketbudget.consumable.send_50`
    *   **Price**: $2.99
*   **Send up to 100 PDFs**
    *   **Product ID**: `com.pocketbudget.consumable.send_100`
    *   **Price**: $3.99
*   **Share up to 10 PDFs**
    *   **Product ID**: `com.pocketbudget.consumable.share_10`
    *   **Price**: $0.99
*   **10 times Email, Print and Save as**
    *   **Product ID**: `com.pocketbudget.consumable.actions_10`
    *   **Price**: $0.99
*   **Email 10 PDFs via Gmail**
    *   **Product ID**: `com.pocketbudget.consumable.gmail_10`
    *   **Price**: $0.99
*   **500 times Email, Print and Save as**
    *   **Product ID**: `com.pocketbudget.consumable.actions_500`
    *   **Price**: $4.99
*   **1000 times Email, Print and Save as**
    *   **Product ID**: `com.pocketbudget.consumable.actions_1000`
    *   **Price**: $6.99

---

## 2. Local Xcode StoreKit Testing

Xcode provides a local StoreKit simulation environment allowing you to test purchases offline without setting up App Store Connect.

### Creating the Configuration File:
1. Open your project in Xcode (`ios/App/App.xcworkspace`).
2. In Xcode menu, click **File** -> **New** -> **File...**
3. Search for **StoreKit Configuration File**, select it, and click **Next**.
4. Name the file `PocketBudgetStoreKit.storekit` and save it inside your Xcode project root.
5. Open `PocketBudgetStoreKit.storekit`. Click the `+` button in the bottom left to add:
   *   **Consumable In-App Purchases** matching the product IDs listed above.
   *   **Auto-Renewing Subscriptions** matching the monthly/annual identifiers.

### Hooking StoreKit to Scheme:
1. In the Xcode scheme selector at the top, click your app name -> **Edit Scheme...**
2. Select the **Run** action on the left sidebar.
3. Select the **Options** tab at the top.
4. Locate **StoreKit Configuration** dropdown, select `PocketBudgetStoreKit.storekit`.
5. Run the application on iOS Simulator or Device. All purchase requests will redirect to Xcode's mock dialogue instead of prompting Apple ID login.

---

## 3. Apple App Store Server Notifications (V2)

In production, you should set up an App Store Server Webhook to receive real-time updates for subscription renewals, expirations, and refunds.

1. Go to App Store Connect -> Select App -> **General** -> **App Information**.
2. Scroll to the **App Store Server Notifications** section.
3. Provide your production Server Notification URL (Production & Sandbox).
4. Implement a server endpoint matching Apple's V2 JWS JSON payload format to monitor subscription states and secure account entitlements backend-side.

---

## 4. Cordova/Capacitor Purchase Plugin Integration

If you migrate from mock transactions to production live transactions, install the Capacitor purchase wrapper:

```bash
npm install cordova-plugin-purchase
npx cap sync ios
```

### Production Plugin Init Code Example:
```typescript
import "cordova-plugin-purchase";

const { store, ProductType, Platform } = window as any;

if (store) {
  // Register Subscriptions
  store.register({
    id: "com.pocketbudget.subscription.monthly",
    type: ProductType.PAID_SUBSCRIPTION,
  });

  // Register Consumables
  store.register({
    id: "com.pocketbudget.consumable.send_10",
    type: ProductType.CONSUMABLE,
  });

  // Track transaction events
  store.when()
    .approved((transaction: any) => {
      // Entitle client features
      transaction.verify();
    })
    .verified((receipt: any) => {
      receipt.finish();
    });

  // Load products
  store.initialize([Platform.APPLE_APPSTORE]);
}
```

---

## 5. Restore Purchases Flow

Apple's App Store Guidelines require a "Restore Purchases" button to allow users to regain access to previously purchased non-consumables or active subscriptions (e.g. after reinstalling the app or switching devices).

### Sandbox Simulation:
- Clicking the **Restore** button in the header triggers a StoreKit dialogue simulation.
- Under **Success** sandbox mode, it grants the user a restored "Lifetime Premium" subscription.

### Production Plugin Restore Code Example:
```typescript
const handleRestoreProduction = () => {
  if (window.store) {
    // Refresh the store and update entitlements from App Store receipts
    window.store.refresh();
    
    // Listen for finished transactions or loaded entitlements to notify the user
    setToastMessage("Checking App Store receipts for purchases...");
    setShowToast(true);
  }
};
```

