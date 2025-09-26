// Cell change listeners and event handling
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

export function setupCellChangeListener(callback) {
  var control = SocialCalc.GetCurrentWorkBookControl();

  // Add safety check
  if (!control || !control.workbook || !control.workbook.spreadsheet) {
    // Spreadsheet not initialized yet. Retrying in 100ms...
      setTimeout(setupListener, 100);
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
