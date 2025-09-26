# Multi-Template Architecture Documentation

## Overview

The Government Invoice Form application has been enhanced with a new multi-template architecture that isolates different MSC files and their metadata. This prevents interference between different template types and provides better organization and extensibility.

## Architecture Changes

### 1. Enhanced File Structure

The new architecture introduces template-specific metadata and isolation:

```typescript
interface TemplateMetadata {
  template: string;           // Template name
  templateId: number;         // Unique template identifier
  footers: Array<{           // Template-specific footers
    name: string;
    index: number;
    isActive: boolean;
  }>;
  logoCell: string | null;    // Cell reference for logo
  signatureCell: string | null; // Cell reference for signature
  cellMappings: {            // Template-specific cell mappings
    [headingName: string]: {
      [cellName: string]: {
        heading: string;
        datatype: string;
      };
    };
  };
}
```

### 2. Enhanced LocalStorage

The `File` class now includes template metadata:

```typescript
export class File {
  created: string;
  modified: string;
  name: string;
  content: string;           // MSC content
  billType: number;          // Template ID (for backward compatibility)
  isEncrypted: boolean;
  password?: string;
  templateMetadata: TemplateMetadata; // NEW: Template-specific metadata
}
```

**Backward Compatibility**: The constructor supports both old and new signatures to ensure existing code continues to work.

### 3. Template Management System

#### TemplateManager Utility (`/src/utils/templateManager.ts`)

Provides utilities for:
- Extracting metadata from template data
- Template-specific storage key generation
- Metadata validation
- Cell mapping operations
- File filtering by template

#### TemplateInitializer (`/src/utils/templateInitializer.ts`)

Handles:
- Application initialization with multi-template support
- Template data validation
- Default metadata setup
- Template registry management

## Key Benefits

### 1. Template Isolation
- Each MSC file is associated with specific template metadata
- No cross-template interference
- Template-specific configurations are preserved

### 2. Enhanced Organization
- Files are organized by template type
- Easy filtering and management by template
- Clear separation of concerns

### 3. Extensibility
- Easy addition of new templates
- Template-specific customizations
- Flexible metadata structure

### 4. Backward Compatibility
- Existing files continue to work
- Gradual migration path
- No breaking changes to existing API

## Template Data Structure

Templates are defined in `/src/templates.ts` with the following structure:

```typescript
export interface TemplateData {
  template: string;          // Display name
  templateId: number;        // Unique identifier
  msc: {                    // MSC spreadsheet data
    numsheets: number;
    currentid: string;
    currentname: string;
    sheetArr: { ... };      // Sheet definitions
    EditableCells: {        // Editable cell configuration
      allow: boolean;
      cells: { ... };
      constraints: { ... }; // Cell validation rules
    };
  };
  footers: Array<{          // Template footers
    name: string;
    index: number;
    isActive: boolean;
  }>;
  logoCell: string | null;
  signatureCell: string | null;
  cellMappings: { ... };    // Cell mapping definitions
}
```

## Usage Examples

### 1. Creating a New File with Template Metadata

```typescript
import { File, TemplateMetadata } from './components/Storage/LocalStorage';
import { TemplateInitializer } from './utils/templateInitializer';

// Get template metadata
const metadata = TemplateInitializer.getTemplateMetadata(1);

// Create new file
const file = new File(
  new Date().toISOString(),  // created
  new Date().toISOString(),  // modified
  mscContent,                // MSC content
  "my-invoice.msc",         // filename
  1,                        // template ID
  metadata,                 // template metadata
  false                     // not encrypted
);
```

### 2. Filtering Files by Template

```typescript
import { TemplateManager } from './utils/templateManager';

// Get all files for template ID 1
const template1Files = await local._getFilesByTemplate(1);

// Or filter existing files collection
const filteredFiles = TemplateManager.filterFilesByTemplate(allFiles, 1);
```

### 3. Working with Cell Mappings

```typescript
import { TemplateManager } from './utils/templateManager';

// Get default cell mappings for a template
const defaultMappings = TemplateManager.generateDefaultCellMappings(1);

// Merge additional mappings
const mergedMappings = TemplateManager.mergeCellMappings(
  existingMappings,
  additionalMappings
);
```

## File Storage Strategy

### Storage Key Format
Files are stored with template-specific keys:
```
template_{templateId}_{fileName}
```

Example: `template_1_invoice_001.msc`

### Metadata Storage
Each file stores complete template metadata, ensuring:
- Self-contained file information
- No external dependencies
- Easy backup and restore
- Cross-device compatibility

## Migration Strategy

### Phase 1: Backward Compatibility (Current)
- New architecture runs alongside existing system
- Existing files continue to work without modification
- New files use enhanced metadata structure

### Phase 2: Gradual Migration (Future)
- Utility to migrate existing files to new structure
- Optional metadata enhancement for old files
- Preservation of all existing functionality

### Phase 3: Full Migration (Future)
- Complete transition to new architecture
- Cleanup of legacy code paths
- Performance optimizations

## Template Registry

The application maintains a template registry in localStorage:

```json
{
  "version": "2.0.0",
  "templates": [
    {
      "id": 1,
      "name": "Mobile Invoice 1",
      "version": "1.0.0",
      "created": "2025-01-XX",
      "modified": "2025-01-XX"
    }
  ],
  "initialized": "2025-01-XX"
}
```

## Error Handling

The system includes comprehensive error handling:
- Template validation on initialization
- Graceful fallbacks for missing metadata
- Error logging and recovery mechanisms
- User-friendly error messages

## Development Guidelines

### Adding New Templates
1. Define template data in `/src/templates.ts`
2. Assign unique `templateId`
3. Define appropriate cell mappings
4. Test template isolation

### Extending Metadata
1. Update `TemplateMetadata` interface
2. Update `File` class if needed
3. Add validation logic
4. Update documentation

### Testing Template Isolation
1. Create files with different templates
2. Verify no cross-template interference
3. Test filtering and organization
4. Validate metadata integrity

## Performance Considerations

- Template metadata is stored with each file (slight storage overhead)
- Benefits outweigh costs due to improved organization
- No additional network requests required
- Local storage remains primary storage mechanism

## Security Considerations

- Template metadata is stored in plaintext (non-sensitive data)
- Encryption applies only to MSC content when enabled
- Template isolation prevents accidental data mixing
- No new security vectors introduced

## Future Enhancements

### Planned Features
1. Template versioning system
2. Template import/export functionality
3. Custom template creation tools
4. Advanced cell mapping editor
5. Template sharing capabilities

### Potential Improvements
1. Template validation UI
2. Migration assistant tool
3. Template performance analytics
4. Bulk template operations
5. Template backup/restore tools

---

This multi-template architecture provides a solid foundation for scalable invoice template management while maintaining full backward compatibility with existing functionality.
