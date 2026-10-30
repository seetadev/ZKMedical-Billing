import { beforeEach, describe, expect, it } from "vitest";
import { clearPassphrase, getPassphrase, hasVerifier, setPassphrase, unlockPassphrase } from "../passphrase";

describe("passphrase", () => {
  beforeEach(() => { localStorage.clear(); clearPassphrase(); });

  it("never writes the plaintext passphrase to storage", async () => {
    await setPassphrase("correct horse battery staple");
    const dump = JSON.stringify(Object.entries(localStorage));
    expect(dump).not.toContain("correct horse");
    expect(hasVerifier()).toBe(true);
  });

  it("unlocks only with the right passphrase after a restart", async () => {
    await setPassphrase("right");
    clearPassphrase();
    expect(getPassphrase()).toBeNull();
    expect(await unlockPassphrase("wrong")).toBe(false);
    expect(getPassphrase()).toBeNull();
    expect(await unlockPassphrase("right")).toBe(true);
    expect(getPassphrase()).toBe("right");
  });
});
