// Invoice tracking functions
let SocialCalc;

// Ensure SocialCalc is loaded from the global scope
if (typeof window !== "undefined" && window.SocialCalc) {
  SocialCalc = window.SocialCalc;
} else if (typeof global !== "undefined" && global.SocialCalc) {
  SocialCalc = global.SocialCalc;
} else {
  console.error("SocialCalc not found in global scope");
  SocialCalc = {}; // Fallback to prevent errors
}

export function getInvoiceCoordinates() {
  console.log("=== GET INVOICE COORDINATES ===");

  // Invoice coordinates mapping for different sections
  const coordinates = {
    billTo: {
      name: "C5",
      streetAddress: "C6",
      cityStateZip: "C7",
      phone: "C8",
      email: "C9",
    },
    from: {
      name: "C12",
      streetAddress: "C13",
      cityStateZip: "C14",
      phone: "C15",
      email: "C16",
    },
    invoice: {
      number: "C18",
      date: "D20",
    },
    items: {
      // Items from C23-F23 to C35-F35 (13 rows)
      startRow: 23,
      endRow: 35,
      descriptionColumn: "C",
      amountColumn: "F",
    },
    total: {
      sum: "F36",
    },
  };

  console.log("Invoice coordinates mapping:", coordinates);
  console.log("=== END GET INVOICE COORDINATES ===");

  return coordinates;
}

// Helper function to clean up HTML entities and unwanted characters
function cleanCellValue(rawValue) {
  if (!rawValue) {
    return "";
  }

  // Handle numeric values
  if (typeof rawValue === "number") {
    return rawValue;
  }

  // Convert to string and clean up HTML entities
  let cleanValue = rawValue.toString();
  let originalValue = cleanValue; // Store original for logging

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

  // Log if we cleaned something
  if (originalValue !== cleanValue) {
    console.log(`Cleaned cell value: "${originalValue}" -> "${cleanValue}"`);
  }

  return cleanValue;
}

export function addInvoiceData(invoiceData) {
  return new Promise(function (resolve, reject) {
    console.log("=== ADD INVOICE DATA START ===");
    console.log("Invoice data:", invoiceData);

    try {
      var control = SocialCalc.GetCurrentWorkBookControl();
      console.log("Workbook control:", control ? "Found" : "Not found");

      if (!control) {
        throw new Error("No workbook control available");
      }

      if (!control.currentSheetButton) {
        throw new Error("No current sheet button available");
      }

      var currsheet = control.currentSheetButton.id;
      console.log("Current active sheet:", currsheet);

      // Get invoice coordinates
      const coordinates = getInvoiceCoordinates();

      // Build commands to set all values
      var commands = [];

      // Set Bill To information
      if (invoiceData.billTo) {
        if (invoiceData.billTo.name) {
          commands.push(
            `set ${coordinates.billTo.name} text t ${invoiceData.billTo.name}`
          );
        }
        if (invoiceData.billTo.streetAddress) {
          commands.push(
            `set ${coordinates.billTo.streetAddress} text t ${invoiceData.billTo.streetAddress}`
          );
        }
        if (invoiceData.billTo.cityStateZip) {
          commands.push(
            `set ${coordinates.billTo.cityStateZip} text t ${invoiceData.billTo.cityStateZip}`
          );
        }
        if (invoiceData.billTo.phone) {
          commands.push(
            `set ${coordinates.billTo.phone} text t ${invoiceData.billTo.phone}`
          );
        }
        if (invoiceData.billTo.email) {
          commands.push(
            `set ${coordinates.billTo.email} text t ${invoiceData.billTo.email}`
          );
        }
      }

      // Set From information
      if (invoiceData.from) {
        if (invoiceData.from.name) {
          commands.push(
            `set ${coordinates.from.name} text t ${invoiceData.from.name}`
          );
        }
        if (invoiceData.from.streetAddress) {
          commands.push(
            `set ${coordinates.from.streetAddress} text t ${invoiceData.from.streetAddress}`
          );
        }
        if (invoiceData.from.cityStateZip) {
          commands.push(
            `set ${coordinates.from.cityStateZip} text t ${invoiceData.from.cityStateZip}`
          );
        }
        if (invoiceData.from.phone) {
          commands.push(
            `set ${coordinates.from.phone} text t ${invoiceData.from.phone}`
          );
        }
        if (invoiceData.from.email) {
          commands.push(
            `set ${coordinates.from.email} text t ${invoiceData.from.email}`
          );
        }
      }

      // Set Invoice information
      if (invoiceData.invoice) {
        if (invoiceData.invoice.number) {
          commands.push(
            `set ${coordinates.invoice.number} text t ${invoiceData.invoice.number}`
          );
        }
        if (invoiceData.invoice.date) {
          commands.push(
            `set ${coordinates.invoice.date} text t ${invoiceData.invoice.date}`
          );
        }
      }

      // Clear existing items first
      for (
        let row = coordinates.items.startRow;
        row <= coordinates.items.endRow;
        row++
      ) {
        commands.push(
          `erase ${coordinates.items.descriptionColumn}${row} formulas`
        );
        commands.push(`erase ${coordinates.items.amountColumn}${row} formulas`);
      }

      // Set Items
      if (invoiceData.items && Array.isArray(invoiceData.items)) {
        let totalAmount = 0;

        invoiceData.items.forEach((item, index) => {
          const row = coordinates.items.startRow + index;
          if (row <= coordinates.items.endRow) {
            if (item.description) {
              commands.push(
                `set ${coordinates.items.descriptionColumn}${row} text t ${item.description}`
              );
            }
            if (item.amount !== undefined && item.amount !== "") {
              const amount = parseFloat(item.amount) || 0;
              commands.push(
                `set ${coordinates.items.amountColumn}${row} value n ${amount}`
              );
              totalAmount += amount;
            }
          }
        });

        // Set total sum
        commands.push(`set ${coordinates.total.sum} value n ${totalAmount}`);
      }

      var cmd = commands.join("\n") + "\n";
      console.log("Generated SocialCalc commands:", cmd);

      var commandObj = {
        cmdtype: "scmd",
        id: currsheet,
        cmdstr: cmd,
        saveundo: false,
      };

      console.log("Command object:", commandObj);

      try {
        control.ExecuteWorkBookControlCommand(commandObj, false);
        console.log("✓ Invoice data added successfully");
        console.log("=== ADD INVOICE DATA SUCCESS ===");
        resolve(true);
      } catch (execError) {
        console.error("Error executing command:", execError);
        throw execError;
      }
    } catch (error) {
      console.error("=== ADD INVOICE DATA ERROR ===");
      console.error("Error details:", error);
      console.error("Stack trace:", error.stack);
      reject(error);
    }
  });
}

