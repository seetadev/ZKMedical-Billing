// Import as a side-effect to load the global
import "./aspiring/SocialCalc.js";

// Access the global SocialCalc that was created by the UMD module
let SocialCalc;

// Ensure SocialCalc is loaded from the global scope
if (typeof window !== 'undefined' && window.SocialCalc) {
  SocialCalc = window.SocialCalc;
} else if (typeof global !== 'undefined' && global.SocialCalc) {
  SocialCalc = global.SocialCalc;
} else {
  console.error('SocialCalc not found in global scope');
  SocialCalc = {}; // Fallback to prevent errors
}

export function getDeviceType() {
  /* Returns the type of the device */
  var device = "default";
  if (navigator.userAgent.match(/iPod/)) device = "iPod";
  if (navigator.userAgent.match(/iPad/)) device = "iPad";
  if (navigator.userAgent.match(/iPhone/)) device = "iPhone";
  if (navigator.userAgent.match(/Android/)) device = "Android";
  return device;
}

export function initializeApp(data) {
  /* Initializes the spreadsheet */

  let tableeditor = document.getElementById("tableeditor");
  let spreadsheet = new SocialCalc.SpreadsheetControl();
  let workbook = new SocialCalc.WorkBook(spreadsheet);
  workbook.InitializeWorkBook("sheet1");

  spreadsheet.InitializeSpreadsheetControl(tableeditor, 0, 0, 0);
  spreadsheet.ExecuteCommand("redisplay", "");

  let workbookcontrol = new SocialCalc.WorkBookControl(
    workbook,
    "workbookControl",
    "sheet1"
  );
  workbookcontrol.InitializeWorkBookControl();
  // alert("app: "+JSON.stringify(data));
  SocialCalc.WorkBookControlLoad(data);
  // Fixed height setting - this could be problematic for mobile
  let ele = document.getElementById("te_griddiv");
  // ele.style.height = "1600px";
  spreadsheet.DoOnResize();
}
export function activateFooterButton(index) {
  if (index === SocialCalc.oldBtnActive) return;
  var control = SocialCalc.GetCurrentWorkBookControl();

  var sheets = [];
  for (var key in control.sheetButtonArr) {
    //console.log(key);
    sheets.push(key);
  }
  var spreadsheet = control.workbook.spreadsheet;
  var ele = document.getElementById(spreadsheet.formulabarDiv.id);
  if (ele) {
    SocialCalc.ToggleInputLineButtons(false);
    var input = ele.firstChild;
    input.style.display = "none";
    spreadsheet.editor.state = "start";
  }
  SocialCalc.WorkBookControlActivateSheet(sheets[index - 1]);

  SocialCalc.oldBtnActive = index;
}

export function viewFile(filename, data) {
  SocialCalc.WorkBookControlInsertWorkbook(data);

  SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor.state =
    "start";

  SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.ExecuteCommand(
    "redisplay",
    ""
  );

  window.setTimeout(function () {
    SocialCalc.ScrollRelativeBoth(
      SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor,
      1,
      0
    );
    SocialCalc.ScrollRelativeBoth(
      SocialCalc.GetCurrentWorkBookControl().workbook.spreadsheet.editor,
      -1,
      0
    );
  }, 1000);
}

export function getCSVContent() {
  var val = SocialCalc.WorkBookControlSaveSheet();
  var workBookObject = JSON.parse(val);
  var control = SocialCalc.GetCurrentWorkBookControl();
  var currentname = control.currentSheetButton.id;
  var savestrr = workBookObject.sheetArr[currentname].sheetstr.savestr;
  var res = SocialCalc.ConvertSaveToOtherFormat(savestrr, "csv", false);
  return res;
}

export function mustshowprompt(coord) {
  var control = SocialCalc.GetCurrentWorkBookControl();
  var editor = control.workbook.spreadsheet.editor;
  var cellname = editor.workingvalues.currentsheet + "!" + editor.ecell.coord;
  var constraint = SocialCalc.EditableCells.constraints[cellname];
  if (constraint) {
  }
  // for phone apps always show prompt
  return true;
}

