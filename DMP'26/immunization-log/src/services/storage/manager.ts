import { decrypt, encrypt } from "./crypto";
import { ProviderId, StorageError, StorageProvider, StoredItem } from "./types";

export interface SaveResult {
  id: string;
  provider: ProviderId;
  /** true when the selected provider was unreachable and the save went to S3 instead */
  fellBack: boolean;
}

export interface LoadResult {
  data: Uint8Array;
  provider: ProviderId;
}

export interface StorageManagerDeps {
  providers: Record<ProviderId, StorageProvider>;
  getProviderId: () => ProviderId;
  getPassphrase: () => string | null;
  /** Called with a user-facing message when a fallback happens (shown as a toast). */
  notify?: (message: string) => void;
}

export class StorageManager {
  constructor(private readonly deps: StorageManagerDeps) {}

  private get selected(): StorageProvider {
    return this.deps.providers[this.deps.getProviderId()];
  }

  private requirePassphrase(): string {
    const p = this.deps.getPassphrase();
    if (!p) throw new StorageError("config", "Enter your encryption passphrase in Settings first.");
    return p;
  }

  private async seal(data: Uint8Array): Promise<Uint8Array> {
    return encrypt(data, { password: this.requirePassphrase() });
  }

  testConnection(): Promise<boolean> {
    return this.selected.testConnection();
  }

  async save(name: string, plaintext: Uint8Array): Promise<SaveResult> {
    const primary = this.selected;
    try {
      return { id: await primary.save(name, await this.seal(plaintext)), provider: primary.id, fellBack: false };
    } catch (e) {
      if (primary.id !== "helia" || !(e instanceof StorageError) || e.kind !== "unreachable") throw e;
      const s3 = this.deps.providers.s3;
      this.deps.notify?.("Helia is unreachable. Saved to S3 instead.");
      return { id: await s3.save(name, await this.seal(plaintext)), provider: "s3", fellBack: true };
    }
  }

  async load(id: string): Promise<LoadResult> {
    const primary = this.selected;
    let bytes: Uint8Array;
    let used = primary;
    try {
      bytes = await primary.load(id);
    } catch (e) {
      // not_found too: a save that fell back to S3 leaves a CID Helia has never seen.
      const retry = e instanceof StorageError && (e.kind === "unreachable" || e.kind === "not_found");
      if (primary.id !== "helia" || !retry) throw e;
      used = this.deps.providers.s3;
      this.deps.notify?.(
        e.kind === "not_found" ? "Not found on Helia. Trying S3 instead." : "Helia is unreachable. Loading from S3 instead.",
      );
      bytes = await used.load(id);
    }
    // Everything this app stores is EMSH-framed; decrypt() rejects anything else.
    const data = await decrypt(bytes, this.requirePassphrase());
    return { data, provider: used.id };
  }

  list(): Promise<StoredItem[]> {
    return this.selected.list();
  }
}