export function getDynamicInvoiceData(cellReferences) {
  return new Promise(function (resolve, reject) {
    console.log("=== GET DYNAMIC INVOICE DATA START ===");
    console.log("Cell references to read:", cellReferences);

    try {
      var control = SocialCalc.GetCurrentWorkBookControl();
      console.log("Workbook control:", control ? "Found" : "Not found");

      if (!control) {
        throw new Error("No workbook control available");
      }

      if (!control.currentSheetButton) {
        throw new Error("No current sheet button available");
      }

      var currsheet = control.currentSheetButton.id;
      console.log("Current active sheet:", currsheet);

      // Get the current sheet object
      var sheet = control.workbook.sheetArr[currsheet]?.sheet;
      if (!sheet) {
        throw new Error("Sheet not found: " + currsheet);
      }

      var cellData = {};

      // Read values from each cell reference
      cellReferences.forEach((cellRef) => {
        try {
          var cell = sheet.cells[cellRef];
          var value = "";

          if (cell) {
            // Get the display value of the cell
            if (cell.datatype === "v") {
              // Numeric value
              value = cell.datavalue !== undefined ? cell.datavalue : "";
            } else if (cell.datatype === "t") {
              // Text value
              value = cell.datavalue !== undefined ? cell.datavalue : "";
            } else if (cell.datatype === "f") {
              // Formula - get the calculated value
              value =
                cell.valuetype === "n"
                  ? cell.datavalue
                  : cell.displaystring || "";
            } else {
              // Other types - try to get display value
              value = cell.displaystring || cell.datavalue || "";
            }

            // Clean up HTML entities and unwanted characters
            value = cleanCellValue(value);
          }

          cellData[cellRef] = value;
          console.log(`Cell ${cellRef} = ${value}`);
        } catch (cellError) {
          console.warn(`Error reading cell ${cellRef}:`, cellError);
          cellData[cellRef] = "";
        }
      });

      console.log("Retrieved cell data:", cellData);
      console.log("=== GET DYNAMIC INVOICE DATA SUCCESS ===");
      resolve(cellData);
    } catch (error) {
      console.error("=== GET DYNAMIC INVOICE DATA ERROR ===");
      console.error("Error details:", error);
      console.error("Stack trace:", error.stack);
      reject(error);
    }
  });
}

