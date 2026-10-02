# Firebase Firestore Security Rules

Below are the updated Firestore security rules that maintain **100% backward compatibility** with existing user storage & cloud sync rules while adding secure, unauthenticated write access for the `invoice-feedback` collection.

---

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // =========================================================================
    // 1. App-level metadata doc (contains fileIds array, limited to max 5/25)
    // =========================================================================
    match /users/{userId}/apps/{appType} {
      allow read, write: if request.auth != null 
                         && request.auth.uid == userId
                         && request.resource.data.fileIds.size() <= 25;
    }

    // =========================================================================
    // 2. Files collection rule
    // =========================================================================
    match /users/{userId}/apps/{appType}/files/{fileId} {
      // Read & Delete always allowed for the owner
      allow read, delete: if request.auth != null && request.auth.uid == userId;
      
      // Existing file update allowed for the owner
      allow update: if request.auth != null && request.auth.uid == userId;

      // New file creation allowed only if registered in parent app's fileIds array
      allow create: if request.auth != null 
                    && request.auth.uid == userId
                    && fileId in get(/databases/$(database)/documents/users/$(userId)/apps/$(appType)).data.fileIds;
    }

    // =========================================================================
    // 3. User sub-collections catch-all rule
    // =========================================================================
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // =========================================================================
    // 4. Feedback & Queries Collection (Public Create, Private Read/Update/Delete)
    // =========================================================================
    match /invoice-feedback/{feedbackId} {
      // Allow any user (logged-in or guest/unauthenticated) to submit feedback
      allow create: if request.resource.data.email is string
                    && request.resource.data.email.size() > 0
                    && request.resource.data.email.size() <= 200
                    && request.resource.data.message is string
                    && request.resource.data.message.size() > 0
                    && request.resource.data.message.size() <= 5000;

      // Disallow client-side reading, editing, or deleting to protect user privacy
      allow read, update, delete: if false;
    }

  }
}
```

---

## 🔒 Security Highlights for `invoice-feedback`:

1. **No Login Required (`allow create`)**:
   - Guests and signed-in users alike can submit feedback or queries without authentication.
2. **Payload Validation**:
   - `email`: Required string, max 200 characters.
   - `message`: Required string, max 5,000 characters.
3. **Data Privacy (`allow read, update, delete: if false`)**:
   - Other users/clients cannot read submitted feedback or queries from the client SDK. Only administrators via the Firebase Console or Admin SDK can view feedback submissions.
