// @vitest-environment node
import { describe, expect, it } from "vitest";
import { decrypt, encrypt, isEncryptedPayload } from "../crypto";
import { decrypt as refDecrypt, encrypt as refEncrypt } from "../../../test/fixtures/meshkit-crypto.ref";

const text = (s: string) => new TextEncoder().encode(s);
const str = (u: Uint8Array) => new TextDecoder().decode(u);
const FAST = 1_000; // keep PBKDF2 cheap in tests; the wire format is identical

describe("EMSH encryption", () => {
  it("round-trips", async () => {
    const blob = await encrypt(text("SocialCalc sheet ✓"), { password: "pw", iterations: FAST });
    expect(str(await decrypt(blob, "pw"))).toBe("SocialCalc sheet ✓");
  });

  it("round-trips an empty payload", async () => {
    const blob = await encrypt(new Uint8Array(0), { password: "pw", iterations: FAST });
    expect(blob.length).toBe(53);
    expect((await decrypt(blob, "pw")).length).toBe(0);
  });

  it("writes the documented header", async () => {
    const blob = await encrypt(text("x"), { password: "pw", iterations: 5000 });
    expect([...blob.slice(0, 4)]).toEqual([0x45, 0x4d, 0x53, 0x48]);
    expect(blob[4]).toBe(1);
    expect(new DataView(blob.buffer).getUint32(5, false)).toBe(5000);
    expect(blob.length).toBe(37 + 1 + 16);
    expect(isEncryptedPayload(blob)).toBe(true);
  });

  it("uses fresh salt and nonce each call", async () => {
    const a = await encrypt(text("same"), { password: "pw", iterations: FAST });
    const b = await encrypt(text("same"), { password: "pw", iterations: FAST });
    expect(a).not.toEqual(b);
  });

  it("rejects a wrong passphrase, tampering and non-EMSH data", async () => {
    const blob = await encrypt(text("secret"), { password: "pw", iterations: FAST });
    await expect(decrypt(blob, "nope")).rejects.toThrow(/wrong passphrase/);
    const tampered = blob.slice();
    tampered[tampered.length - 1] ^= 1;
    await expect(decrypt(tampered, "pw")).rejects.toThrow(/wrong passphrase/);
    await expect(decrypt(text("plain json"), "pw")).rejects.toThrow(/not an encrypted/);
  });

  it("rejects an unsafe iteration count in a crafted header", async () => {
    const blob = await encrypt(text("x"), { password: "pw", iterations: FAST });
    new DataView(blob.buffer).setUint32(5, 0xffffffff, false);
    await expect(decrypt(blob, "pw")).rejects.toThrow(/unsafe iteration/);
  });

  it("rejects a zero iteration count in a crafted header with a StorageError", async () => {
    const blob = await encrypt(text("x"), { password: "pw", iterations: FAST });
    new DataView(blob.buffer).setUint32(5, 0, false);
    await expect(decrypt(blob, "pw")).rejects.toMatchObject({ kind: "crypto" });
  });

  it("rejects empty passphrase and low iteration counts", async () => {
    await expect(encrypt(text("x"), { password: "" })).rejects.toThrow();
    await expect(encrypt(text("x"), { password: "pw", iterations: 10 })).rejects.toThrow();
  });
});

describe("cross-compat with meshkit0 crypto.ts", () => {
  it("our ciphertext decrypts with meshkit's decrypt", async () => {
    const blob = await encrypt(text("ours → theirs"), { password: "shared", iterations: FAST });
    expect(str(await refDecrypt(blob, "shared"))).toBe("ours → theirs");
  });

  it("meshkit's ciphertext decrypts with ours", async () => {
    const blob = await refEncrypt(text("theirs → ours"), { password: "shared", iterations: FAST });
    expect(str(await decrypt(blob, "shared"))).toBe("theirs → ours");
  });

  it("agrees at the default iteration count", async () => {
    const blob = await encrypt(text("default iters"), { password: "shared" });
    expect(new DataView(blob.buffer).getUint32(5, false)).toBe(200_000);
    expect(str(await refDecrypt(blob, "shared"))).toBe("default iters");
  });
});
