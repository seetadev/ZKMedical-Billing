import "@testing-library/jest-dom";
import { vi, beforeAll, afterAll } from "vitest";
import React from "react";

// Mock Ionic React components
vi.mock("@ionic/react", () => ({
  IonModal: ({ children, isOpen, ...props }: any) =>
    isOpen
      ? React.createElement(
          "div",
          { "data-testid": "ion-modal", ...props },
          children
        )
      : null,
  IonHeader: ({ children, ...props }: any) =>
    React.createElement(
      "div",
      { "data-testid": "ion-header", ...props },
      children
    ),
  IonToolbar: ({ children, ...props }: any) =>
    React.createElement(
      "div",
      { "data-testid": "ion-toolbar", ...props },
      children
    ),
  IonTitle: ({ children, ...props }: any) =>
    React.createElement(
      "div",
      { "data-testid": "ion-title", ...props },
      children
    ),
  IonContent: ({ children, ...props }: any) =>
    React.createElement(
      "div",
      { "data-testid": "ion-content", ...props },
      children
    ),
  IonItem: ({ children, ...props }: any) =>
    React.createElement(
      "div",
      { "data-testid": "ion-item", ...props },
      children
    ),
  IonLabel: ({ children, ...props }: any) =>
    React.createElement(
      "label",
      { "data-testid": "ion-label", ...props },
      children
    ),
  IonInput: ({ value, onIonInput, placeholder, ...props }: any) =>
    React.createElement("input", {
      "data-testid": "ion-input",
      value: value || "",
      onChange: (e: any) => onIonInput?.({ detail: { value: e.target.value } }),
      placeholder,
      ...props,
    }),
  IonTextarea: ({ value, onIonInput, placeholder, ...props }: any) =>
    React.createElement("textarea", {
      "data-testid": "ion-textarea",
      value: value || "",
      onChange: (e: any) => onIonInput?.({ detail: { value: e.target.value } }),
      placeholder,
      ...props,
    }),
  IonButton: ({ children, onClick, ...props }: any) =>
    React.createElement(
      "button",
      { "data-testid": "ion-button", onClick, ...props },
      children
    ),
  IonButtons: ({ children, ...props }: any) =>
    React.createElement(
      "div",
      { "data-testid": "ion-buttons", ...props },
      children
    ),
  IonIcon: ({ icon, ...props }: any) =>
    React.createElement("span", {
      "data-testid": "ion-icon",
      "data-icon": icon,
      ...props,
    }),
  IonGrid: ({ children, ...props }: any) =>
    React.createElement(
      "div",
      { "data-testid": "ion-grid", ...props },
      children
    ),
  IonRow: ({ children, ...props }: any) =>
    React.createElement(
      "div",
      { "data-testid": "ion-row", ...props },
      children
    ),
  IonCol: ({ children, ...props }: any) =>
    React.createElement(
      "div",
      { "data-testid": "ion-col", ...props },
      children
    ),
  IonCard: ({ children, ...props }: any) =>
    React.createElement(
      "div",
      { "data-testid": "ion-card", ...props },
      children
    ),
  IonCardHeader: ({ children, ...props }: any) =>
    React.createElement(
      "div",
      { "data-testid": "ion-card-header", ...props },
      children
    ),
  IonCardTitle: ({ children, ...props }: any) =>
    React.createElement(
      "div",
      { "data-testid": "ion-card-title", ...props },
      children
    ),
  IonCardContent: ({ children, ...props }: any) =>
    React.createElement(
      "div",
      { "data-testid": "ion-card-content", ...props },
      children
    ),
  IonList: ({ children, ...props }: any) =>
    React.createElement(
      "div",
      { "data-testid": "ion-list", ...props },
      children
    ),
  IonToast: ({ isOpen, message, ...props }: any) =>
    isOpen
      ? React.createElement(
          "div",
          { "data-testid": "ion-toast", ...props },
          message
        )
      : null,
  IonItemDivider: ({ children, ...props }: any) =>
    React.createElement(
      "div",
      { "data-testid": "ion-item-divider", ...props },
      children
    ),
  IonFab: ({ children, ...props }: any) =>
    React.createElement(
      "div",
      { "data-testid": "ion-fab", ...props },
      children
    ),
  IonFabButton: ({ children, onClick, ...props }: any) =>
    React.createElement(
      "button",
      { "data-testid": "ion-fab-button", onClick, ...props },
      children
    ),
}));

// Mock Ionic icons
vi.mock("ionicons/icons", () => ({
  addOutline: "add-outline",
  closeOutline: "close-outline",
  close: "close",
  trash: "trash",
  saveOutline: "save-outline",
  documentTextOutline: "document-text-outline",
  downloadOutline: "download-outline",
  checkmarkOutline: "checkmark-outline",
  warningOutline: "warning-outline",
  trashOutline: "trash-outline",
  menuOutline: "menu-outline",
  settingsOutline: "settings-outline",
  homeOutline: "home-outline",
  folderOutline: "folder-outline",
  add: "add",
  remove: "remove",
  edit: "edit",
  save: "save",
  copy: "copy",
  share: "share",
  print: "print",
  refresh: "refresh",
  search: "search",
  filter: "filter",
  list: "list",
  grid: "grid",
  eye: "eye",
  eyeOff: "eye-off",
  calendar: "calendar",
  time: "time",
  location: "location",
  person: "person",
  mail: "mail",
  phone: "phone",
  link: "link",
  image: "image",
  attach: "attach",
  cloud: "cloud",
  download: "download",
  upload: "upload",
  sync: "sync",
  lock: "lock",
  unlock: "unlock",
  heart: "heart",
  star: "star",
  flag: "flag",
  bookmark: "bookmark",
  tag: "tag",
  label: "label",
  help: "help",
  information: "information",
  alert: "alert",
  warning: "warning",
  error: "error",
  success: "success",
  check: "check",
  x: "x",
  plus: "plus",
  minus: "minus",
  arrow: "arrow",
  chevron: "chevron",
  caret: "caret",
}));