export function getinputtype(coord) {
  var control = SocialCalc.GetCurrentWorkBookControl();
  var editor = control.workbook.spreadsheet.editor;
  var cellname = editor.workingvalues.currentsheet + "!" + editor.ecell.coord;
  var constraint = SocialCalc.EditableCells.constraints[cellname];
  if (constraint) {
  }
  return null;
}

export function prompttype(coord) {
  var control = SocialCalc.GetCurrentWorkBookControl();
  var editor = control.workbook.spreadsheet.editor;
  var cellname = editor.workingvalues.currentsheet + "!" + editor.ecell.coord;
  var constraint = SocialCalc.EditableCells.constraints[cellname];

  if (constraint) {
  }
  return null;
}

export function showprompt(coord) {
  // Use the enhanced prompt with formatting buttons
  return enhancedShowPrompt(coord);
}

export function getSpreadsheetContent() {
  return SocialCalc.WorkBookControlSaveSheet();
}

export function getCurrentHTMLContent() {
  var control = SocialCalc.GetCurrentWorkBookControl();
  return control.workbook.spreadsheet.CreateSheetHTML();
}

export function getAllHTMLContent(sheetdata) {
  var appsheets = {};
  // var control = SocialCalc.GetCurrentWorkBookControl();

  for (var i = 1; i <= sheetdata.numsheets; i++) {
    var key = "sheet" + i;
    appsheets[key] = key;
  }

  return SocialCalc.WorkbookControlCreateSheetHTML(appsheets);
}

export function saveAs() {
  return new Promise(function (resolve, reject) {
    navigator.notification.prompt(
      "Please enter the filename", // message
      function (results) {
        if (results.buttonIndex === 2) {
          resolve(results.input1);
        }
      }, // callback to invoke
      "Save as", // title
      ["Cancel", "Save"], // buttonLabels
      "" // defaultText
    );
  });
}

export function getAllOldFiles() {
  return new Promise(function (resolve, reject) {
    var files = {};

    for (var i = 0; i < window.localStorage.length; i++) {
      if (window.localStorage.key(i).length >= 30) continue;
      var filename = window.localStorage.key(i);

      if (filename === "logoArray") continue;
      if (filename === "inapp") continue;
      if (filename === "sound") continue;
      if (filename === "cloudInapp") continue;
      if (filename === "inapplocal") continue;
      if (filename === "inappPurchase") continue;
      if (filename === "flag") continue;
      if (filename === "share") continue;
      if (filename === "cellArray") continue;
      if (filename === "sk_receiptForProduct") continue;
      if (filename === "sk_receiptForTransaction") continue;
      if (
        filename === "didTutorial" ||
        filename === "customise" ||
        filename === "rename" ||
        filename === "choice"
      )
        continue;
      /// console.log(filename);
      var filedata = decodeURIComponent(window.localStorage.getItem(filename));

      files[filename] = filedata;
    }
    // console.log(files);
    resolve(files);
  });
}

export function deleteAllOldFiles(files) {
  return new Promise(function (resolve, reject) {
    for (var i in files) {
      console.log("Removing.." + i);
      window.localStorage.removeItem(i);
    }
    resolve(true);
  });
}

