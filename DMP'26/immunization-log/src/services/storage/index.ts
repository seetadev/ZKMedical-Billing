import { getSettings } from "../../utils/settings";
import { getPassphrase } from "./passphrase";
import { StorageManager } from "./manager";
import { HeliaProvider, S3Provider } from "./tornado-provider";
import { ProviderId } from "./types";

export * from "./types";
export * from "./crypto";
export * from "./passphrase";
export { StorageManager } from "./manager";
export { HeliaProvider, S3Provider } from "./tornado-provider";

const tornadoUrl = () => getSettings().tornadoUrl || "";

/** Build a manager wired to Settings. `notify` receives fallback messages (show as a toast). */
export function getStorage(notify?: (message: string) => void): StorageManager {
  return new StorageManager({
    providers: {
      helia: new HeliaProvider(tornadoUrl),
      s3: new S3Provider(tornadoUrl),
    },
    getProviderId: () => (getSettings().storageProvider || "helia") as ProviderId,
    getPassphrase,
    notify,
  });
}
