/**
 * The passphrase lives in memory only. Settings persist a salted PBKDF2 verifier so a
 * re-entered passphrase can be checked, but the passphrase itself is never written to disk.
 */
import { getSettings, saveSettings } from "../../utils/settings";

const VERIFIER_ITERATIONS = 200_000;

let sessionPassphrase: string | null = null;

const toB64 = (u: Uint8Array) => btoa(String.fromCharCode(...u));
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function hash(passphrase: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase) as unknown as BufferSource, "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as unknown as BufferSource, iterations },
    base,
    256
  );
  return new Uint8Array(bits);
}

export function getPassphrase(): string | null {
  return sessionPassphrase;
}

export function clearPassphrase(): void {
  sessionPassphrase = null;
}

export function hasVerifier(): boolean {
  return !!getSettings().passphraseVerifier;
}

/** Set a new passphrase (first time or change). Stores only the verifier. */
export async function setPassphrase(passphrase: string): Promise<void> {
  if (!passphrase) throw new Error("Passphrase must not be empty");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const h = await hash(passphrase, salt, VERIFIER_ITERATIONS);
  saveSettings({ passphraseVerifier: { salt: toB64(salt), hash: toB64(h), iterations: VERIFIER_ITERATIONS } });
  sessionPassphrase = passphrase;
}

/** Unlock for this session. Returns false (and keeps the session locked) if it doesn't match. */
export async function unlockPassphrase(passphrase: string): Promise<boolean> {
  const v = getSettings().passphraseVerifier;
  if (!v) return false;
  const h = await hash(passphrase, fromB64(v.salt), v.iterations);
  if (toB64(h) !== v.hash) return false;
  sessionPassphrase = passphrase;
  return true;
}
