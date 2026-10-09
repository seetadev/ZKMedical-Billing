// Undo/Redo functionality
const SocialCalc = new Proxy({}, {
  get: (target, prop) => {
    const sc = typeof window !== "undefined" && window.SocialCalc 
      ? window.SocialCalc 
      : (typeof global !== "undefined" && global.SocialCalc ? global.SocialCalc : null);
    if (sc) {
      const val = sc[prop];
      if (typeof val === "function") {
        return val.bind(sc);
      }
      return val;
    }
    return undefined;
  },
  set: (target, prop, value) => {
    const sc = typeof window !== "undefined" && window.SocialCalc 
      ? window.SocialCalc 
      : (typeof global !== "undefined" && global.SocialCalc ? global.SocialCalc : null);
    if (sc) {
      sc[prop] = value;
      return true;
    }
    return false;
  }
});

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
