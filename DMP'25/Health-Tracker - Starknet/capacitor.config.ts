import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.healthtracker.app",
  appName: "Health Tracker",
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
