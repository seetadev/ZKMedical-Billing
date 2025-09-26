// Spreadsheet initialization functions
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

  // Calculate proper height for the spreadsheet
  let ele = document.getElementById("te_griddiv");
  if (ele) {
    // Get the available height from the container
    const container = document.getElementById("container");
    const ionContent = document.querySelector("ion-content");
    const ionHeader = document.querySelector("ion-header");

    if (container && ionContent && ionHeader) {
      const headerHeight = ionHeader.offsetHeight || 0;
      const viewportHeight = window.innerHeight;
      const availableHeight = viewportHeight - headerHeight;

      // Set a more precise height for mobile
      ele.style.height = availableHeight + "px";
      ele.style.marginBottom = "0px";
      ele.style.paddingBottom = "0px";
    }
  }

  spreadsheet.DoOnResize();
}
