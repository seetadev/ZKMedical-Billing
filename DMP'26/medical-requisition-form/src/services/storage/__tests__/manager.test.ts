import { describe, expect, it, vi } from "vitest";
import { StorageManager } from "../manager";
import { isEncryptedPayload } from "../crypto";
import { ProviderId, StorageError, StorageProvider } from "../types";

const fake = (id: ProviderId, over: Partial<StorageProvider> = {}): StorageProvider & { saved: Uint8Array[] } => {
  const saved: Uint8Array[] = [];
  return {
    id,
    saved,
    testConnection: vi.fn(async () => true),
    save: vi.fn(async (_n: string, d: Uint8Array) => (saved.push(d), `${id}-cid`)),
    load: vi.fn(async () => saved[0]),
    list: vi.fn(async () => []),
    ...over,
  } as any;
};

const text = (s: string) => new TextEncoder().encode(s);
const down = () => new StorageError("unreachable", "down", 502);

function setup(selected: ProviderId, overrides: Partial<Record<ProviderId, Partial<StorageProvider>>> = {}, pass: string | null = "pw") {
  const providers = { helia: fake("helia", overrides.helia), s3: fake("s3", overrides.s3), pinata: fake("pinata", { plaintext: true, ...overrides.pinata }) };
  const notify = vi.fn();
  const mgr = new StorageManager({ providers, getProviderId: () => selected, getPassphrase: () => pass, notify });
  return { providers, notify, mgr };
}

describe("StorageManager", () => {
  it("encrypts before save and decrypts after load (helia)", async () => {
    const { mgr, providers } = setup("helia");
    const r = await mgr.save("n", text("patient: Jane Doe"));
    expect(r).toEqual({ id: "helia-cid", provider: "helia", fellBack: false });
    const stored = providers.helia.saved[0];
    expect(isEncryptedPayload(stored)).toBe(true);
    expect(new TextDecoder().decode(stored)).not.toContain("Jane Doe");
    const loaded = await mgr.load("helia-cid");
    expect(new TextDecoder().decode(loaded.data)).toBe("patient: Jane Doe");
  });

  it("works the same with S3 selected", async () => {
    const { mgr, providers } = setup("s3");
    await mgr.save("n", text("hello"));
    expect(isEncryptedPayload(providers.s3.saved[0])).toBe(true);
    expect(providers.helia.save).not.toHaveBeenCalled();
    expect(new TextDecoder().decode((await mgr.load("s3-cid")).data)).toBe("hello");
  });

  it("falls back to S3 with a visible notice when Helia is unreachable", async () => {
    const { mgr, providers, notify } = setup("helia", { helia: { save: vi.fn(async () => { throw down(); }) } });
    const r = await mgr.save("n", text("data"));
    expect(r).toEqual({ id: "s3-cid", provider: "s3", fellBack: true });
    expect(notify).toHaveBeenCalledWith(expect.stringMatching(/Helia is unreachable.*S3/));
    expect(isEncryptedPayload(providers.s3.saved[0])).toBe(true);
  });

  it("falls back on load too", async () => {
    const { mgr, providers, notify } = setup("helia", { helia: { load: vi.fn(async () => { throw down(); }) } });
    await mgr.save("n", text("x")); // helia.save works; seed s3 with the same ciphertext
    providers.s3.saved.push(providers.helia.saved[0]);
    const r = await mgr.load("cid");
    expect(r.provider).toBe("s3");
    expect(notify).toHaveBeenCalled();
  });

  it("loads an S3-fallback save from S3 when Helia is back but does not have the CID", async () => {
    const { mgr, providers } = setup("helia", { helia: { load: vi.fn(async () => { throw new StorageError("not_found", "404", 404); }) } });
    await mgr.save("n", text("x"));
    providers.s3.saved.push(providers.helia.saved[0]);
    const r = await mgr.load("cid");
    expect(r.provider).toBe("s3");
    expect(new TextDecoder().decode(r.data)).toBe("x");
  });

  it("does not fall back for non-connectivity errors", async () => {
    const { mgr, providers, notify } = setup("helia", { helia: { save: vi.fn(async () => { throw new StorageError("http", "413", 413); }) } });
    await expect(mgr.save("n", text("x"))).rejects.toMatchObject({ kind: "http" });
    expect(providers.s3.save).not.toHaveBeenCalled();
    expect(notify).not.toHaveBeenCalled();
  });

  it("does not fall back when S3 is the selected provider", async () => {
    const { mgr, providers } = setup("s3", { s3: { save: vi.fn(async () => { throw down(); }) } });
    await expect(mgr.save("n", text("x"))).rejects.toMatchObject({ kind: "unreachable" });
    expect(providers.helia.save).not.toHaveBeenCalled();
  });

  it("surfaces the S3 error if both are down", async () => {
    const d = { save: vi.fn(async () => { throw down(); }) };
    const { mgr } = setup("helia", { helia: d, s3: d });
    await expect(mgr.save("n", text("x"))).rejects.toMatchObject({ kind: "unreachable" });
  });

  it("refuses to save without a passphrase", async () => {
    const { mgr, providers } = setup("helia", {}, null);
    await expect(mgr.save("n", text("x"))).rejects.toMatchObject({ kind: "config" });
    expect(providers.helia.save).not.toHaveBeenCalled();
  });

  it("fails to load with the wrong passphrase", async () => {
    const a = setup("helia");
    await a.mgr.save("n", text("x"));
    const b = new StorageManager({ providers: a.providers, getProviderId: () => "helia", getPassphrase: () => "other" });
    await expect(b.load("c")).rejects.toMatchObject({ kind: "crypto" });
  });

  it("leaves Pinata plaintext and loads legacy plaintext as-is", async () => {
    const { mgr, providers } = setup("pinata", {}, null);
    await mgr.save("n", text('{"content":"x"}'));
    expect(new TextDecoder().decode(providers.pinata.saved[0])).toBe('{"content":"x"}');
    expect(new TextDecoder().decode((await mgr.load("c")).data)).toBe('{"content":"x"}');
  });
});
