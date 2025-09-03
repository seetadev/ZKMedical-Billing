import { TemplateData, ItemsConfig } from "../templates";

export interface DynamicFormField {
  label: string;
  value: string;
  type: "text" | "email" | "number" | "decimal" | "textarea" | "date";
  cellMapping: string;
}

export interface DynamicFormSection {
  title: string;
  fields: DynamicFormField[];
  isItems?: boolean;
  itemsConfig?: {
    name: string;
    range: { start: number; end: number };
    content: { [key: string]: string };
  };
}

export interface ProcessedFormData {
  [sectionKey: string]: any;
}

/**
 * Utility class for managing dynamic form generation based on cell mappings
 */
export class DynamicFormManager {
  /**
   * Cleans up HTML entities and unwanted characters from cell values
   * @param rawValue The raw value from the cell
   * @returns Cleaned string value
   */
  private static cleanCellValue(rawValue: any): string {
    if (!rawValue) {
      return "";
    }

    // Handle numeric values
    if (typeof rawValue === "number") {
      return rawValue.toString();
    }

    // Convert to string and clean up HTML entities
    let cleanValue = rawValue.toString();

    // Replace common HTML entities
    cleanValue = cleanValue
      .replace(/&nbsp;/g, " ") // Non-breaking space
      .replace(/&amp;/g, "&") // Ampersand
      .replace(/&lt;/g, "<") // Less than
      .replace(/&gt;/g, ">") // Greater than
      .replace(/&quot;/g, '"') // Double quote
      .replace(/&#39;/g, "'") // Single quote
      .replace(/&apos;/g, "'") // Apostrophe
      .replace(/&#160;/g, " ") // Non-breaking space (numeric)
      .replace(/&#xa0;/g, " ") // Non-breaking space (hex)
      .replace(/\u00A0/g, " ") // Unicode non-breaking space
      .replace(/\s+/g, " ") // Multiple spaces to single space
      .trim(); // Remove leading/trailing whitespace

    // Remove any remaining HTML tags
    cleanValue = cleanValue.replace(/<[^>]*>/g, "");

    // If the cleaned value is just whitespace or empty, return empty string
    if (!cleanValue || cleanValue.trim() === "") {
      return "";
    }

    return cleanValue;
  }

  /**
   * Determines the field type based on the field label
   * @param label The field label
   * @returns The appropriate input type
   */
  static getFieldType(
    label: string
  ): "text" | "email" | "number" | "decimal" | "textarea" | "date" {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes("email")) return "email";
    if (lowerLabel.includes("date")) return "date";
    if (lowerLabel.includes("number") || lowerLabel.includes("#"))
      return "number";
    if (
      lowerLabel.includes("rate") ||
      lowerLabel.includes("amount") ||
      lowerLabel.includes("price") ||
      lowerLabel.includes("tax") ||
      lowerLabel.includes("hours") ||
      lowerLabel.includes("qty") ||
      lowerLabel.includes("quantity")
    )
      return "decimal";
    if (lowerLabel.includes("notes") || lowerLabel.includes("description"))
      return "textarea";
    return "text";
  }

  /**
   * Generates form sections from cell mappings
   * @param cellMappings The cell mappings object for a specific footer
   * @returns Array of form sections
   */
  static generateFormSections(cellMappings: any): DynamicFormSection[] {
    if (!cellMappings) return [];

    const sections: DynamicFormSection[] = [];

    Object.entries(cellMappings).forEach(([key, value]) => {
      if (key === "Items" && this.isItemsConfig(value)) {
        // Handle new Items structure with Name, Heading, Subheading, Rows, and Columns
        const itemsConfig = value as ItemsConfig;
        sections.push({
          title: itemsConfig.Heading,
          fields: [],
          isItems: true,
          itemsConfig: {
            name: itemsConfig.Subheading,
            range: {
              start: itemsConfig.Rows.start,
              end: itemsConfig.Rows.end,
            },
            content: itemsConfig.Columns,
          },
        });
      } else if (typeof value === "string") {
        // Simple field mapping
        sections.push({
          title: key,
          fields: [
            {
              label: key,
              value: "",
              type: this.getFieldType(key),
              cellMapping: value,
            },
          ],
        });
      } else if (typeof value === "object" && value !== null) {
        // Nested object - create a section with multiple fields
        const fields: DynamicFormField[] = [];

        const processObject = (obj: any, prefix: string = "") => {
          Object.entries(obj).forEach(([subKey, subValue]) => {
            if (typeof subValue === "string") {
              fields.push({
                label: prefix ? `${prefix} ${subKey}` : subKey,
                value: "",
                type: this.getFieldType(subKey),
                cellMapping: subValue,
              });
            } else if (typeof subValue === "object" && subValue !== null) {
              processObject(subValue, subKey);
            }
          });
        };

        processObject(value);

        if (fields.length > 0) {
          sections.push({
            title: key,
            fields,
          });
        }
      }
    });

    return sections;
  }

  /**
   * Type guard to check if an object is an ItemsConfig
   * @param value The value to check
   * @returns True if the value is an ItemsConfig
   */
  static isItemsConfig(value: any): value is ItemsConfig {
    return (
      value &&
      typeof value === "object" &&
      typeof value.Name === "string" &&
      typeof value.Heading === "string" &&
      typeof value.Subheading === "string" &&
      value.Rows &&
      typeof value.Rows.start === "number" &&
      typeof value.Rows.end === "number" &&
      value.Columns &&
      typeof value.Columns === "object"
    );
  }

  /**
   * Initializes form data based on form sections (starting with minimal items)
   * @param sections The form sections
   * @returns Initial form data object
   */
  static initializeFormData(sections: DynamicFormSection[]): ProcessedFormData {
    const formData: ProcessedFormData = {};

    sections.forEach((section) => {
      if (section.isItems && section.itemsConfig) {
        // Initialize items array with just one item
        const itemsArray: any[] = [];
        const item: any = {};
        Object.keys(section.itemsConfig.content).forEach((contentKey) => {
          item[contentKey] = "";
        });
        itemsArray.push(item);
        formData[section.title] = itemsArray;
      } else {
        // Initialize regular fields
        const sectionData: any = {};
        section.fields.forEach((field) => {
          sectionData[field.label] = "";
        });
        formData[section.title] = sectionData;
      }
    });

    return formData;
  }

  /**
   * Validates form data
   * @param formData The form data to validate
   * @param sections The form sections for reference
   * @returns Validation result with errors if any
   */
  static validateFormData(
    formData: ProcessedFormData,
    sections: DynamicFormSection[]
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    sections.forEach((section) => {
      if (section.isItems) {
        const items = formData[section.title] as any[];
        if (items && items.length > 0) {
          items.forEach((item, index) => {
            Object.entries(item).forEach(([key, value]) => {
              if (
                this.getFieldType(key) === "email" &&
                value &&
                !this.isValidEmail(value as string)
              ) {
                errors.push(
                  `Invalid email format in ${
                    section.title
                  } ${section.itemsConfig!.name.toLowerCase()} ${
                    index + 1
                  }: ${key}`
                );
              }
            });
          });
        }
      } else {
        section.fields.forEach((field) => {
          const value = formData[section.title]?.[field.label];
          if (field.type === "email" && value && !this.isValidEmail(value)) {
            errors.push(`Invalid email format: ${field.label}`);
          }
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates email format
   * @param email The email to validate
   * @returns Whether the email is valid
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Converts form data to spreadsheet format for cell mapping
   * @param formData The form data
   * @param sections The form sections
   * @param sheetId The current sheet ID (optional, for future use)
   * @returns Object with cell references and values
   */
  static convertToSpreadsheetFormat(
    formData: ProcessedFormData,
    sections: DynamicFormSection[],
    sheetId?: string | number
  ): { [cellRef: string]: any } {
    const cellData: { [cellRef: string]: any } = {};

    sections.forEach((section) => {
      if (section.isItems && section.itemsConfig) {
        // Handle items with range-based cell mapping
        const items = formData[section.title] as any[];

        if (items && items.length > 0) {
          // Process each item and only save those with meaningful data
          items.forEach((item, index) => {
            const rowNumber = section.itemsConfig!.range.start + index;

            // Check if this item has any meaningful data
            const hasItemData = Object.values(item).some((value) => {
              const trimmedValue = String(value || "").trim();
              return trimmedValue !== "" && trimmedValue !== "0";
            });

            // Only save items that have meaningful data
            if (hasItemData) {
              Object.entries(section.itemsConfig!.content).forEach(
                ([fieldName, columnLetter]) => {
                  const cellRef = `${columnLetter}${rowNumber}`;
                  const value = item[fieldName];
                  const trimmedValue = String(value || "").trim();

                  // Only include fields that have actual content
                  if (trimmedValue !== "" && trimmedValue !== "0") {
                    cellData[cellRef] = value;
                  }
                }
              );
            }
          });
        }

        // For clearing unused rows, we need to explicitly clear them
        // Get the count of rows that have meaningful data
        const usedRowsCount = items
          ? items.filter((item) => {
              return Object.values(item).some((value) => {
                const trimmedValue = String(value || "").trim();
                return trimmedValue !== "" && trimmedValue !== "0";
              });
            }).length
          : 0;

        // Clear any remaining rows that might have old data
        for (
          let rowIndex = usedRowsCount;
          rowIndex <=
          section.itemsConfig.range.end - section.itemsConfig.range.start;
          rowIndex++
        ) {
          const rowNumber = section.itemsConfig.range.start + rowIndex;
          Object.entries(section.itemsConfig.content).forEach(
            ([fieldName, columnLetter]) => {
              const cellRef = `${columnLetter}${rowNumber}`;
              // Only clear if we need to remove old data - mark for explicit clearing
              cellData[cellRef] = "";
            }
          );
        }
      } else {
        // Handle regular fields
        section.fields.forEach((field) => {
          const value = formData[section.title]?.[field.label];
          const trimmedValue = String(value || "").trim();
          if (trimmedValue !== "" && field.cellMapping) {
            cellData[field.cellMapping] = value;
          }
        });
      }
    });

    return cellData;
  }

  /**
   * Converts spreadsheet cell data back to form data structure
   * @param cellData Object with cell references and their values
   * @param sections The form sections to map against
   * @returns ProcessedFormData object
   */
  static convertFromSpreadsheetFormat(
    cellData: { [cellRef: string]: any },
    sections: DynamicFormSection[]
  ): ProcessedFormData {
    const formData: ProcessedFormData = {};

    sections.forEach((section) => {
      if (section.isItems && section.itemsConfig) {
        // Handle items with range-based cell mapping
        const itemsArray: any[] = [];

        for (
          let rowIndex = section.itemsConfig.range.start;
          rowIndex <= section.itemsConfig.range.end;
          rowIndex++
        ) {
          const item: any = {};
          let hasData = false;

          Object.entries(section.itemsConfig.content).forEach(
            ([fieldName, columnLetter]) => {
              const cellRef = `${columnLetter}${rowIndex}`;
              const rawValue = cellData[cellRef] || "";
              const cleanValue = this.cleanCellValue(rawValue);
              item[fieldName] = cleanValue;

              // Check if this field has meaningful data (not empty, not just "0")
              if (
                cleanValue &&
                cleanValue !== "0" &&
                cleanValue.trim() !== ""
              ) {
                hasData = true;
              }
            }
          );

          // Only add items that have meaningful data OR if it's the first row and we don't have any items yet
          if (
            hasData ||
            (itemsArray.length === 0 &&
              rowIndex === section.itemsConfig.range.start)
          ) {
            itemsArray.push(item);
          }
        }

        // Ensure at least one empty item exists if no data was found
        if (itemsArray.length === 0) {
          const emptyItem: any = {};
          Object.keys(section.itemsConfig.content).forEach((fieldName) => {
            emptyItem[fieldName] = "";
          });
          itemsArray.push(emptyItem);
        }

        formData[section.title] = itemsArray;
      } else {
        // Handle regular fields
        const sectionData: any = {};
        section.fields.forEach((field) => {
          if (field.cellMapping) {
            const rawValue = cellData[field.cellMapping] || "";
            sectionData[field.label] = this.cleanCellValue(rawValue);
          }
        });
        formData[section.title] = sectionData;
      }
    });

    return formData;
  }

  /**
   * Gets all cell references from form sections
   * @param sections The form sections
   * @returns Array of cell references
   */
  static getAllCellReferences(sections: DynamicFormSection[]): string[] {
    const cellRefs: string[] = [];

    sections.forEach((section) => {
      if (section.isItems && section.itemsConfig) {
        // Add all item cell references
        for (
          let rowIndex = section.itemsConfig.range.start;
          rowIndex <= section.itemsConfig.range.end;
          rowIndex++
        ) {
          Object.entries(section.itemsConfig.content).forEach(
            ([fieldName, columnLetter]) => {
              cellRefs.push(`${columnLetter}${rowIndex}`);
            }
          );
        }
      } else {
        // Add regular field cell references
        section.fields.forEach((field) => {
          if (field.cellMapping) {
            cellRefs.push(field.cellMapping);
          }
        });
      }
    });

    return cellRefs;
  }

  /**
   * Gets the active footer from a template
   * @param template The template data
   * @returns The active footer or null
   */
  static getActiveFooter(template: TemplateData) {
    return (
      template.footers.find((footer) => footer.isActive) ||
      template.footers[0] ||
      null
    );
  }

  /**
   * Gets form sections based on current sheet ID instead of footer index
   * @param template The template data
   * @param sheetId The current sheet ID
   * @returns Array of form sections for the specified sheet
   */
  static getFormSectionsForSheet(
    template: TemplateData,
    sheetId: string
  ): DynamicFormSection[] {
    const cellMappings = template.cellMappings[sheetId];
    if (!cellMappings) return [];

    return this.generateFormSections(cellMappings);
  }

  /**
   * Filters form sections based on footer index
   * @param template The template data
   * @param footerIndex The footer index to filter by
   * @returns Array of form sections for the specified footer
   */
  static getFormSectionsForFooter(
    template: TemplateData,
    footerIndex: number
  ): DynamicFormSection[] {
    const cellMappings = template.cellMappings[footerIndex];
    if (!cellMappings) return [];

    return this.generateFormSections(cellMappings);
  }
}
