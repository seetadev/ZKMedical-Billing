import { afterEach, describe, expect, it, vi } from "vitest";
import { HeliaProvider, S3Provider } from "../tornado-provider";
import { StorageError } from "../types";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const BASE = "http://tornado.test:8080/";

describe.each([
  ["HeliaProvider", (f: typeof fetch) => new HeliaProvider(() => BASE, f), "/meshkit-helia"],
  ["S3Provider", (f: typeof fetch) => new S3Provider(() => BASE, f), "/meshkit"],
] as const)("%s", (_n, make, prefix) => {
  afterEach(() => vi.restoreAllMocks());

  it("save POSTs raw bytes to /upload and returns the CID", async () => {
    const f = vi.fn().mockResolvedValue(json({ cid: "bafyabc" }));
    const id = await make(f as any).save("note", new Uint8Array([1, 2, 3]));
    expect(id).toBe("bafyabc");
    const [url, init] = f.mock.calls[0];
    expect(url).toBe(`http://tornado.test:8080${prefix}/upload`);
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/octet-stream");
    expect([...init.body]).toEqual([1, 2, 3]);
  });

  it("save fails when the response has no cid", async () => {
    const f = vi.fn().mockResolvedValue(json({}));
    await expect(make(f as any).save("n", new Uint8Array([1]))).rejects.toMatchObject({ kind: "http" });
  });

  it("load GETs /retrieve/<cid> and returns bytes", async () => {
    const f = vi.fn().mockResolvedValue(new Response(new Uint8Array([9, 8, 7])));
    const out = await make(f as any).load("bafyabc");
    expect([...out]).toEqual([9, 8, 7]);
    expect(f.mock.calls[0][0]).toBe(`http://tornado.test:8080${prefix}/retrieve/bafyabc`);
  });

  it("load maps 404 to not_found", async () => {
    const f = vi.fn().mockResolvedValue(json({ error: "not found" }, 404));
    await expect(make(f as any).load("x")).rejects.toMatchObject({ kind: "not_found" });
  });

  it("list maps {cid,...} to ids", async () => {
    const f = vi.fn().mockResolvedValue(json([{ cid: "a" }, { cid: "b", size: 5, uploadedAt: "t" }]));
    expect(await make(f as any).list()).toEqual([
      { id: "a", size: undefined, uploadedAt: undefined },
      { id: "b", size: 5, uploadedAt: "t" },
    ]);
  });

  it("testConnection is true when /list answers", async () => {
    const f = vi.fn().mockResolvedValue(json([]));
    expect(await make(f as any).testConnection()).toBe(true);
  });

  it.each([502, 503, 504])("treats HTTP %i as unreachable", async (status) => {
    const f = vi.fn().mockResolvedValue(json({ error: "x" }, status));
    await expect(make(f as any).list()).rejects.toMatchObject({ kind: "unreachable", status });
  });

  it("treats a network failure as unreachable", async () => {
    const f = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(make(f as any).list()).rejects.toMatchObject({ kind: "unreachable" });
  });

  it("treats other statuses as http errors, not unreachable", async () => {
    const f = vi.fn().mockResolvedValue(json({ error: "too big" }, 413));
    await expect(make(f as any).save("n", new Uint8Array([1]))).rejects.toMatchObject({ kind: "http", status: 413 });
  });

  it("requires a Tornado URL", async () => {
    const p = new HeliaProvider(() => "", vi.fn() as any);
    await expect(p.list()).rejects.toBeInstanceOf(StorageError);
    await expect(p.list()).rejects.toMatchObject({ kind: "config" });
  });
});