// Mock React Router
vi.mock("react-router-dom", () => ({
  useHistory: () => ({
    push: vi.fn(),
    goBack: vi.fn(),
    replace: vi.fn(),
  }),
  useLocation: () => ({
    pathname: "/",
    search: "",
    hash: "",
    state: null,
  }),
  useParams: () => ({}),
  BrowserRouter: ({ children }: any) =>
    React.createElement("div", {}, children),
  Route: ({ children }: any) => React.createElement("div", {}, children),
  Switch: ({ children }: any) => React.createElement("div", {}, children),
  Link: ({ children, to, ...props }: any) =>
    React.createElement("a", { href: to, ...props }, children),
}));

// Mock SocialCalc
(global as any).SocialCalc = {
  SpreadsheetControl: class MockSpreadsheetControl {
    sheet: any;
    editor: any;
    view: any;

    constructor() {
      this.sheet = {
        cells: {},
        names: {},
        attribs: {},
        rowattribs: {},
        colattribs: {},
      };
      this.editor = {
        state: "start",
        workingvalues: {},
      };
      this.view = {
        render: vi.fn(),
      };
    }

    InitializeSpreadsheetControl() {
      return this;
    }

    DoOnClickStep2() {
      return true;
    }

    ExecuteCommand(command: string) {
      console.log("Mock SocialCalc command:", command);
      return true;
    }

    CreateSheetHTML() {
      return "<div>Mock Sheet</div>";
    }
  },

  GetCellContents: vi.fn((sheet: any, coord: string) => {
    const cellData = sheet?.cells?.[coord];
    return cellData?.datavalue || "";
  }),

  SizeSSDiv: vi.fn(),

  ParseSheetSave: vi.fn((str: string) => ({
    sheet: {
      cells: {},
      names: {},
      attribs: {},
      rowattribs: {},
      colattribs: {},
    },
    clipboarddata: "",
  })),

  CreateSheetSave: vi.fn((sheet: any) => "mock:sheet:save:data"),

  Formula: {
    FreshnessInfo: {
      volatile: {},
    },
    SheetCache: {
      sheets: {},
    },
  },

  RecalcData: vi.fn(),

  // Mock invoice module functions
  addInvoiceData: vi.fn((sheet: any, data: any) => {
    console.log("Mock addInvoiceData called with:", data);
    return true;
  }),

  clearInvoiceData: vi.fn((sheet: any) => {
    console.log("Mock clearInvoiceData called");
    return true;
  }),
};

// Mock Capacitor
vi.mock("@capacitor/core", () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
    getPlatform: vi.fn(() => "web"),
  },
}));

// Mock file system APIs
vi.mock("@capacitor/filesystem", () => ({
  Filesystem: {
    writeFile: vi.fn(() => Promise.resolve()),
    readFile: vi.fn(() => Promise.resolve({ data: "" })),
    deleteFile: vi.fn(() => Promise.resolve()),
    mkdir: vi.fn(() => Promise.resolve()),
    readdir: vi.fn(() => Promise.resolve({ files: [] })),
    stat: vi.fn(() =>
      Promise.resolve({ type: "file", size: 0, ctime: 0, mtime: 0 })
    ),
  },
  Directory: {
    Documents: "DOCUMENTS",
    Data: "DATA",
    Cache: "CACHE",
    External: "EXTERNAL",
    ExternalStorage: "EXTERNAL_STORAGE",
  },
  Encoding: {
    UTF8: "utf8",
    ASCII: "ascii",
    UTF16: "utf16",
  },
}));

// Mock share API
vi.mock("@capacitor/share", () => ({
  Share: {
    share: vi.fn(() => Promise.resolve()),
  },
}));

// Mock browser API
vi.mock("@capacitor/browser", () => ({
  Browser: {
    open: vi.fn(() => Promise.resolve()),
    close: vi.fn(() => Promise.resolve()),
  },
}));

// Mock device API
vi.mock("@capacitor/device", () => ({
  Device: {
    getInfo: vi.fn(() =>
      Promise.resolve({
        platform: "web",
        model: "test",
        operatingSystem: "unknown",
        osVersion: "1.0",
        manufacturer: "test",
        isVirtual: false,
        webViewVersion: "1.0",
      })
    ),
  },
}));

// Setup DOM environment
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Setup console to not spam during tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning: ReactDOM.render is deprecated") ||
        args[0].includes("Warning: React.createFactory() is deprecated"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    if (typeof args[0] === "string" && args[0].includes("SocialCalc")) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
