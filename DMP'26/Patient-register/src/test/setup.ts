import { webcrypto } from "node:crypto";

// jsdom's window.crypto has no SubtleCrypto; the storage layer needs it.
if (!globalThis.crypto || !globalThis.crypto.subtle) {
  Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true });
}
