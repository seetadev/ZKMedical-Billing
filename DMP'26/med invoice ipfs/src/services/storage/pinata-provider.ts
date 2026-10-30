import { ipfsService } from "../ipfs-service";
import { StorageProvider, StoredItem } from "./types";

/**
 * Legacy Pinata path, kept reachable behind the provider selector. It stores plaintext
 * JSON (the gateway must be able to serve it), so the manager skips encryption for it.
 * `data` is the UTF-8 JSON of a SavedInvoice.
 */
export class PinataProvider implements StorageProvider {
  readonly id = "pinata" as const;
  readonly plaintext = true;

  async testConnection(): Promise<boolean> {
    return ipfsService.testConnection();
  }

  async save(_name: string, data: Uint8Array): Promise<string> {
    const invoice = JSON.parse(new TextDecoder().decode(data));
    const res = await ipfsService.pinToIpfs(invoice);
    return res.IpfsHash;
  }

  async load(id: string): Promise<Uint8Array> {
    return new TextEncoder().encode(JSON.stringify(await ipfsService.fetchFromIpfs(id)));
  }

  async list(): Promise<StoredItem[]> {
    return []; // Pinata has no list in this integration; the local history list is used.
  }
}
