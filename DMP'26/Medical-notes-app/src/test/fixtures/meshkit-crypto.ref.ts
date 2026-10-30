// Vendored reference copy of IPFS-Meshkit/meshkit0 packages/core/src/crypto.ts @ 742f4c7 (MIT, (c) 2026 IPFS Meshkit).
// Test fixture only: used to prove our WebCrypto implementation is wire-compatible. Do not import from app code.
// Only change: MeshkitError is declared locally instead of imported from ./types.js.
/**
 * Encryption utilities for IPFS-Meshkit.
 *
 * Algorithm: AES-256-GCM (authenticated encryption)
 * KDF:       PBKDF2-SHA256 (password → 256-bit key)
 * RNG:       globalThis.crypto.getRandomValues (CSPRNG, Node ≥ 20 / browsers / RN)
 *
 * Wire format (all fields are fixed-width, big-endian where applicable):
 *
 *   ┌────────┬─────────┬────────────┬──────────┬──────────┬──────────────────────┐
 *   │ MAGIC  │ VERSION │ ITERATIONS │  SALT    │  NONCE   │  CIPHERTEXT + TAG    │
 *   │ 4 B    │ 1 B     │ 4 B uint32 │ 16 B     │ 12 B     │  n + 16 B            │
 *   │ "EMSH" │ 0x01    │ big-endian │ random   │ random   │  AES-256-GCM output  │
 *   └────────┴─────────┴────────────┴──────────┴──────────┴──────────────────────┘
 *   Header = 37 bytes. Minimum valid payload = 53 bytes (header + empty plaintext tag).
 *
 * Security properties:
 *   - Every encrypt() call generates a fresh random salt and nonce.
 *     Same plaintext + same password → always different ciphertext.
 *   - AES-GCM provides authenticated encryption: any bit-flip in the
 *     ciphertext or header salt/nonce/iterations causes decryption to throw.
 *   - PBKDF2 with high iteration count slows offline brute-force attacks.
 *   - isEncryptedPayload() is a public predicate — it only checks the magic
 *     bytes, never the password.  No timing secrets are involved.
 *
 * Audited dependencies:
 *   - @noble/ciphers  (Cure53 audit: https://cure53.de/pentest-report_noble-crypto.pdf)
 *   - @noble/hashes   (same audit)
 */

import { gcm } from '@noble/ciphers/aes.js';
import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
class MeshkitError extends Error { constructor(m: string) { super(m); this.name = 'MeshkitError'; } }

// ---------------------------------------------------------------------------
// Wire-format constants
// ---------------------------------------------------------------------------

/** 4-byte magic: ASCII "EMSH" (Encrypted MeSHkit). */
const MAGIC = new Uint8Array([0x45, 0x4d, 0x53, 0x48]);

const VERSION = 0x01;

// Header byte offsets
const OFF_VERSION = 4;          // 1 byte
const OFF_ITERATIONS = 5;       // 4 bytes, uint32 big-endian
const OFF_SALT = 9;             // 16 bytes
const OFF_NONCE = 25;           // 12 bytes
const HEADER_LEN = 37;          // total header size

const SALT_LEN = 16;            // 128-bit salt
const NONCE_LEN = 12;           // 96-bit nonce (GCM standard)
const KEY_LEN = 32;             // 256-bit key (AES-256)
const GCM_TAG_LEN = 16;         // 128-bit authentication tag

/** Minimum byte length of a valid encrypted payload (empty plaintext). */
const MIN_PAYLOAD_LEN = HEADER_LEN + GCM_TAG_LEN; // 53

/** Default PBKDF2 iteration count.  200k is the OWASP 2023 minimum for PBKDF2-SHA256. */
export const DEFAULT_ITERATIONS = 200_000;

/**
 * Minimum iteration count accepted by encrypt().
 * Values below this are almost certainly a typo (e.g. `1` instead of `1_000`)
 * and would produce dangerously weak key derivation.
 */
const MIN_ENCRYPT_ITERATIONS = 1_000;

/**
 * Maximum iteration count accepted by decrypt() when reading from the payload header.
 * A crafted EMSH blob with iterations = 0xFFFFFFFF (~4.3 billion) would hang a server
 * for hours; this ceiling rejects such payloads before the KDF is ever invoked.
 */
const MAX_DECRYPT_ITERATIONS = 10_000_000;

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface EncryptOptions {
  /**
   * Passphrase used to derive the AES-256-GCM encryption key via PBKDF2-SHA256.
   * Must be a non-empty string.  The passphrase is encoded as UTF-8 before hashing.
   */
  password: string;

  /**
   * PBKDF2 iteration count.  Defaults to 200,000.
   * Higher values increase brute-force resistance at the cost of encrypt/decrypt time.
   * Must be an integer ≥ 1,000 and ≤ 4,294,967,295 (uint32 max).
   */
  iterations?: number;
}

// ---------------------------------------------------------------------------
// Helpers (not exported — keep the public API surface minimal)
// ---------------------------------------------------------------------------

/**
 * Convert a password string to bytes using UTF-8.
 * We never work with the password as a raw string after this point.
 */
function passwordToBytes(password: string): Uint8Array {
  return new TextEncoder().encode(password);
}

/**
 * Generate cryptographically secure random bytes using the platform CSPRNG.
 * Works identically on Node.js ≥ 20, browsers, and React Native.
 * Fills in 65,536-byte chunks to respect the Web Crypto API quota per call.
 */
function secureRandom(byteLength: number): Uint8Array {
  const buf = new Uint8Array(byteLength);
  const CHUNK = 65_536;
  for (let offset = 0; offset < byteLength; offset += CHUNK) {
    globalThis.crypto.getRandomValues(buf.subarray(offset, offset + CHUNK));
  }
  return buf;
}

