import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "io.ionic.starter",
  appName: "Govt Invoice",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    Camera: {
      android: {
        // Request runtime permissions for camera and gallery access
        requestPermissions: true,
      },
    },
  },
};

export default config;