export function addLogo(coord, url) {
  return new Promise(function (resolve, reject) {
    console.log("=== ADD LOGO START ===");
    console.log("URL provided:", url);
    console.log("Coordinates object:", coord);

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

      var commandExecuted = false;
      var cmd = "";

      console.log("Iterating through coordinate mapping...");
      for (var sheetname in coord) {
        console.log(
          `Checking sheet: ${sheetname}, coordinate: ${coord[sheetname]}`
        );

        if (coord[sheetname] !== null && coord[sheetname] !== undefined) {
          if (currsheet === sheetname) {
            console.log(
              `✓ Match found! Adding logo to sheet: ${sheetname} at cell: ${coord[sheetname]}`
            );

            cmd =
              "set " +
              coord[sheetname] +
              ' text t <img src="' +
              url +
              '" height="100" width="150" alt="Company Logo"></img>' +
              "\n";

            console.log("Generated SocialCalc command:", cmd);

            var commandObj = {
              cmdtype: "scmd",
              id: currsheet,
              cmdstr: cmd,
              saveundo: false,
            };

            console.log("Command object:", commandObj);

            try {
              control.ExecuteWorkBookControlCommand(commandObj, false);
              console.log("✓ Command executed successfully");
              commandExecuted = true;
            } catch (execError) {
              console.error("Error executing command:", execError);
              throw execError;
            }

            break; // Exit loop after processing current sheet
          } else {
            console.log(`- Skipping sheet ${sheetname} (not current sheet)`);
          }
        } else {
          console.log(
            `- Skipping sheet ${sheetname} (null/undefined coordinate)`
          );
        }
      }

      if (!commandExecuted) {
        console.warn(
          "Warning: No logo command was executed. Current sheet may not be in coordinate mapping."
        );
      }

      console.log("=== ADD LOGO SUCCESS ===");
      resolve(true);
    } catch (error) {
      console.error("=== ADD LOGO ERROR ===");
      console.error("Error details:", error);
      console.error("Stack trace:", error.stack);
      reject(error);
    }
  });
}

export function removeLogo(coord) {
  return new Promise(function (resolve, reject) {
    console.log("=== REMOVE LOGO START ===");
    console.log("Coordinates object:", coord);

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

      var commandExecuted = false;
      var cmd = "";

      console.log("Iterating through coordinate mapping...");
      for (var sheetname in coord) {
        console.log(
          `Checking sheet: ${sheetname}, coordinate: ${coord[sheetname]}`
        );

        if (coord[sheetname] !== null && coord[sheetname] !== undefined) {
          if (currsheet === sheetname) {
            console.log(
              `✓ Match found! Removing logo from sheet: ${sheetname} at cell: ${coord[sheetname]}`
            );

            cmd = "erase " + coord[sheetname] + " formulas";
            console.log("Generated SocialCalc command:", cmd);

            var commandObj = {
              cmdtype: "scmd",
              id: currsheet,
              cmdstr: cmd,
              saveundo: false,
            };

            console.log("Command object:", commandObj);

            try {
              control.ExecuteWorkBookControlCommand(commandObj, false);
              console.log("✓ Command executed successfully");
              commandExecuted = true;
            } catch (execError) {
              console.error("Error executing command:", execError);
              throw execError;
            }

            break; // Exit loop after processing current sheet
          } else {
            console.log(`- Skipping sheet ${sheetname} (not current sheet)`);
          }
        } else {
          console.log(
            `- Skipping sheet ${sheetname} (null/undefined coordinate)`
          );
        }
      }

      if (!commandExecuted) {
        console.warn(
          "Warning: No logo removal command was executed. Current sheet may not be in coordinate mapping."
        );
      }

      console.log("=== REMOVE LOGO SUCCESS ===");
      resolve(true);
    } catch (error) {
      console.error("=== REMOVE LOGO ERROR ===");
      console.error("Error details:", error);
      console.error("Stack trace:", error.stack);
      reject(error);
    }
  });
}

export function undo() {
  var control = SocialCalc.GetCurrentWorkBookControl();
  //alert('control are'+control);
  var editor = control.workbook.spreadsheet.editor;
  editor.context.sheetobj.SheetUndo();
}

export function redo() {
  var control = SocialCalc.GetCurrentWorkBookControl();
  //alert('control are'+control);
  var editor = control.workbook.spreadsheet.editor;
  editor.context.sheetobj.SheetRedo();
}

export function getCurrentSheet() {
  return SocialCalc.GetCurrentWorkBookControl().currentSheetButton.id;
}

export function changeSheetColor(name) {
  var control = SocialCalc.GetCurrentWorkBookControl();
  var editor = control.workbook.spreadsheet.editor;

  name = name.toLowerCase();
  //console.log("changing sheet color to: "+name);
  SocialCalc.EditorChangeSheetcolor(editor, name);
}

export function changeSheetFontColor(colorName) {
  var control = SocialCalc.GetCurrentWorkBookControl();
  var editor = control.workbook.spreadsheet.editor;

  // Create command to set sheet default font color
  var cmdline = "set sheet defaultcolor " + colorName;
  editor.EditorScheduleSheetCommands(cmdline, true, false);
}