/**
 * Derive a 256-bit AES key from a password + salt using PBKDF2-SHA256.
 * Uses the async variant to avoid blocking the event loop during high iteration counts.
 */
async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  return pbkdf2Async(sha256, passwordToBytes(password), salt, {
    c: iterations,
    dkLen: KEY_LEN,
  });
}

/** Validate the iterations parameter and throw a descriptive error if invalid. */
function validateIterations(iterations: number): void {
  if (
    !Number.isInteger(iterations) ||
    iterations < MIN_ENCRYPT_ITERATIONS ||
    iterations > 0xffffffff
  ) {
    throw new MeshkitError(
      `iterations must be an integer ≥ ${MIN_ENCRYPT_ITERATIONS} and ≤ 4,294,967,295, got: ${iterations}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns `true` when `data` looks like an EMSH encrypted payload.
 *
 * This is a fast structural check — it only verifies the 4-byte magic prefix
 * and the version byte.  It does **not** verify the password or authenticate
 * the ciphertext.  Use it to decide whether to attempt decryption.
 */
export function isEncryptedPayload(data: Uint8Array): boolean {
  if (data.length < MIN_PAYLOAD_LEN) return false;
  return (
    data[0] === MAGIC[0] &&
    data[1] === MAGIC[1] &&
    data[2] === MAGIC[2] &&
    data[3] === MAGIC[3] &&
    data[4] === VERSION
  );
}

/**
 * Encrypt `data` using AES-256-GCM with a PBKDF2-SHA256 derived key.
 *
 * Every invocation generates a fresh random 128-bit salt and 96-bit nonce,
 * so the same `data` + `password` will always produce different output.
 *
 * @returns The encrypted payload in EMSH wire format (header + ciphertext + tag).
 * @throws  MeshkitError if `options.iterations` is out of range.
 */
export async function encrypt(
  data: Uint8Array,
  opts: EncryptOptions,
): Promise<Uint8Array> {
  if (!opts.password) {
    throw new MeshkitError('password must be a non-empty string');
  }

  const iterations = opts.iterations ?? DEFAULT_ITERATIONS;
  validateIterations(iterations);

  // Fresh random material for every encrypt call.
  const salt = secureRandom(SALT_LEN);
  const nonce = secureRandom(NONCE_LEN);

  const key = await deriveKey(opts.password, salt, iterations);

  // AES-256-GCM encrypt — appends the 16-byte authentication tag to the ciphertext.
  const ciphertext = gcm(key, nonce).encrypt(data);

  // Build the 37-byte header.
  const header = new Uint8Array(HEADER_LEN);
  const view = new DataView(header.buffer);
  header.set(MAGIC, 0);
  header[OFF_VERSION] = VERSION;
  view.setUint32(OFF_ITERATIONS, iterations, false /* big-endian */);
  header.set(salt, OFF_SALT);
  header.set(nonce, OFF_NONCE);

  // Concatenate header + ciphertext+tag into a single buffer.
  const payload = new Uint8Array(HEADER_LEN + ciphertext.length);
  payload.set(header, 0);
  payload.set(ciphertext, HEADER_LEN);
  return payload;
}

/**
 * Decrypt an EMSH payload created by {@link encrypt}.
 *
 * @returns The original plaintext bytes.
 * @throws  MeshkitError if the payload is not a valid EMSH blob,
 *          if the password is wrong, or if the ciphertext has been tampered with.
 *          The error message intentionally does not distinguish between a wrong
 *          password and a corrupted payload to avoid oracle attacks.
 */
export async function decrypt(
  data: Uint8Array,
  password: string,
): Promise<Uint8Array> {
  if (!isEncryptedPayload(data)) {
    throw new MeshkitError(
      'Data is not an encrypted meshkit payload (EMSH magic bytes not found)',
    );
  }

  if (!password) {
    throw new MeshkitError('password must be a non-empty string');
  }

  // Parse the header.  Use a DataView that respects a potential non-zero
  // byteOffset (e.g. if the caller passed a subarray view).
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const iterations = view.getUint32(OFF_ITERATIONS, false /* big-endian */);

  // Reject payloads whose header declares an absurdly high iteration count.
  // A crafted EMSH blob with iterations = 0xFFFFFFFF would hang the process
  // for hours; this check fires before the KDF is ever invoked.
  if (iterations > MAX_DECRYPT_ITERATIONS) {
    throw new MeshkitError(
      `Encrypted payload has an unsafe iteration count (${iterations}); max allowed for decryption is ${MAX_DECRYPT_ITERATIONS}`,
    );
  }

  // slice() creates owned copies — safe to hand to noble even if data is a view.
  const salt = data.slice(OFF_SALT, OFF_NONCE);
  const nonce = data.slice(OFF_NONCE, HEADER_LEN);
  const ciphertext = data.slice(HEADER_LEN);

  if (ciphertext.length < GCM_TAG_LEN) {
    throw new MeshkitError('Encrypted payload is truncated or corrupt');
  }

  const key = await deriveKey(password, salt, iterations);

  try {
    // gcm().decrypt() verifies the GCM authentication tag and throws if it
    // does not match — this is the "wrong password" / "tampering" guard.
    return gcm(key, nonce).decrypt(ciphertext);
  } catch {
    // Re-throw as MeshkitError with a generic message to avoid oracle attacks.
    // We intentionally do not forward the underlying error message.
    throw new MeshkitError(
      'Decryption failed: wrong password or corrupted data',
    );
  }
}
