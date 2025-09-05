// User prompt and input functions
import { showFormattingButtons } from "./utils.js";

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