export function addDynamicInvoiceData(cellData, sheetId) {
  return new Promise(function (resolve, reject) {
    console.log("=== ADD DYNAMIC INVOICE DATA START ===");
    console.log("Cell data:", cellData);
    console.log("Sheet ID:", sheetId);

    try {
      var control = SocialCalc.GetCurrentWorkBookControl();
      console.log("Workbook control:", control ? "Found" : "Not found");

      if (!control) {
        throw new Error("No workbook control available");
      }

      if (!control.currentSheetButton) {
        throw new Error("No current sheet button available");
      }

      var currsheet = control.currentSheetButton.id;
      console.log("Current active sheet:", currsheet);

      // Build commands to set all values from cellData
      var commands = [];

      // Iterate through cellData and create set commands
      Object.entries(cellData).forEach(([cellRef, value]) => {
        if (value !== undefined && value !== null) {
          if (value === "") {
            // Clear the cell if value is empty string
            commands.push(`set ${cellRef} value`);
            console.log(`Clearing cell ${cellRef}`);
          } else {
            // Determine if the value is numeric or text
            const stringValue = value.toString().trim();
            const numericValue = parseFloat(stringValue);

            if (
              !isNaN(numericValue) &&
              isFinite(numericValue) &&
              stringValue === numericValue.toString()
            ) {
              // It's a valid number
              commands.push(`set ${cellRef} value n ${numericValue}`);
            } else {
              // It's text - encode it properly for SocialCalc
              const encodedValue = SocialCalc.encodeForSave
                ? SocialCalc.encodeForSave(stringValue)
                : stringValue;
              commands.push(`set ${cellRef} text t ${encodedValue}`);
            }
            console.log(`Setting cell ${cellRef} = ${value}`);
          }
        }
      });

      if (commands.length === 0) {
        console.log("No data to update");
        resolve(true);
        return;
      }

      var cmd = commands.join("\n") + "\n";
      console.log("Generated SocialCalc commands:", cmd);

      var commandObj = {
        cmdtype: "scmd",
        id: currsheet,
        cmdstr: cmd,
        saveundo: false,
      };

      console.log("Command object:", commandObj);

      try {
        control.ExecuteWorkBookControlCommand(commandObj, false);
        console.log("✓ Dynamic invoice data added successfully");
        console.log("=== ADD DYNAMIC INVOICE DATA SUCCESS ===");
        resolve(true);
      } catch (execError) {
        console.error("Error executing command:", execError);
        throw execError;
      }
    } catch (error) {
      console.error("=== ADD DYNAMIC INVOICE DATA ERROR ===");
      console.error("Error details:", error);
      console.error("Stack trace:", error.stack);
      reject(error);
    }
  });
}