export function changeSheetBackgroundColor(colorName) {
  var control = SocialCalc.GetCurrentWorkBookControl();
  var editor = control.workbook.spreadsheet.editor;

  // Create command to set sheet default background color
  var cmdline = "set sheet defaultbgcolor " + colorName;
  editor.EditorScheduleSheetCommands(cmdline, true, false);
}

export function changeFontSheet(cmdline) {
  var control = SocialCalc.GetCurrentWorkBookControl();
  //alert('control are'+control);
  var editor = control.workbook.spreadsheet.editor;
  editor.EditorScheduleSheetCommands(cmdline, true, false);
}

export function executeCommand(cmdline) {
  var control = SocialCalc.GetCurrentWorkBookControl();
  //alert('control are'+control);
  var editor = control.workbook.spreadsheet.editor;
  editor.EditorScheduleSheetCommands(cmdline, true, false);
}

// Listening to CHANGES::

export function setupCellChangeListener(callback) {
  var control = SocialCalc.GetCurrentWorkBookControl();

  // Add safety check
  if (!control || !control.workbook || !control.workbook.spreadsheet) {
    console.warn("Spreadsheet not initialized yet. Retrying in 100ms...");
    setTimeout(() => setupCellChangeListener(callback), 100);
    return () => {}; // Return empty cleanup function
  }

  var editor = control.workbook.spreadsheet.editor;

  // Store original save edit method
  var originalSaveEdit = SocialCalc.EditorSaveEdit;

  SocialCalc.EditorSaveEdit = function (editor, text) {
    var coord = editor.ecell.coord;
    var oldValue = SocialCalc.GetCellContents(editor.context.sheetobj, coord);

    // Call original method
    var result = originalSaveEdit.call(this, editor, text);

    // Trigger callback if value changed
    if (callback && oldValue !== text) {
      var currentControl = SocialCalc.GetCurrentWorkBookControl();
      if (currentControl && currentControl.currentSheetButton) {
        callback({
          coord: coord,
          oldValue: oldValue,
          newValue: text,
          timestamp: new Date(),
          sheetId: currentControl.currentSheetButton.id,
        });
      }
    }

    return result;
  };

  // Return cleanup function that restores original method
  return function cleanup() {
    SocialCalc.EditorSaveEdit = originalSaveEdit;
  };
}

export function getAllSheetsData() {
  var control = SocialCalc.GetCurrentWorkBookControl();
  if (!control || !control.workbook || !control.sheetButtonArr) {
    return [];
  }

  var sheetsData = [];
  var currentSheetId = control.currentSheetButton
    ? control.currentSheetButton.id
    : null;

  // Get all sheet names
  for (var sheetId in control.sheetButtonArr) {
    // Temporarily switch to each sheet to get its HTML content
    SocialCalc.WorkBookControlActivateSheet(sheetId);

    var htmlContent = control.workbook.spreadsheet.CreateSheetHTML();

    sheetsData.push({
      id: sheetId,
      name: sheetId.replace("sheet", "Sheet "), // Convert 'sheet1' to 'Sheet 1'
      htmlContent: htmlContent,
    });
  }

  // Switch back to the original sheet if it existed
  if (currentSheetId) {
    SocialCalc.WorkBookControlActivateSheet(currentSheetId);
  }

  return sheetsData;
}

export function getWorkbookInfo() {
  var control = SocialCalc.GetCurrentWorkBookControl();
  if (!control || !control.sheetButtonArr) {
    return { numsheets: 0, sheets: [] };
  }

  var sheets = [];
  for (var sheetId in control.sheetButtonArr) {
    sheets.push(sheetId);
  }

  return {
    numsheets: sheets.length,
    sheets: sheets,
  };
}

