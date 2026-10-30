import { StorageError, StorageProvider, StoredItem, ProviderId } from "./types";

/**
 * Both IPFS backends sit behind Tornado with the same contract:
 *   POST {base}/upload          raw bytes -> {cid}
 *   GET  {base}/retrieve/<cid>  raw bytes
 *   GET  {base}/list            [{cid, size?, uploadedAt?}]
 * Helia lives under /meshkit-helia, the S3 sidecar under /meshkit.
 */
export class TornadoCidProvider implements StorageProvider {
  constructor(
    readonly id: ProviderId,
    private readonly routePrefix: string,
    private readonly getBaseUrl: () => string,
    private readonly fetchImpl: typeof fetch = (input, init) => fetch(input, init)
  ) {}

  private url(path: string): string {
    const base = (this.getBaseUrl() || "").trim().replace(/\/+$/, "");
    if (!base) throw new StorageError("config", "Tornado URL is not configured. Set it in Settings.");
    return `${base}${this.routePrefix}${path}`;
  }

  private async request(path: string, init?: RequestInit): Promise<Response> {
    let res: Response;
    try {
      res = await this.fetchImpl(this.url(path), init);
    } catch (e: any) {
      if (e instanceof StorageError) throw e;
      throw new StorageError("unreachable", `Cannot reach Tornado (${this.id}): ${e?.message || e}`);
    }
    if (res.ok) return res;
    if (res.status === 404) throw new StorageError("not_found", "Not found", 404);
    if ([502, 503, 504].includes(res.status)) {
      throw new StorageError("unreachable", `${this.id} backend unavailable (HTTP ${res.status})`, res.status);
    }
    throw new StorageError("http", `${this.id} request failed (HTTP ${res.status})`, res.status);
  }

  async testConnection(): Promise<boolean> {
    await this.request("/list");
    return true;
  }

  async save(_name: string, data: Uint8Array): Promise<string> {
    const res = await this.request("/upload", {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: data as unknown as BodyInit,
    });
    const body = await res.json().catch(() => null);
    if (!body || typeof body.cid !== "string" || !body.cid) {
      throw new StorageError("http", "Upload response did not contain a CID");
    }
    return body.cid;
  }

  async load(id: string): Promise<Uint8Array> {
    const res = await this.request(`/retrieve/${encodeURIComponent(id.trim())}`);
    return new Uint8Array(await res.arrayBuffer());
  }

  async list(): Promise<StoredItem[]> {
    const res = await this.request("/list");
    const body = await res.json().catch(() => null);
    if (!Array.isArray(body)) throw new StorageError("http", "List response was not an array");
    return body.map((o: any) => ({ id: o.cid, size: o.size, uploadedAt: o.uploadedAt }));
  }
}

export class HeliaProvider extends TornadoCidProvider {
  constructor(getBaseUrl: () => string, fetchImpl?: typeof fetch) {
    super("helia", "/meshkit-helia", getBaseUrl, fetchImpl);
  }
}

/** Plan B: Tornado's S3-backed meshkit sidecar. These routes have no auth; payloads are encrypted client-side. */
export class S3Provider extends TornadoCidProvider {
  constructor(getBaseUrl: () => string, fetchImpl?: typeof fetch) {
    super("s3", "/meshkit", getBaseUrl, fetchImpl);
  }
}
