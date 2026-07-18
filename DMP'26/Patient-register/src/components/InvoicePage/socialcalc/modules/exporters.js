// Export functionality (CSV, etc.)
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

export function getCSVContent() {
  var val = SocialCalc.WorkBookControlSaveSheet();
  var workBookObject = JSON.parse(val);
  var control = SocialCalc.GetCurrentWorkBookControl();
  var currentname = control.currentSheetButton.id;
  var savestrr = workBookObject.sheetArr[currentname].sheetstr.savestr;
  var res = SocialCalc.ConvertSaveToOtherFormat(savestrr, "csv", false);
  return res;
}