export function getLogoCoordinates() {
  const deviceType = getDeviceType();
  console.log("=== GET LOGO COORDINATES ===");
  console.log("Detected device type:", deviceType);

  // Import the LOGO configuration (you'll need to import this)
  // For now, returning a basic structure - you should import from app-data-new.ts
  const LOGO = {
    iPad: {
      sheet1: "F4",
      sheet2: "F4",
      sheet3: "F4",
      sheet4: "F4",
    },
    iPhone: {
      sheet1: "F5",
      sheet2: "F7",
      sheet3: "F8",
      sheet4: null,
      sheet5: null,
    },
    iPod: {
      sheet1: "F5",
      sheet2: "F7",
      sheet3: "F8",
      sheet4: null,
      sheet5: null,
    },
    Android: {
      sheet1: "F5",
      sheet2: "F7",
      sheet3: "F8",
      sheet4: null,
      sheet5: null,
    },
    default: {
      sheet1: "F4",
      sheet2: "F4",
      sheet3: "F4",
      sheet4: "F4",
    },
  };

  const coordinates = LOGO[deviceType] || LOGO.default;
  console.log("Selected coordinates:", coordinates);
  console.log("=== END GET LOGO COORDINATES ===");

  return coordinates;
}
export function getSignatureCoordinates() {
  const deviceType = getDeviceType();
  console.log("=== GET SIGNATURE COORDINATES ===");
  console.log("Detected device type:", deviceType);

  // Import the SIGNATURE configuration (you'll need to import this)
  // For now, returning a basic structure - you should import from app-data-new.ts
  const SIGNATURE = {
    iPad: {
      sheet1: null,
      sheet2: null,
      sheet3: null,
      sheet4: null,
    },
    iPhone: {
      sheet1: null,
      sheet2: null,
      sheet3: null,
      sheet4: null,
      sheet5: null,
    },
    iPod: {
      sheet1: null,
      sheet2: null,
      sheet3: null,
      sheet4: null,
      sheet5: null,
    },
    Android: {
      sheet1: null,
      sheet2: null,
      sheet3: null,
      sheet4: null,
      sheet5: null,
    },
    default: {
      sheet1: "D31",
      sheet2: "D31",
      sheet3: "C36",
      sheet4: "C36",
    },
  };

  const coordinates = SIGNATURE[deviceType] || SIGNATURE.default;
  console.log("Selected coordinates:", coordinates);
  console.log("=== END GET SIGNATURE COORDINATES ===");

  return coordinates;
}

