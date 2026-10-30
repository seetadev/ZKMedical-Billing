/**
 * Client-side encryption in the EMSH wire format used by @ipfs-meshkit/meshkit
 * (packages/core/src/crypto.ts), implemented on WebCrypto because meshkit does not
 * export encrypt/decrypt publicly.
 *
 *   MAGIC "EMSH" (4) | VERSION 0x01 (1) | ITERATIONS uint32 BE (4) | SALT (16) | NONCE (12) | CIPHERTEXT+TAG
 *
 * AES-256-GCM, key = PBKDF2-SHA256(utf8(password), salt, iterations).
 */
import { StorageError } from "./types";

const MAGIC = [0x45, 0x4d, 0x53, 0x48];
const VERSION = 0x01;
const OFF_ITERATIONS = 5;
const OFF_SALT = 9;
const OFF_NONCE = 25;
const HEADER_LEN = 37;
const SALT_LEN = 16;
const NONCE_LEN = 12;
const GCM_TAG_LEN = 16;
const MIN_PAYLOAD_LEN = HEADER_LEN + GCM_TAG_LEN;

export const DEFAULT_ITERATIONS = 200_000;
const MIN_ENCRYPT_ITERATIONS = 1_000;
const MAX_DECRYPT_ITERATIONS = 10_000_000;

const bs = (u: Uint8Array) => u as unknown as BufferSource;

function subtle(): SubtleCrypto {
  const s = globalThis.crypto?.subtle;
  if (!s) throw new StorageError("crypto", "WebCrypto is not available in this environment");
  return s;
}

async function deriveKey(password: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const base = await subtle().importKey("raw", bs(new TextEncoder().encode(password)), "PBKDF2", false, ["deriveKey"]);
  return subtle().deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: bs(salt), iterations },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export function isEncryptedPayload(data: Uint8Array): boolean {
  if (data.length < MIN_PAYLOAD_LEN) return false;
  return MAGIC.every((b, i) => data[i] === b) && data[4] === VERSION;
}

export async function encrypt(
  data: Uint8Array,
  opts: { password: string; iterations?: number }
): Promise<Uint8Array> {
  if (!opts.password) throw new StorageError("crypto", "password must be a non-empty string");
  const iterations = opts.iterations ?? DEFAULT_ITERATIONS;
  if (!Number.isInteger(iterations) || iterations < MIN_ENCRYPT_ITERATIONS || iterations > 0xffffffff) {
    throw new StorageError("crypto", `iterations must be an integer >= ${MIN_ENCRYPT_ITERATIONS} and <= 4294967295`);
  }
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const nonce = globalThis.crypto.getRandomValues(new Uint8Array(NONCE_LEN));
  const key = await deriveKey(opts.password, salt, iterations);
  const ct = new Uint8Array(await subtle().encrypt({ name: "AES-GCM", iv: bs(nonce) }, key, bs(data)));

  const out = new Uint8Array(HEADER_LEN + ct.length);
  out.set(MAGIC, 0);
  out[4] = VERSION;
  new DataView(out.buffer).setUint32(OFF_ITERATIONS, iterations, false);
  out.set(salt, OFF_SALT);
  out.set(nonce, OFF_NONCE);
  out.set(ct, HEADER_LEN);
  return out;
}

export async function decrypt(data: Uint8Array, password: string): Promise<Uint8Array> {
  if (!isEncryptedPayload(data)) {
    throw new StorageError("crypto", "Data is not an encrypted payload (EMSH magic bytes not found)");
  }
  if (!password) throw new StorageError("crypto", "password must be a non-empty string");

  const iterations = new DataView(data.buffer, data.byteOffset, data.byteLength).getUint32(OFF_ITERATIONS, false);
  if (iterations < 1 || iterations > MAX_DECRYPT_ITERATIONS) {
    throw new StorageError("crypto", `Encrypted payload has an unsafe iteration count (${iterations})`);
  }
  const salt = data.slice(OFF_SALT, OFF_NONCE);
  const nonce = data.slice(OFF_NONCE, HEADER_LEN);
  const ct = data.slice(HEADER_LEN);
  const key = await deriveKey(password, salt, iterations);
  try {
    return new Uint8Array(await subtle().decrypt({ name: "AES-GCM", iv: bs(nonce) }, key, bs(ct)));
  } catch {
    throw new StorageError("crypto", "Decryption failed: wrong passphrase or corrupted data");
  }
}
