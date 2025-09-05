// Cell and sheet formatting functions
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
