// Simple test to verify encryption functionality
import CryptoJS from "crypto-js";

// Test encryption/decryption
function testEncryption() {
  const originalContent = "This is a test invoice content";
  const password = "testPassword123";

  console.log("Original content:", originalContent);

  // Encrypt
  const encrypted = CryptoJS.AES.encrypt(originalContent, password).toString();
  console.log("Encrypted:", encrypted);

  // Decrypt
  const decrypted = CryptoJS.AES.decrypt(encrypted, password);
  const decryptedContent = decrypted.toString(CryptoJS.enc.Utf8);
  console.log("Decrypted:", decryptedContent);

  // Test wrong password
  try {
    const wrongDecrypted = CryptoJS.AES.decrypt(encrypted, "wrongPassword");
    const wrongContent = wrongDecrypted.toString(CryptoJS.enc.Utf8);
    console.log("Wrong password result:", wrongContent);
  } catch (error) {
    console.log("Wrong password correctly failed");
  }

  console.log("Test completed successfully!");
}

testEncryption();
