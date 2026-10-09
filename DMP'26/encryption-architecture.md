# 🔐 Encryption & Decryption Architecture

> **Last Updated**: August 2026
> **Scope**: Covers both local device storage and cloud (Firebase Firestore) file encryption, plus migration guidance for moving to alternative storage backends (S3, SQL, etc.)

---

## Table of Contents

1. [Overview](#overview)
2. [System 1 — Cloud Storage (Firebase Firestore)](#system-1--cloud-storage-firebase-firestore)
3. [System 2 — Local Storage (Device / Capacitor Preferences)](#system-2--local-storage-device--capacitor-preferences)
4. [Side-by-Side Comparison](#side-by-side-comparison)
5. [Security Considerations](#security-considerations)
6. [Migration Guide](#migration-guide)
7. [Key Files Reference](#key-files-reference)
8. [Constants That Must Never Change](#constants-that-must-never-change-without-migration)

---

## Overview

The app uses **two independent encryption systems** that operate at different layers:

| Layer | System | Algorithm | Secret Material | File |
|---|---|---|---|---|
| ☁️ Cloud | Web Crypto API (AES-GCM) | AES-256-GCM | Firebase `userId` + static salt | `src/utils/crypto.ts` |
| 💾 Local | crypto-js (AES-CBC) | AES-256-CBC | User-chosen **password** | `src/components/Storage/LocalStorage.ts` |

Both systems use the `isEncrypted: boolean` flag to mark protected content. The **key material never leaves the client** — no key is stored in the database, no key is ever transmitted to the server.

---

## System 1 — Cloud Storage (Firebase Firestore)

**Relevant files:**
- `src/utils/crypto.ts` — `encryptText()` / `decryptText()` / `getCryptoKey()`
- `src/services/firebase-storage-service.ts` — `saveFileToCloud()` / `getCloudFileContent()`

### Key Derivation

The AES-GCM encryption key is **deterministically derived** from the user's Firebase Auth UID and a static application salt. No key is ever stored or transmitted.

```
┌──────────────────────────────────────────────────────────┐
│                    getCryptoKey(userId)                  │
│                                                          │
│  INPUT:  userId  (Firebase Auth UID, e.g. "abc123")      │
│          + hardcoded salt "nutrition-salt-2026-secret"   │
│                                                          │
│  STEP 1: Concatenate → "abc123nutrition-salt-2026-secret" │
│  STEP 2: TextEncoder().encode()  → Uint8Array            │
│  STEP 3: crypto.subtle.digest("SHA-256") → 32 bytes      │
│  STEP 4: crypto.subtle.importKey("AES-GCM") → CryptoKey  │
│                                                          │
│  OUTPUT: AES-GCM CryptoKey (non-extractable)             │
└──────────────────────────────────────────────────────────┘
```

> ⚠️ **IMPORTANT**: The salt string `"nutrition-salt-2026-secret"` is hardcoded in `src/utils/crypto.ts` line 9. **Changing this salt will permanently break decryption of all existing encrypted files.** Never change it unless you also re-encrypt all stored data.

---

### Encrypt Flow (Upload)

```
User saves a file to cloud
         │
         ▼
saveFileToCloud(userId, file)                [firebase-storage-service.ts]
         │
         ├─► encryptText(file.content, userId)  [crypto.ts]
         │        │
         │        ├─ 1. getCryptoKey(userId)       → AES-GCM key
         │        ├─ 2. crypto.getRandomValues()   → 12-byte random IV
         │        ├─ 3. TextEncoder().encode(text) → Uint8Array of plain text
         │        ├─ 4. crypto.subtle.encrypt(
         │        │        { name: "AES-GCM", iv },
         │        │        key,
         │        │        encodedText
         │        │     )                          → ArrayBuffer (ciphertext)
         │        ├─ 5. combined = [ IV (12 bytes) | ciphertext ]
         │        └─ 6. btoa(combined)             → base64 string
         │
         ▼
Firestore document:
{
  id:          "<fileId>",
  name:        "<fileName>",
  content:     "<base64-encoded [IV | ciphertext]>",   ← encrypted
  isEncrypted: true,
  templateId:  ...,
  billType:    ...,
  total:       ...,
  createdAt:   "ISO string",
  modifiedAt:  "ISO string"
}
```

---

### Decrypt Flow (Download)

```
User opens a cloud file
         │
         ▼
getCloudFileContent(userId, fileId)          [firebase-storage-service.ts]
         │
         ├─► getDoc(fileRef)  → Firestore document
         │
         ├─► if (data.isEncrypted && content)
         │        │
         │        └─► decryptText(content, userId)  [crypto.ts]
         │                  │
         │                  ├─ 1. atob(base64)          → bytes
         │                  ├─ 2. bytes.slice(0, 12)    → IV
         │                  ├─ 3. bytes.slice(12)       → ciphertext
         │                  ├─ 4. getCryptoKey(userId)  → AES-GCM key
         │                  └─ 5. crypto.subtle.decrypt(
         │                            { name: "AES-GCM", iv },
         │                            key,
         │                            ciphertext
         │                         )                    → plain text
         ▼
CloudFile object with decrypted content returned to app
```

---

### Data Shape Stored in Firestore

```
Collection path: /users/{userId}/files/{fileId}

{
  "id":            "string",          // same as {fileId}
  "name":          "string",          // display name
  "content":       "string",          // base64( IV[12 bytes] + AES-GCM ciphertext )
  "isEncrypted":   true,              // always true for cloud files
  "templateId":    "string | number",
  "billType":      number,
  "total":         number,
  "billToDetails": object | null,
  "createdAt":     "ISO 8601 string",
  "modifiedAt":    "ISO 8601 string"
}
```

---

## System 2 — Local Storage (Device / Capacitor Preferences)

**Relevant files:**
- `src/components/Storage/LocalStorage.ts` — `Local` class with `encryptContent()` / `decryptContent()`

### How Password-Based Encryption Works

Unlike the cloud system, local file encryption is **optional and user-initiated**. The user sets a password per file. The password is the encryption key — it is **never stored anywhere**. If the user forgets it, the file content is irrecoverably lost.

```
Algorithm : AES (AES-CBC under crypto-js defaults)
Library   : crypto-js
Key source: User-provided password string (passed directly to CryptoJS.AES.encrypt)
IV        : Generated internally by crypto-js, embedded in the output string
Output    : OpenSSL-compatible Base64 string ("Salted__" prefix format)
```

---

### Save Flow

```
User saves a file with password protection enabled
         │
         ▼
_saveFile(file)                              [LocalStorage.ts]
         │
         ├─► if (file.isEncrypted && file.password)
         │        │
         │        └─► encryptContent(file.content, file.password)
         │                  │
         │                  └─► CryptoJS.AES.encrypt(content, password).toString()
         │                        → "U2FsdGVkX1..." (OpenSSL Base64 string)
         ▼
Capacitor Preferences (key-value store):
  key:   "<fileName>"
  value: JSON.stringify({
    content:     "U2FsdGVkX1...",   ← encrypted if password set
    isEncrypted: true,
    name:        "...",
    billType:    ...,
    templateId:  ...,
    created:     "ISO string",
    modified:    "ISO string"
    // NOTE: password is NOT stored
  })
```

---

### Open Flow

```
User opens a password-protected local file
         │
         ▼
_getFileWithPassword(name, password)         [LocalStorage.ts]
         │
         ├─► Preferences.get({ key: name }) → raw JSON
         │
         ├─► if (data.isEncrypted)
         │        │
         │        └─► decryptContent(data.content, password)
         │                  │
         │                  ├─► CryptoJS.AES.decrypt(encryptedContent, password)
         │                  └─► bytes.toString(CryptoJS.enc.Utf8) → plain text
         │                        (throws if password wrong or data corrupted)
         ▼
File object with decrypted content returned, or error thrown
```

---

### Data Shape Stored Locally

```
Capacitor Preferences entry:

key:   "InvoiceName.msc"
value: {
  "content":     "U2FsdGVkX1...",   // CryptoJS AES output (if encrypted)
                                    // or raw MSC string (if not encrypted)
  "isEncrypted": true | false,
  "name":        "string",
  "billType":    number,
  "templateId":  "string | number",
  "created":     "ISO 8601 string",
  "modified":    "ISO 8601 string"
  // password field is NEVER stored
}
```

---

## Side-by-Side Comparison

| Property | ☁️ Cloud (System 1) | 💾 Local (System 2) |
|---|---|---|
| **Algorithm** | AES-256-GCM | AES-256-CBC (crypto-js default) |
| **API** | Native Web Crypto API | crypto-js library |
| **Key / Secret** | Firebase `userId` + static salt | User-chosen password |
| **Key stored?** | ❌ Never | ❌ Never |
| **IV handling** | Random 12-byte IV, prepended to payload | Handled internally by crypto-js |
| **Opt-in?** | ✅ Always on for all cloud files | Optional — user must set password |
| **If key lost** | User loses Firebase UID → file unreadable | User forgets password → file unreadable |
| **Storage backend** | Firebase Firestore | Capacitor Preferences (device) |
| **Output format** | Base64 string `[IV][ciphertext]` | OpenSSL Base64 (`U2FsdGVkX1...`) |
| **`isEncrypted` flag** | Always `true` | `true` only if password was set |

---

## Security Considerations

### Strengths

1. **Zero-knowledge storage**: The server (Firestore) only ever holds ciphertext. Even a full database breach exposes nothing readable.
2. **Unique IV per encryption**: Each `encryptText()` call generates a fresh random 12-byte IV, preventing ciphertext reuse attacks.
3. **AES-GCM for cloud**: Provides both **confidentiality and integrity** — tampering with the ciphertext causes decryption to fail (authentication tag mismatch).
4. **Non-extractable CryptoKey**: The `importKey(..., false, ...)` call marks the key as non-exportable from the browser's key store.

### Weaknesses & Risks

1. **Static salt**: The salt `"nutrition-salt-2026-secret"` is hardcoded and visible in source code. Anyone with the source and a user's UID can derive their key. Consider moving this to an environment variable (`.env`).
2. **UID = encryption key**: If a Firebase Auth UID ever changes (e.g., account migration, re-creation), that user's cloud files become permanently unreadable.
3. **crypto-js (local)**: The `crypto-js` library uses AES-CBC which has no authentication tag — it cannot detect data tampering. Consider migrating local encryption to the Web Crypto API as well.
4. **Wrong password silent failure**: In some crypto-js versions, wrong passwords produce garbage output rather than a clear error. The code catches this via `toString(CryptoJS.enc.Utf8)` resulting in an empty string check.

---

## Migration Guide

> **Key principle**: The encryption/decryption logic in `crypto.ts` is **completely storage-agnostic**. Only the CRUD service layer (`firebase-storage-service.ts`) needs to change when switching storage backends. The `encryptText()` and `decryptText()` functions stay untouched.

---

### Migrating Cloud Storage to Amazon S3

**What changes**: Replace `firebase-storage-service.ts` Firestore calls with S3 API calls. Crypto logic is unchanged.

#### Step 1 — Install AWS SDK

```bash
npm install @aws-sdk/client-s3
```

#### Step 2 — Define the S3 object structure

```
S3 Bucket:  your-app-bucket
Object key: users/{userId}/files/{fileId}.json

Object body (JSON, same shape as Firestore):
{
  "id":          "string",
  "name":        "string",
  "content":     "base64( IV[12] + AES-GCM ciphertext )",
  "isEncrypted": true,
  "templateId":  "...",
  "billType":    0,
  "total":       0,
  "billToDetails": null,
  "createdAt":   "ISO string",
  "modifiedAt":  "ISO string"
}
```

#### Step 3 — Create `s3-storage-service.ts`

```typescript
// src/services/s3-storage-service.ts
import { S3Client, PutObjectCommand, GetObjectCommand,
         DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { encryptText, decryptText } from "../utils/crypto";   // ← unchanged

const s3 = new S3Client({ region: import.meta.env.VITE_AWS_REGION });
const BUCKET = import.meta.env.VITE_S3_BUCKET;

export const s3StorageService = {
  async saveFileToCloud(userId: string, file: CloudFile): Promise<boolean> {
    const encryptedContent = await encryptText(file.content, userId); // ← same call
    const payload = {
      ...file,
      content: encryptedContent,
      isEncrypted: true,
      modifiedAt: new Date().toISOString()
    };
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: `users/${userId}/files/${file.id}.json`,
      Body: JSON.stringify(payload),
      ContentType: "application/json"
    }));
    return true;
  },

  async getCloudFileContent(userId: string, fileId: string): Promise<CloudFile | null> {
    const res = await s3.send(new GetObjectCommand({
      Bucket: BUCKET,
      Key: `users/${userId}/files/${fileId}.json`
    }));
    const data = JSON.parse(await res.Body!.transformToString());
    if (data.isEncrypted && data.content) {
      data.content = await decryptText(data.content, userId); // ← same call
    }
    return data;
  },

  async deleteFileFromCloud(userId: string, fileId: string): Promise<boolean> {
    await s3.send(new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: `users/${userId}/files/${fileId}.json`
    }));
    return true;
  }
};
```

#### Step 4 — Update import sites

```bash
# Find all files importing from firebase-storage-service
grep -r "firebase-storage-service" src/ --include="*.ts" --include="*.tsx" -l
```

Replace each import with `s3-storage-service`.

#### Step 5 — Data migration (Firestore → S3, one-time)

```typescript
// scripts/migrate-firestore-to-s3.ts
// The encrypted base64 blob is just a string — copy it verbatim. No re-encryption needed.
for (const userDoc of allFirestoreUsers) {
  const files = await getAllFilesForUser(userDoc.id);       // from Firestore
  for (const file of files) {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: `users/${userDoc.id}/files/${file.id}.json`,
      Body: JSON.stringify(file),                           // content blob copied as-is
      ContentType: "application/json"
    }));
  }
}
```

> **Key point**: The encrypted base64 blob is storage-agnostic. Copy it verbatim — **no decryption or re-encryption needed**.

---

### Migrating Cloud Storage to SQL (PostgreSQL / MySQL)

#### Step 1 — Schema design

```sql
CREATE TABLE user_files (
  id              VARCHAR(255)             PRIMARY KEY,
  user_id         VARCHAR(255)             NOT NULL,      -- Firebase UID (key for decryption)
  name            VARCHAR(500)             NOT NULL,
  content         TEXT                     NOT NULL,      -- base64( IV[12] + AES-GCM ciphertext )
  is_encrypted    BOOLEAN                  NOT NULL DEFAULT TRUE,
  template_id     VARCHAR(255),
  bill_type       INTEGER                  DEFAULT 0,
  total           DECIMAL(10, 2)           DEFAULT 0,
  bill_to_details JSONB,                                  -- TEXT for MySQL
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL,
  modified_at     TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_user_files_user_id ON user_files (user_id);
CREATE INDEX idx_user_files_modified ON user_files (user_id, modified_at DESC);
```

#### Step 2 — Create `sql-storage-service.ts`

```typescript
// src/services/sql-storage-service.ts
import { encryptText, decryptText } from "../utils/crypto";   // ← unchanged

export const sqlStorageService = {
  async saveFileToCloud(userId: string, file: CloudFile): Promise<boolean> {
    const encryptedContent = await encryptText(file.content, userId); // ← same call
    await fetch("/api/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...file,
        userId,
        content: encryptedContent,
        isEncrypted: true
      })
    });
    return true;
  },

  async getCloudFileContent(userId: string, fileId: string): Promise<CloudFile | null> {
    const res  = await fetch(`/api/files/${fileId}`);
    const data = await res.json();
    if (data.isEncrypted && data.content) {
      data.content = await decryptText(data.content, userId); // ← same call
    }
    return data;
  }
};
```

#### Step 3 — Backend API security rules

The backend must enforce that only the owning user can read their encrypted files. Decryption always happens client-side.

```
GET /api/files/:fileId
  Backend: verify session.userId === file.user_id  → 403 otherwise
  Returns: encrypted blob + metadata
  Client:  decryptText(blob, session.userId) → plain text
```

#### Step 4 — Data migration (Firestore → SQL, one-time)

```sql
-- After exporting Firestore to JSON, bulk insert:
INSERT INTO user_files (id, user_id, name, content, is_encrypted, template_id,
                        bill_type, total, bill_to_details, created_at, modified_at)
VALUES
  ('file1', 'uid_abc', 'Invoice Jan', '<base64 blob>', true, 'tmpl1', 1, 0.00, null, now(), now()),
  ...;
-- content column gets the raw base64 blob — NO re-encryption needed
```

---

### Migrating Auth Provider (UID change risk)

> ⚠️ **This is the highest-risk migration.** If UIDs change, all cloud-encrypted files become permanently unreadable without a re-encryption pass.

Since the encryption key = `SHA-256(userId + salt)`, changing the `userId` changes the derived key entirely.

**When UIDs might change:**
- Switching from Firebase Auth → Auth0 / Cognito / Supabase Auth
- Deleting and recreating Firebase user accounts
- Merging duplicate accounts

#### Safe re-encryption procedure

```
For each user with encrypted files:

1. Authenticate user with OLD auth provider → get oldUserId
2. Fetch all cloud files (still encrypted with oldUserId key)
3. Decrypt each file:  decryptText(encryptedBlob, oldUserId) → plaintext
4. Authenticate user with NEW auth provider → get newUserId
5. Re-encrypt each file: encryptText(plaintext, newUserId) → newEncryptedBlob
6. Write newEncryptedBlob to storage with newUserId
7. Verify: decryptText(newEncryptedBlob, newUserId) → plaintext ✓
8. Delete old data
```

```typescript
// scripts/re-encrypt-for-new-uid.ts
async function reEncryptUserFiles(oldUserId: string, newUserId: string) {
  const files = await getAllFilesFromFirestore(oldUserId);
  for (const file of files) {
    const plaintext    = await decryptText(file.content, oldUserId);   // decrypt old
    const newEncrypted = await encryptText(plaintext, newUserId);      // encrypt new
    await saveToNewStorage(newUserId, { ...file, content: newEncrypted });
  }
}
```

---

### Migrating Local Encrypted Files to Cloud

Local files (password-encrypted via crypto-js AES-CBC) and cloud files (UID-encrypted via Web Crypto AES-GCM) use **different systems**. Syncing a local file to the cloud always requires a re-encryption step:

```
┌─ LOCAL FILE ────────────────────────────────────────────┐
│  Encrypted with: user password (AES-CBC, crypto-js)     │
└──────────────────────────────────────────────────────────┘
         │
         ▼  Step 1: user provides password → decrypt locally
  decryptContent(localContent, password)   [LocalStorage.ts]
         │
         ▼  → plain text MSC string
         │
         ▼  Step 2: re-encrypt for cloud and upload
  encryptText(plainText, userId)           [crypto.ts]
         │
         ▼
┌─ CLOUD FILE ────────────────────────────────────────────┐
│  Encrypted with: userId (AES-GCM, Web Crypto API)        │
└──────────────────────────────────────────────────────────┘
```

```typescript
// Example: sync a local password-protected file to cloud
async function syncLocalFileToCloud(
  localFileName: string,
  password: string,
  userId: string
) {
  // 1. Decrypt with password (local system)
  const local     = new Local();
  const localFile = await local._getFileWithPassword(localFileName, password);

  // 2. Upload to cloud — saveFileToCloud() will call encryptText() internally
  await firebaseStorageService.saveFileToCloud(userId, {
    id:            generateId(),
    name:          localFile.name,
    content:       localFile.content,    // plain text passed in; cloud layer encrypts it
    templateId:    localFile.templateId,
    billType:      localFile.billType,
    total:         0,
    billToDetails: null
  });
}
```

---

## Key Files Reference

| File | Role |
|---|---|
| `src/utils/crypto.ts` | Core AES-GCM encrypt/decrypt functions. Storage-agnostic. Never modify the algorithm or IV format without a full data migration. |
| `src/services/firebase-storage-service.ts` | CRUD layer for Firestore. **The only file to replace** when switching cloud storage backends. |
| `src/components/Storage/LocalStorage.ts` | Local device storage using Capacitor Preferences. Contains password-based AES-CBC encryption via crypto-js. |
| `src/services/firebase.ts` | Firebase app and Firestore `db` instance initialization. |

---

## Constants That Must Never Change (Without Migration)

| Constant | Location | Current Value | Impact if changed |
|---|---|---|---|
| Static salt | `crypto.ts` line 9 | `"nutrition-salt-2026-secret"` | All cloud-encrypted files become unreadable |
| Hash algorithm | `crypto.ts` line 10 | `"SHA-256"` | All cloud-encrypted files become unreadable |
| Cipher algorithm | `crypto.ts` line 14 | `"AES-GCM"` | All cloud-encrypted files become unreadable |
| IV length | `crypto.ts` lines 26 & 68 | `12 bytes` | Decryption misreads IV/ciphertext boundary |
| `isEncrypted` flag | Both systems | `true` | Encrypted content served as raw text to app |

---

*Document maintained as part of the app's technical architecture record. Update this file whenever encryption logic, storage backends, or auth providers change.*
