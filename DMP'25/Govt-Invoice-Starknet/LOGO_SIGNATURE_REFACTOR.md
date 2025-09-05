## Logo and Signature Coordinates Refactoring

### Summary

Updated FileOptions.tsx to use activeTemplateData from the InvoiceContext instead of deprecated getLogoCoordinates() and getSignatureCoordinates() functions.

### Changes Made

1. **FileOptions.tsx Updates:**

   - Added `activeTemplateData` to the destructured context values from `useInvoice()`
   - Updated `handleSelectLogo()` to use `activeTemplateData.logoCell[billType]` instead of `AppGeneral.getLogoCoordinates()`
   - Updated `handleRemoveLogo()` to use `activeTemplateData.logoCell[billType]` instead of `AppGeneral.getLogoCoordinates()`
   - Updated `handleSelectSignature()` to use `activeTemplateData.signatureCell[billType]` instead of `AppGeneral.getSignatureCoordinates()`
   - Updated `handleRemoveSignature()` to use `activeTemplateData.signatureCell[billType]` instead of `AppGeneral.getSignatureCoordinates()`
   - Added proper error handling for cases where activeTemplateData is null or coordinates are unavailable
   - Implemented support for both string and object-based coordinate definitions in template data

2. **device.js Module Cleanup:**
   - Removed deprecated `getLogoCoordinates()` function
   - Removed deprecated `getSignatureCoordinates()` function
   - Kept only `getDeviceType()` function as it's still needed

### Benefits

- **Better Architecture:** Logo and signature coordinates are now sourced directly from template metadata instead of hardcoded device-specific mappings
- **Dynamic Positioning:** Coordinates can vary per template and bill type, providing more flexibility
- **Cleaner Code:** Removed deprecated functions and their hardcoded coordinate mappings
- **Type Safety:** Better TypeScript support with proper template data interfaces
- **Error Handling:** Added comprehensive error messages for missing template data or coordinates

### Template Data Structure

The system now expects coordinates in the activeTemplateData object:

```typescript
{
  logoCell: string | { [billType: number]: string },
  signatureCell: string | { [billType: number]: string },
  // ... other template properties
}
```

This allows for either simple string coordinates (same for all bill types) or object-based coordinates (different per bill type).