export function clearDynamicInvoiceData(cellData) {
  return new Promise(function (resolve, reject) {
    console.log("=== CLEAR DYNAMIC INVOICE DATA START ===");
    console.log("Cell data to clear:", cellData);

    try {
      var control = SocialCalc.GetCurrentWorkBookControl();
      console.log("Workbook control:", control ? "Found" : "Not found");

      if (!control) {
        throw new Error("No workbook control available");
      }

      if (!control.currentSheetButton) {
        throw new Error("No current sheet button available");
      }

      var currsheet = control.currentSheetButton.id;
      console.log("Current active sheet:", currsheet);

      // Build commands to clear all values from cellData
      var commands = [];

      // If cellData is provided, clear only those specific cells
      if (cellData && Object.keys(cellData).length > 0) {
        Object.keys(cellData).forEach((cellRef) => {
          commands.push(`erase ${cellRef} formulas`);
        });
      } else {
        // Fallback to clearing predefined coordinates
        const coordinates = getInvoiceCoordinates();

        // Clear Bill To information
        commands.push(`erase ${coordinates.billTo.name} formulas`);
        commands.push(`erase ${coordinates.billTo.streetAddress} formulas`);
        commands.push(`erase ${coordinates.billTo.cityStateZip} formulas`);
        commands.push(`erase ${coordinates.billTo.phone} formulas`);
        commands.push(`erase ${coordinates.billTo.email} formulas`);

        // Clear From information
        commands.push(`erase ${coordinates.from.name} formulas`);
        commands.push(`erase ${coordinates.from.streetAddress} formulas`);
        commands.push(`erase ${coordinates.from.cityStateZip} formulas`);
        commands.push(`erase ${coordinates.from.phone} formulas`);
        commands.push(`erase ${coordinates.from.email} formulas`);

        // Clear Invoice information
        commands.push(`erase ${coordinates.invoice.number} formulas`);
        commands.push(`erase ${coordinates.invoice.date} formulas`);

        // Clear all items
        for (
          let row = coordinates.items.startRow;
          row <= coordinates.items.endRow;
          row++
        ) {
          commands.push(
            `erase ${coordinates.items.descriptionColumn}${row} formulas`
          );
          commands.push(
            `erase ${coordinates.items.amountColumn}${row} formulas`
          );
        }

        // Clear total
        commands.push(`erase ${coordinates.total.sum} formulas`);
      }

      var cmd = commands.join("\n") + "\n";
      console.log("Generated SocialCalc clear commands:", cmd);

      var commandObj = {
        cmdtype: "scmd",
        id: currsheet,
        cmdstr: cmd,
        saveundo: false,
      };

      console.log("Command object:", commandObj);

      try {
        control.ExecuteWorkBookControlCommand(commandObj, false);
        console.log("✓ Dynamic invoice data cleared successfully");
        console.log("=== CLEAR DYNAMIC INVOICE DATA SUCCESS ===");
        resolve(true);
      } catch (execError) {
        console.error("Error executing command:", execError);
        throw execError;
      }
    } catch (error) {
      console.error("=== CLEAR DYNAMIC INVOICE DATA ERROR ===");
      console.error("Error details:", error);
      console.error("Stack trace:", error.stack);
      reject(error);
    }
  });
}

export function clearInvoiceData() {
  return new Promise(function (resolve, reject) {
    console.log("=== CLEAR INVOICE DATA START ===");

    try {
      var control = SocialCalc.GetCurrentWorkBookControl();
      console.log("Workbook control:", control ? "Found" : "Not found");

      if (!control) {
        throw new Error("No workbook control available");
      }

      if (!control.currentSheetButton) {
        throw new Error("No current sheet button available");
      }

      var currsheet = control.currentSheetButton.id;
      console.log("Current active sheet:", currsheet);

      // Get invoice coordinates
      const coordinates = getInvoiceCoordinates();

      // Build commands to clear all values
      var commands = [];

      // Clear Bill To information
      commands.push(`erase ${coordinates.billTo.name} formulas`);
      commands.push(`erase ${coordinates.billTo.streetAddress} formulas`);
      commands.push(`erase ${coordinates.billTo.cityStateZip} formulas`);
      commands.push(`erase ${coordinates.billTo.phone} formulas`);
      commands.push(`erase ${coordinates.billTo.email} formulas`);

      // Clear From information
      commands.push(`erase ${coordinates.from.name} formulas`);
      commands.push(`erase ${coordinates.from.streetAddress} formulas`);
      commands.push(`erase ${coordinates.from.cityStateZip} formulas`);
      commands.push(`erase ${coordinates.from.phone} formulas`);
      commands.push(`erase ${coordinates.from.email} formulas`);

      // Clear Invoice information
      commands.push(`erase ${coordinates.invoice.number} formulas`);
      commands.push(`erase ${coordinates.invoice.date} formulas`);

      // Clear all items
      for (
        let row = coordinates.items.startRow;
        row <= coordinates.items.endRow;
        row++
      ) {
        commands.push(
          `erase ${coordinates.items.descriptionColumn}${row} formulas`
        );
        commands.push(`erase ${coordinates.items.amountColumn}${row} formulas`);
      }

      // Clear total
      commands.push(`erase ${coordinates.total.sum} formulas`);

      var cmd = commands.join("\n") + "\n";
      console.log("Generated SocialCalc clear commands:", cmd);

      var commandObj = {
        cmdtype: "scmd",
        id: currsheet,
        cmdstr: cmd,
        saveundo: false,
      };

      console.log("Command object:", commandObj);

      try {
        control.ExecuteWorkBookControlCommand(commandObj, false);
        console.log("✓ Invoice data cleared successfully");
        console.log("=== CLEAR INVOICE DATA SUCCESS ===");
        resolve(true);
      } catch (execError) {
        console.error("Error executing command:", execError);
        throw execError;
      }
    } catch (error) {
      console.error("=== CLEAR INVOICE DATA ERROR ===");
      console.error("Error details:", error);
      console.error("Stack trace:", error.stack);
      reject(error);
    }
  });
}
