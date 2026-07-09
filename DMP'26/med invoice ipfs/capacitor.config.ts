import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.aspiring.invoiceandquote",
  appName: "Medical Invoice",
  webDir: "dist",
  backgroundColor: "#f4f5f8",
  server: {
    androidScheme: "https",
  },
  plugins: {
    StatusBar: {
      // Enable edge-to-edge / immersive mode
      overlaysWebView: true,
      style: "DARK",
      // backgroundColor removed: triggers deprecated Window.setStatusBarColor on Android 15 (SDK 35).
      // Edge-to-edge transparency is handled natively by EdgeToEdge.enable() in MainActivity.
    },
  },
};

export default config;
