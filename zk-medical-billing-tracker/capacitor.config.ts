import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.zkmedical.billing",
  appName: "ZK Medical Billing",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    AdMob: {
      appId: "ca-app-pub-3940256099942544~3347511713", // Test App ID - replace with your actual AdMob app ID
      testingDevices: ["2077ef9a63d2b398840261c8221a0c9b"], // Add your test device IDs
    },
  },
};

export default config;