export function showFormattingButtons(coord, callback) {
  console.log("Showing formatting buttons for cell:", coord);

  if (window.cellFormattingInstance) {
    window.cellFormattingInstance.hideButtons();
  }

  window.cellFormattingInstance = {
    coord: coord,
    callback: callback,
    hideButtons: function () {
      const existingButtons = document.getElementById(
        "cell-formatting-buttons"
      );
      if (existingButtons) {
        existingButtons.remove();
      }
    },
  };

  const control = SocialCalc.GetCurrentWorkBookControl();
  const editor = control.workbook.spreadsheet.editor;

  // Get current cell formatting
  const currentFormatting = getCellFormatting(coord);
  console.log("Current cell formatting:", currentFormatting);

  // Create floating formatting buttons
  const buttonsContainer = document.createElement("div");
  buttonsContainer.id = "cell-formatting-buttons";

  // Check if dark theme is active
  const isDarkTheme =
    document.body.classList.contains("dark-theme") ||
    document.querySelector(".dark-theme") !== null;

  const baseStyles = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 220px;
  `;

  const themeStyles = isDarkTheme
    ? "background: #1a1a1a; border: 1px solid #444; color: #fff;"
    : "background: white; border: 1px solid #ccc; color: #000;";

  buttonsContainer.style.cssText = baseStyles + themeStyles;

  // Font Size Section
  const fontSizeSection = document.createElement("div");
  const fontSizeButtonStyle = isDarkTheme
    ? "padding: 4px 8px; border: 1px solid #555; border-radius: 4px; background: #2a2a2a; color: #fff; cursor: pointer; font-size: 10px;"
    : "padding: 4px 8px; border: 1px solid #ccc; border-radius: 4px; background: #f8f9fa; color: #000; cursor: pointer; font-size: 10px;";

  fontSizeSection.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">Font Size</div>
    <div style="display: flex; gap: 4px; flex-wrap: wrap;">
      <button class="format-btn" data-action="font-size" data-value="8pt" style="${fontSizeButtonStyle}">8pt</button>
      <button class="format-btn" data-action="font-size" data-value="10pt" style="${fontSizeButtonStyle}">10pt</button>
      <button class="format-btn" data-action="font-size" data-value="12pt" style="${fontSizeButtonStyle}">12pt</button>
      <button class="format-btn" data-action="font-size" data-value="14pt" style="${fontSizeButtonStyle}">14pt</button>
      <button class="format-btn" data-action="font-size" data-value="16pt" style="${fontSizeButtonStyle}">16pt</button>
      <button class="format-btn" data-action="font-size" data-value="18pt" style="${fontSizeButtonStyle}">18pt</button>
    </div>
  `;

  // Font Color Section
  const fontColorSection = document.createElement("div");
  fontColorSection.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">Font Color</div>
    <div style="display: flex; gap: 4px; flex-wrap: wrap;">
      <button class="format-btn" data-action="font-color" data-value="black" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: black; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
      <button class="format-btn" data-action="font-color" data-value="red" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: red; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
      <button class="format-btn" data-action="font-color" data-value="blue" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: blue; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
      <button class="format-btn" data-action="font-color" data-value="green" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: green; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
      <button class="format-btn" data-action="font-color" data-value="yellow" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: yellow; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
      <button class="format-btn" data-action="font-color" data-value="purple" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: purple; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
    </div>
  `;

  // Background Color Section
  const bgColorSection = document.createElement("div");
  bgColorSection.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">Background Color</div>
    <div style="display: flex; gap: 4px; flex-wrap: wrap;">
      <button class="format-btn" data-action="bg-color" data-value="white" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: white; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
      <button class="format-btn" data-action="bg-color" data-value="lightgray" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: lightgray; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
      <button class="format-btn" data-action="bg-color" data-value="lightblue" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: lightblue; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
      <button class="format-btn" data-action="bg-color" data-value="lightgreen" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: lightgreen; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
      <button class="format-btn" data-action="bg-color" data-value="lightyellow" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: lightyellow; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
      <button class="format-btn" data-action="bg-color" data-value="lightpink" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: lightpink; cursor: pointer; min-width: 30px; min-height: 30px;"></button>
    </div>
  `;

  // Current cell info section
  const cellInfoSection = document.createElement("div");
  cellInfoSection.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px; border-bottom: 1px solid ${
      isDarkTheme ? "#555" : "#eee"
    }; padding-bottom: 8px;">
      Cell ${coord} Formatting
    </div>
  `;

  // Action Buttons
  const actionButtons = document.createElement("div");
  actionButtons.innerHTML = `
    <div style="display: flex; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid ${
      isDarkTheme ? "#555" : "#eee"
    };">
      <button id="apply-formatting" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; flex: 1;">Apply</button>
      <button id="reset-formatting" style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; flex: 1;">Reset</button>
      <button id="cancel-formatting" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; flex: 1;">Cancel</button>
    </div>
  `;

  buttonsContainer.appendChild(cellInfoSection);
  buttonsContainer.appendChild(fontSizeSection);
  buttonsContainer.appendChild(fontColorSection);
  buttonsContainer.appendChild(bgColorSection);
  buttonsContainer.appendChild(actionButtons);

  document.body.appendChild(buttonsContainer);

  let selectedFormatting = {
    fontSize: null,
    fontColor: null,
    bgColor: null,
  };

  // Handle button clicks
  buttonsContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("format-btn")) {
      const action = e.target.getAttribute("data-action");
      const value = e.target.getAttribute("data-value");

      // Remove previous selection in this category
      const categoryButtons = buttonsContainer.querySelectorAll(
        `[data-action="${action}"]`
      );
      categoryButtons.forEach((btn) => {
        if (action === "font-size") {
          btn.style.border = isDarkTheme ? "1px solid #555" : "1px solid #ccc";
        } else {
          btn.style.border = "1px solid #ccc";
        }
      });

      // Highlight selected button
      e.target.style.border = "3px solid #007bff";

      // Store selection
      if (action === "font-size") {
        selectedFormatting.fontSize = value;
      } else if (action === "font-color") {
        selectedFormatting.fontColor = value;
      } else if (action === "bg-color") {
        selectedFormatting.bgColor = value;
      }
    } else if (e.target.id === "apply-formatting") {
      applySelectedFormatting(coord, selectedFormatting);
      window.cellFormattingInstance.hideButtons();
      if (callback) callback();
    } else if (e.target.id === "reset-formatting") {
      resetCellFormatting(coord);
      window.cellFormattingInstance.hideButtons();
      if (callback) callback();
    } else if (e.target.id === "cancel-formatting") {
      window.cellFormattingInstance.hideButtons();
      if (callback) callback();
    }
  });

  // Add close on click outside
  setTimeout(() => {
    document.addEventListener("click", function closeOnClickOutside(e) {
      if (!buttonsContainer.contains(e.target)) {
        window.cellFormattingInstance.hideButtons();
        document.removeEventListener("click", closeOnClickOutside);
        if (callback) callback();
      }
    });
  }, 100);
}

export function applySelectedFormatting(coord, formatting) {
  console.log("Applying formatting:", formatting, "to cell:", coord);

  const control = SocialCalc.GetCurrentWorkBookControl();
  const editor = control.workbook.spreadsheet.editor;

  if (formatting.fontSize) {
    // Use the existing font size approach similar to the original code
    const sizeMap = {
      "8pt": "a", // small
      "10pt": "b", // medium-small
      "12pt": "c", // medium
      "14pt": "d", // medium-large
      "16pt": "e", // large
      "18pt": "f", // extra-large
    };
    const sizeCode = sizeMap[formatting.fontSize] || "c";

    // Try using the font widget function if it exists
    if (typeof SocialCalc.EditorChangefontFromWidget === "function") {
      SocialCalc.EditorChangefontFromWidget(editor, sizeCode);
    } else {
      // Fallback to direct command
      const cmd = `set ${coord} font * * ${formatting.fontSize}`;
      console.log("Executing font command:", cmd);
      editor.EditorScheduleSheetCommands(cmd, true, false);
    }
  }

  if (formatting.fontColor) {
    // Try using the color widget function if it exists
    if (typeof SocialCalc.EditorChangecolorFromWidget === "function") {
      SocialCalc.EditorChangecolorFromWidget(editor, formatting.fontColor);
    } else {
      // Fallback to direct command
      const cmd = `set ${coord} color ${formatting.fontColor}`;
      console.log("Executing color command:", cmd);
      editor.EditorScheduleSheetCommands(cmd, true, false);
    }
  }

  if (formatting.bgColor) {
    const cmd = `set ${coord} bgcolor ${formatting.bgColor}`;
    console.log("Executing bgcolor command:", cmd);
    editor.EditorScheduleSheetCommands(cmd, true, false);
  }

  // Redisplay to show changes
  editor.context.sheetobj.ScheduleSheetCommands("redisplay", false, false);
}

export function resetCellFormatting(coord) {
  console.log("Resetting formatting for cell:", coord);

  const control = SocialCalc.GetCurrentWorkBookControl();
  const editor = control.workbook.spreadsheet.editor;

  // Reset font to default using SocialCalc command
  const fontCmd = `set ${coord} font * * *`;
  console.log("Executing reset font command:", fontCmd);
  editor.EditorScheduleSheetCommands(fontCmd, true, false);

  // Reset color to default
  const colorCmd = `set ${coord} color *`;
  console.log("Executing reset color command:", colorCmd);
  editor.EditorScheduleSheetCommands(colorCmd, true, false);

  // Reset background color to default
  const bgCmd = `set ${coord} bgcolor *`;
  console.log("Executing reset bgcolor command:", bgCmd);
  editor.EditorScheduleSheetCommands(bgCmd, true, false);

  // Redisplay to show changes
  editor.context.sheetobj.ScheduleSheetCommands("redisplay", false, false);
}

export function enhancedShowPrompt(coord) {
  var control = SocialCalc.GetCurrentWorkBookControl();
  var editor = control.workbook.spreadsheet.editor;
  var cellname = editor.workingvalues.currentsheet + "!" + editor.ecell.coord;
  var constraint = SocialCalc.EditableCells.constraints[cellname];
  var highlights = editor.context.highlights;

  var wval = editor.workingvalues;
  if (wval.eccord) {
    wval.ecoord = null;
    console.log("return due to ecoord");
    return;
  }
  wval.ecoord = coord;
  if (!coord) coord = editor.ecell.coord;
  var text = SocialCalc.GetCellContents(editor.context.sheetobj, coord);
  console.log("in enhanced prompt, coord = " + coord + " text=" + text);

  if (
    SocialCalc.Constants.SCNoQuoteInInputBox &&
    text.substring(0, 1) === "'"
  ) {
    text = text.substring(1);
  }

  var cell = SocialCalc.GetEditorCellElement(
    editor,
    editor.ecell.row,
    editor.ecell.col
  );

  var okfn = function (val) {
    var callbackfn = function () {
      console.log("callback val " + val);
      SocialCalc.EditorSaveEdit(editor, val);
    };
    window.setTimeout(callbackfn, 100);
  };

  // highlight the cell
  delete highlights[editor.ecell.coord];
  highlights[editor.ecell.coord] = "cursor";
  editor.UpdateCellCSS(cell, editor.ecell.row, editor.ecell.col);

  var celltext = "Enter Value";
  var title = "Input";
  if (constraint) {
  } else {
    console.log("cell text is null");
  }

  var options = { title: title };
  options["message"] = celltext;
  console.log("text is " + text);
  options["textvalue"] = text;

  function onPrompt(results) {
    if (results.buttonIndex === 3) return;
    else if (results.buttonIndex === 2) {
      // Show formatting buttons
      showFormattingButtons(coord, function () {
        // After formatting is done, clean up highlights
        wval.ecoord = null;
        delete highlights[editor.ecell.coord];
        editor.UpdateCellCSS(cell, editor.ecell.row, editor.ecell.col);
      });
    } else if (results.buttonIndex === 1) {
      okfn(results.input1);
    }
  }

  // Show enhanced prompt with formatting option
  navigator.notification.prompt(
    "Enter value", // message
    onPrompt, // callback to invoke
    "Input", // title
    ["Ok", "Format Cell", "Cancel"], // buttonLabels - added Format Cell option
    "" + text + "" // defaultText
  );

  return true;
}

// Additional helper functions for cell formatting
export function formatCurrentCell(options = {}) {
  const control = SocialCalc.GetCurrentWorkBookControl();
  if (!control || !control.workbook || !control.workbook.spreadsheet) {
    console.warn("Spreadsheet not initialized");
    return;
  }

  const editor = control.workbook.spreadsheet.editor;
  const coord = editor.ecell.coord;

  if (!coord) {
    console.warn("No active cell");
    return;
  }

  showFormattingButtons(coord, options.callback);
}

export function getCellFormatting(coord) {
  const control = SocialCalc.GetCurrentWorkBookControl();
  if (!control || !control.workbook || !control.workbook.spreadsheet) {
    return null;
  }

  const editor = control.workbook.spreadsheet.editor;
  const sheetobj = editor.context.sheetobj;

  if (!coord) {
    coord = editor.ecell.coord;
  }

  const cell = sheetobj.cells[coord];
  if (!cell) {
    return null;
  }

  return {
    font: cell.font || null,
    color: cell.color || null,
    bgcolor: cell.bgcolor || null,
    coord: coord,
  };
}

export function toggleCellFormatting() {
  const control = SocialCalc.GetCurrentWorkBookControl();
  if (!control || !control.workbook || !control.workbook.spreadsheet) {
    console.warn("Spreadsheet not initialized");
    return;
  }

  const editor = control.workbook.spreadsheet.editor;
  const coord = editor.ecell.coord;

  if (!coord) {
    console.warn("No active cell");
    return;
  }

  // Check if formatting buttons are already shown
  const existingButtons = document.getElementById("cell-formatting-buttons");
  if (existingButtons) {
    existingButtons.remove();
    return;
  }

  showFormattingButtons(coord);
}
