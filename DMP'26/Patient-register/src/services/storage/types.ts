export type ProviderId = "helia" | "s3" | "pinata";

export interface StoredItem {
  id: string;
  size?: number;
  uploadedAt?: string;
}

export type StorageErrorKind =
  | "unreachable" // network failure, 502/503/504 from Tornado
  | "not_found"
  | "http"
  | "config"
  | "crypto";

export class StorageError extends Error {
  readonly kind: StorageErrorKind;
  readonly status?: number;

  constructor(kind: StorageErrorKind, message: string, status?: number) {
    super(message);
    this.name = "StorageError";
    this.kind = kind;
    this.status = status;
  }
}

/** Providers move opaque bytes; encryption happens above them (see manager.ts). */
export interface StorageProvider {
  readonly id: ProviderId;
  /** true when the provider stores plaintext (legacy Pinata) and must not be given ciphertext. */
  readonly plaintext?: boolean;
  testConnection(): Promise<boolean>;
  save(name: string, data: Uint8Array): Promise<string>;
  load(id: string): Promise<Uint8Array>;
  list(): Promise<StoredItem[]>;
}
