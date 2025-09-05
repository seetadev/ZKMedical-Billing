import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonToast,
  IonAlert,
  IonLabel,
  IonInput,
  IonItemDivider,
  IonModal,
  IonGrid,
  IonRow,
  IonCol,
  IonSegment,
  IonSegmentButton,
  IonFab,
  IonFabButton,
  IonPopover,
  IonList,
  IonItem,
  IonCheckbox,
  isPlatform,
} from "@ionic/react";
import { DATA } from "../templates";
import * as AppGeneral from "../components/socialcalc/index.js";
import { useEffect, useState, useRef } from "react";
import { File } from "../components/Storage/LocalStorage";
import {
  checkmarkCircle,
  syncOutline,
  closeOutline,
  textOutline,
  ellipsisVertical,
  shareSharp,
  downloadOutline,
  createOutline,
  arrowBack,
  documentText,
  folder,
  saveOutline,
  toggleOutline,
  saveSharp,
} from "ionicons/icons";
import "./Home.css";
import FileOptions from "../components/FileMenu/FileOptions";
import Menu from "../components/Menu/Menu";
import { useTheme } from "../contexts/ThemeContext";
import { useInvoice } from "../contexts/InvoiceContext";
import { useHistory, useLocation, useParams } from "react-router-dom";
import DynamicInvoiceForm from "../components/DynamicInvoiceForm";
import { isQuotaExceededError, getQuotaExceededMessage } from "../utils/helper";
import { getAutoSaveEnabled } from "../utils/settings";
import { SheetChangeMonitor } from "../utils/sheetChangeMonitor";
import { backgroundClip } from "html2canvas/dist/types/css/property-descriptors/background-clip";
import WalletConnection from "../components/wallet/WalletConnection";

const Home: React.FC = () => {
  const { isDarkMode } = useTheme();
  const {
    selectedFile,
    billType,
    store,
    updateSelectedFile,
    updateBillType,
    activeTemplateData,
    updateActiveTemplateData,
    updateCurrentSheetId,
  } = useInvoice();
  const history = useHistory();

  const [fileNotFound, setFileNotFound] = useState(false);
  const [templateNotFound, setTemplateNotFound] = useState(false);

  const { fileName } = useParams<{ fileName: string }>();

  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<
    "success" | "danger" | "warning"
  >("success");

  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [saveAsFileName, setSaveAsFileName] = useState("");
  const [saveAsOperation, setSaveAsOperation] = useState<"local" | null>(null);

  // Autosave state
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(
    getAutoSaveEnabled()
  );
  const [showSavePopover, setShowSavePopover] = useState(false);

  // Color picker state
  const [showColorModal, setShowColorModal] = useState(false);
  const [colorMode, setColorMode] = useState<"background" | "font">(
    "background"
  );
  const [customColorInput, setCustomColorInput] = useState("");
  const [activeBackgroundColor, setActiveBackgroundColor] = useState("#f4f5f8");
  const [activeFontColor, setActiveFontColor] = useState("#000000");

  // Actions popover state
  const [showActionsPopover, setShowActionsPopover] = useState(false);

  // Invoice form state
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);

  // Available colors for sheet themes
  const availableColors = [
    { name: "red", label: "Red", color: "#ff4444" },
    { name: "blue", label: "Blue", color: "#3880ff" },
    { name: "green", label: "Green", color: "#2dd36f" },
    { name: "yellow", label: "Yellow", color: "#ffc409" },
    { name: "purple", label: "Purple", color: "#6f58d8" },
    { name: "black", label: "Black", color: "#000000" },
    { name: "white", label: "White", color: "#ffffff" },
    { name: "default", label: "Default", color: "#f4f5f8" },
  ];

  const handleColorChange = (colorName: string) => {
    try {
      // Get the actual color value (hex) for the color name
      const selectedColor = availableColors.find((c) => c.name === colorName);
      const colorValue = selectedColor ? selectedColor.color : colorName;

      if (colorMode === "background") {
        AppGeneral.changeSheetBackgroundColor(colorName);
        setActiveBackgroundColor(colorValue);
      } else {
        AppGeneral.changeSheetFontColor(colorName);
        setActiveFontColor(colorValue);

        // Additional CSS override for dark mode font color
        setTimeout(() => {
          const spreadsheetContainer = document.getElementById("tableeditor");
          if (spreadsheetContainer && isDarkMode) {
            // Force font color in dark mode by adding CSS override
            const style = document.createElement("style");
            style.id = "dark-mode-font-override";
            // Remove existing override if any
            const existingStyle = document.getElementById(
              "dark-mode-font-override"
            );
            if (existingStyle) {
              existingStyle.remove();
            }
            style.innerHTML = `
              .dark-theme #tableeditor * {
                color: ${colorValue} !important;
              }
              .dark-theme #tableeditor td,
              .dark-theme #tableeditor .defaultCell,
              .dark-theme #tableeditor .cell {
                color: ${colorValue} !important;
              }
            `;
            document.head.appendChild(style);
          }
        }, 100);
      }
    } catch (error) {
      setToastMessage("Failed to change sheet color");
      setToastColor("danger");
      setShowToast(true);
    }
  };

  const handleCustomColorApply = () => {
    const hexColor = customColorInput.trim();
    if (hexColor && /^#?[0-9A-Fa-f]{6}$/.test(hexColor)) {
      const formattedColor = hexColor.startsWith("#")
        ? hexColor
        : `#${hexColor}`;
      handleColorChange(formattedColor);
      setCustomColorInput("");
    } else {
      setToastMessage(
        "Please enter a valid hex color (e.g., #FF0000 or FF0000)"
      );
      setToastColor("warning");
      setShowToast(true);
    }
  };

  const executeSaveAsWithFilename = async (filename: string) => {
    updateSelectedFile(filename);

    if (saveAsOperation === "local") {
      await performLocalSave(filename);
    }
    setSaveAsFileName("");
    setSaveAsOperation(null);
  };

  const performLocalSave = async (fileName: string) => {
    try {
      // Check if SocialCalc is ready
      const socialCalc = (window as any).SocialCalc;
      if (!socialCalc || !socialCalc.GetCurrentWorkBookControl) {
        setToastMessage("Spreadsheet not ready. Please wait and try again.");
        setToastColor("warning");
        setShowToast(true);
        return;
      }

      const control = socialCalc.GetCurrentWorkBookControl();
      if (!control || !control.workbook || !control.workbook.spreadsheet) {
        setToastMessage("Spreadsheet not ready. Please wait and try again.");
        setToastColor("warning");
        setShowToast(true);
        return;
      }

      const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
      const now = new Date().toISOString();

      // Get template ID from active template data
      const templateId = activeTemplateData
        ? activeTemplateData.templateId
        : billType;

      const file = new File(
        now,
        now,
        content,
        fileName,
        billType,
        templateId,
        false
      );
      await store._saveFile(file);

      setToastMessage(`File "${fileName}" saved locally!`);
      setToastColor("success");
      setShowToast(true);
    } catch (error) {
      // Check if the error is due to storage quota exceeded
      if (isQuotaExceededError(error)) {
        setToastMessage(getQuotaExceededMessage("saving files"));
      } else {
        setToastMessage("Failed to save file locally.");
      }
      setToastColor("danger");
      setShowToast(true);
    }
  };

  const handleSave = async () => {
    console.log("💾 handleSave: Starting save", { fileName });

    // If no file is selected, can't save
    if (!fileName) {
      console.log("⚠️ handleSave: No file selected, skipping save");
      return;
    }

    try {
      // Check if SocialCalc is ready
      const socialCalc = (window as any).SocialCalc;
      if (!socialCalc || !socialCalc.GetCurrentWorkBookControl) {
        console.log("⚠️ handleSave: SocialCalc not ready, skipping save");
        return;
      }

      const control = socialCalc.GetCurrentWorkBookControl();
      console.log("📋 handleSave: Control status", {
        hasControl: !!control,
        hasWorkbook: !!(control && control.workbook),
        hasSpreadsheet: !!(
          control &&
          control.workbook &&
          control.workbook.spreadsheet
        ),
      });

      if (!control || !control.workbook || !control.workbook.spreadsheet) {
        console.log("⚠️ handleSave: Control not ready, skipping save");
        return;
      }

      console.log("📄 handleSave: Getting spreadsheet content");
      const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
      console.log("📊 handleSave: Content retrieved", {
        contentLength: content.length,
      });

      // Get existing metadata and update
      console.log("📂 handleSave: Getting existing file metadata");
      const data = await store._getFile(fileName);
      console.log("📋 handleSave: Existing file data", {
        hasData: !!data,
        created: (data as any)?.created,
        templateId: (data as any)?.templateId,
      });

      if (activeTemplateData) {
        console.log("💾 handleSave: Creating and saving file object");
        const file = new File(
          (data as any)?.created || new Date().toISOString(),
          new Date().toISOString(),
          content,
          fileName,
          billType,
          activeTemplateData.templateId,
          false
        );
        await store._saveFile(file);
        console.log("✅ handleSave: Save completed successfully");
      } else {
        console.log("⚠️ handleSave: No active template data, skipping save");
      }
    } catch (error) {
      console.error("❌ handleSave: Error during save", error);

      // Check if the error is due to storage quota exceeded
      if (isQuotaExceededError(error)) {
        setToastMessage(getQuotaExceededMessage("auto-saving"));
        setToastColor("danger");
        setShowToast(true);
      } else {
        // For auto-save errors, show a less intrusive message
        setToastMessage("Auto-save failed. Please save manually.");
        setToastColor("warning");
        setShowToast(true);
      }
    }
  };

  const handleSaveClick = async () => {
    console.log("💾 handleSaveClick: Starting manual save");

    if (!fileName) {
      setToastMessage("No file selected to save.");
      setToastColor("warning");
      setShowToast(true);
      return;
    }

    try {
      // Check if SocialCalc is ready
      const socialCalc = (window as any).SocialCalc;
      if (!socialCalc || !socialCalc.GetCurrentWorkBookControl) {
        setToastMessage("Spreadsheet not ready. Please wait and try again.");
        setToastColor("warning");
        setShowToast(true);
        return;
      }

      const control = socialCalc.GetCurrentWorkBookControl();
      if (!control || !control.workbook || !control.workbook.spreadsheet) {
        setToastMessage("Spreadsheet not ready. Please wait and try again.");
        setToastColor("warning");
        setShowToast(true);
        return;
      }

      if (!activeTemplateData) {
        setToastMessage("No template data available for saving.");
        setToastColor("warning");
        setShowToast(true);
        return;
      }

      // Call the main save function
      await handleSave();

      // Show success toast for manual save
      setToastMessage("File saved successfully!");
      setToastColor("success");
      setShowToast(true);
      console.log("✅ handleSaveClick: Manual save completed successfully");
    } catch (error) {
      console.error("❌ handleSaveClick: Error during manual save", error);

      if (isQuotaExceededError(error)) {
        setToastMessage(getQuotaExceededMessage("saving files"));
      } else {
        setToastMessage("Failed to save file. Please try again.");
      }
      setToastColor("danger");
      setShowToast(true);
    }
  };

  const activateFooter = (footer) => {
    console.log("🦶 activateFooter: Starting footer activation", { footer });
    // Only activate footer if SocialCalc is properly initialized
    try {
      const tableeditor = document.getElementById("tableeditor");
      const socialCalc = (window as any).SocialCalc;
      console.log("🔍 activateFooter: Checking DOM and SocialCalc", {
        hasTableEditor: !!tableeditor,
        hasSocialCalc: !!socialCalc,
        hasGetCurrentWorkBookControl: !!(
          socialCalc && socialCalc.GetCurrentWorkBookControl
        ),
      });

      // Check if SocialCalc and WorkBook control are properly initialized
      if (tableeditor && socialCalc && socialCalc.GetCurrentWorkBookControl) {
        const control = socialCalc.GetCurrentWorkBookControl();
        console.log("📋 activateFooter: Control status", {
          hasControl: !!control,
          hasWorkbook: !!(control && control.workbook),
          hasSpreadsheet: !!(
            control &&
            control.workbook &&
            control.workbook.spreadsheet
          ),
        });
        if (control && control.workbook && control.workbook.spreadsheet) {
          console.log(
            "✅ activateFooter: All requirements met, activating footer"
          );
          AppGeneral.activateFooterButton(footer);
        } else {
          console.log(
            "⚠️ activateFooter: SocialCalc WorkBook not ready for footer activation, skipping"
          );
        }
      } else {
        console.log(
          "⚠️ activateFooter: SocialCalc not ready for footer activation, skipping"
        );
      }
    } catch (error) {
      console.error("❌ activateFooter: Error activating footer", error);
    }
  };

  const initializeApp = async () => {
    console.log("🚀 initializeApp: Starting initialization", { fileName });

    try {
      // Prioritize URL parameter over context to ensure fresh state
      let fileToLoad = fileName;
      console.log("📁 initializeApp: File to load", { fileToLoad });

      // If no file is specified, redirect to files page
      if (!fileToLoad || fileToLoad === "") {
        console.log(
          "⚠️ initializeApp: No file specified, redirecting to files"
        );
        history.push("/app/files");
        return;
      }

      // Check if the file exists in storage
      console.log("🔍 initializeApp: Checking if file exists in storage");
      const fileExists = await store._checkKey(fileToLoad);
      console.log("📋 initializeApp: File exists result", { fileExists });

      if (!fileExists) {
        console.log("❌ initializeApp: File not found in storage");
        setFileNotFound(true);
        return;
      }

      // Load the file
      console.log("📖 initializeApp: Loading file data");
      const fileData = await store._getFile(fileToLoad);
      const decodedContent = decodeURIComponent(fileData.content);
      console.log("📄 initializeApp: File data loaded", {
        fileDataKeys: Object.keys(fileData),
        contentLength: decodedContent.length,
        templateId: fileData.templateId,
        billType: fileData.billType,
      });

      // Get template ID from file data
      const templateId = fileData.templateId;
      console.log("🎨 initializeApp: Template ID from file", { templateId });

      // Check if template exists in the templates library
      console.log("🔍 initializeApp: Checking if template exists in DATA");
      if (!DATA[templateId]) {
        console.log("❌ initializeApp: Template not found in DATA library", {
          templateId,
          availableTemplates: Object.keys(DATA),
        });
        setTemplateNotFound(true);
        setFileNotFound(false);
        return;
      }

      // Load template data
      console.log("✅ initializeApp: Template found, loading template data");
      const templateData = DATA[templateId];
      console.log("📊 initializeApp: Template data", {
        templateId: templateData.templateId,
        footersCount: templateData.footers?.length,
      });
      updateActiveTemplateData(templateData);
      // Initialize SocialCalc with the file content
      console.log("⚙️ initializeApp: Starting SocialCalc initialization");

      // Wait a bit to ensure DOM elements are ready
      setTimeout(() => {
        console.log("⏰ initializeApp: Timeout callback executing");
        try {
          const currentControl = AppGeneral.getWorkbookInfo();
          console.log("📋 initializeApp: Current control status", {
            hasControl: !!currentControl,
            hasWorkbook: !!(currentControl && currentControl.workbook),
          });

          if (currentControl && currentControl.workbook) {
            // SocialCalc is initialized, use viewFile
            console.log(
              "✅ initializeApp: SocialCalc already initialized, using viewFile"
            );
            AppGeneral.viewFile(fileToLoad, decodedContent);
          } else {
            // SocialCalc not initialized, initialize it first
            console.log(
              "🔧 initializeApp: SocialCalc not initialized, initializing app"
            );
            AppGeneral.initializeApp(decodedContent);
          }
        } catch (error) {
          console.error(
            "❌ initializeApp: Error in SocialCalc initialization",
            error
          );
          // Fallback: try to initialize the app
          try {
            console.log("🔄 initializeApp: Attempting fallback initialization");
            AppGeneral.initializeApp(decodedContent);
          } catch (initError) {
            console.error(
              "💥 initializeApp: Fallback initialization failed",
              initError
            );
            throw new Error(
              "Failed to load file: SocialCalc initialization error"
            );
          }
        }

        // Activate footer after initialization
        setTimeout(() => {
          console.log("🦶 initializeApp: Activating footer", {
            billType: fileData.billType,
          });
          activateFooter(fileData.billType);
        }, 500);
      }, 100);
      console.log("✅ initializeApp: Successfully completed initialization");
      setFileNotFound(false);
      setTemplateNotFound(false);
    } catch (error) {
      console.error(
        "💥 initializeApp: Caught error during initialization",
        error
      );
      // On error, show file not found
      setFileNotFound(true);
      setTemplateNotFound(false);
    }
  };

  useEffect(() => {
    initializeApp();
  }, [fileName]); // Only depend on fileName to prevent loops with fileName updates

  // Initialize sheet change monitor
  useEffect(() => {
    if (fileName && activeTemplateData) {
      // Wait a bit for SocialCalc to be fully initialized
      const timer = setTimeout(() => {
        SheetChangeMonitor.initialize(updateCurrentSheetId);
      }, 1000);

      return () => {
        clearTimeout(timer);
        SheetChangeMonitor.cleanup();
      };
    }
  }, [fileName, activeTemplateData, updateCurrentSheetId]);

  useEffect(() => {
    if (fileName) {
      updateSelectedFile(fileName);
    }
  }, [fileName]);

  // Reset autosave to global setting when a new file is opened
  useEffect(() => {
    if (fileName) {
      setIsAutoSaveEnabled(getAutoSaveEnabled());
    }
  }, [fileName]);

  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    const debouncedAutoSave = () => {
      // Only auto-save if enabled
      if (!isAutoSaveEnabled) {
        console.log("⚠️ debouncedAutoSave: Auto-save is disabled, skipping");
        return;
      }

      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      const newTimer = setTimeout(() => {
        handleSave();
        setAutoSaveTimer(null);
      }, 1000);

      setAutoSaveTimer(newTimer);
    };

    let removeListener = () => {};

    // Wait for SocialCalc to be ready before setting up the listener
    const setupListener = () => {
      try {
        const socialCalc = (window as any).SocialCalc;
        if (socialCalc && socialCalc.GetCurrentWorkBookControl) {
          const control = socialCalc.GetCurrentWorkBookControl();
          if (control && control.workbook && control.workbook.spreadsheet) {
            removeListener = AppGeneral.setupCellChangeListener((_) => {
              debouncedAutoSave();
            });
          } else {
            // Retry after a delay if WorkBook is not ready
            setTimeout(setupListener, 2000);
          }
        } else {
          // Retry after a delay if SocialCalc is not ready
          setTimeout(setupListener, 2000);
        }
      } catch (error) {
        // Retry after a delay
        setTimeout(setupListener, 2000);
      }
    };

    // Start attempting to setup the listener
    setupListener();

    return () => {
      removeListener();
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [fileName, billType, autoSaveTimer, isAutoSaveEnabled]);

  useEffect(() => {
    // Add a delay to ensure SocialCalc is initialized before activating footer

    const timer = setTimeout(() => {
      activateFooter(billType);
    }, 1000);

    return () => clearTimeout(timer);
  }, [billType]);

  useEffect(() => {
    // Find the active footer index, default to 1 if none found
    const activeFooter = activeTemplateData?.footers?.find(
      (footer) => footer.isActive
    );
    const activeFooterIndex = activeFooter ? activeFooter.index : 1;
    updateBillType(activeFooterIndex);
  }, [activeTemplateData]);
  // Effect to handle font color in dark mode
  useEffect(() => {
    if (isDarkMode && activeFontColor !== "#000000") {
      // Reapply font color when switching to dark mode
      setTimeout(() => {
        const style = document.createElement("style");
        style.id = "dark-mode-font-override";
        // Remove existing override if any
        const existingStyle = document.getElementById(
          "dark-mode-font-override"
        );
        if (existingStyle) {
          existingStyle.remove();
        }
        style.innerHTML = `
          .dark-theme #tableeditor * {
            color: ${activeFontColor} !important;
          }
          .dark-theme #tableeditor td,
          .dark-theme #tableeditor .defaultCell,
          .dark-theme #tableeditor .cell {
            color: ${activeFontColor} !important;
          }
        `;
        document.head.appendChild(style);
      }, 100);
    } else if (!isDarkMode) {
      // Remove dark mode font override when switching to light mode
      const existingStyle = document.getElementById("dark-mode-font-override");
      if (existingStyle) {
        existingStyle.remove();
      }
    }
  }, [isDarkMode, activeFontColor]);

  const footers = activeTemplateData ? activeTemplateData.footers : [];
  const footersList = footers.map((footerArray) => {
    const isActive = footerArray.index === billType;

    return (
      <IonButton
        key={footerArray.index}
        color="light"
        className="ion-no-margin"
        style={{
          whiteSpace: "nowrap",
          minWidth: "max-content",
          marginRight: "8px",
          flexShrink: 0,
          border: isActive ? "2px solid #3880ff" : "2px solid transparent",
          borderRadius: "4px",
        }}
        onClick={() => {
          updateBillType(footerArray.index);
          activateFooter(footerArray.index);
        }}
      >
        {footerArray.name}
      </IonButton>
    );
  });

  useEffect(() => {
    updateSelectedFile(fileName);
  }, [fileName]);

  return (
    <IonPage
      className={isDarkMode ? "dark-theme" : ""}
      // style={{ overflow: "hidden", maxHeight: "80vh" }}
    >
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonButton
              fill="clear"
              onClick={() => history.push("/app/files")}
              style={{ color: "white" }}
            >
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonButtons
            slot="start"
            className="editing-title"
            style={{ marginLeft: "8px" }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span>{selectedFile}</span>
              {selectedFile && (
                <div
                  style={{
                    position: "relative",
                    display: "inline-block",
                    transform: "scale(0.8)",
                  }}
                >
                  {/* Main save icon */}
                  <IonButton
                    id="save-trigger"
                    fill="clear"
                    size="small"
                    onClick={() => setShowSavePopover(true)}
                    style={{
                      minWidth: "auto",
                      height: "32px",
                      position: "relative",
                    }}
                    title="Save options"
                  >
                    <IonIcon
                      icon={saveSharp}
                      size="large"
                      color={isDarkMode ? "dark" : "light"}
                    />
                  </IonButton>

                  {/* Auto-save indicators (positioned absolutely when enabled) */}
                  {isAutoSaveEnabled && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "-16px",
                        right: "4px",
                        zIndex: 10,
                        borderRadius: "50%",
                      }}
                    >
                      <IonIcon
                        icon={autoSaveTimer ? syncOutline : checkmarkCircle}
                        size="small"
                        color={"success"}
                        style={{
                          animation: autoSaveTimer
                            ? "spin 1s linear infinite"
                            : "none",
                          borderRadius: "50%",
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </IonButtons>

          <IonButtons
            slot="end"
            className={isPlatform("desktop") && "ion-padding-end"}
          >
             {/* Wallet Connection */}
            <div style={{ marginRight: "12px" }}>
              <WalletConnection />
            </div>
            <IonIcon
              icon={textOutline}
              size="large"
              onClick={() => AppGeneral.toggleCellFormatting()}
              style={{ cursor: "pointer", marginRight: "12px" }}
              title="Format Current Cell"
            />
            <IonIcon
              icon={shareSharp}
              size="large"
              onClick={(e) => {
                setShowMenu(true);
              }}
              style={{ cursor: "pointer", marginRight: "12px" }}
            />
            <IonIcon
              id="actions-trigger"
              icon={ellipsisVertical}
              size="large"
              onClick={() => setShowActionsPopover(true)}
              style={{ cursor: "pointer", marginRight: "12px" }}
              title="More Actions"
            />
          </IonButtons>
        </IonToolbar>

        <IonToolbar color="secondary">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              overflowX: "auto",
              padding: "8px 16px",
              width: "100%",
              alignItems: "center",
            }}
          >
            {footersList}
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {fileNotFound ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: "40px 20px",
              textAlign: "center",
            }}
          >
            <IonIcon
              icon={documentText}
              style={{
                fontSize: "80px",
                color: "var(--ion-color-medium)",
                marginBottom: "20px",
              }}
            />
            <h2
              style={{
                margin: "0 0 16px 0",
                color: "var(--ion-color-dark)",
                fontSize: "24px",
                fontWeight: "600",
              }}
            >
              File Not Found
            </h2>
            <p
              style={{
                margin: "0 0 30px 0",
                color: "var(--ion-color-medium)",
                fontSize: "16px",
                lineHeight: "1.5",
                maxWidth: "400px",
              }}
            >
              {selectedFile
                ? `The file "${selectedFile}" doesn't exist in your storage.`
                : "The requested file couldn't be found."}
            </p>
            <IonButton
              fill="solid"
              size="default"
              onClick={() => history.push("/app/files")}
              style={{ minWidth: "200px" }}
            >
              <IonIcon icon={folder} slot="start" />
              Go to File Explorer
            </IonButton>
          </div>
        ) : templateNotFound ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: "40px 20px",
              textAlign: "center",
            }}
          >
            <IonIcon
              icon={downloadOutline}
              style={{
                fontSize: "80px",
                color: "var(--ion-color-medium)",
                marginBottom: "20px",
              }}
            />
            <h2
              style={{
                margin: "0 0 16px 0",
                color: "var(--ion-color-dark)",
                fontSize: "24px",
                fontWeight: "600",
              }}
            >
              Template Not Found
            </h2>
            <p
              style={{
                margin: "0 0 30px 0",
                color: "var(--ion-color-medium)",
                fontSize: "16px",
                lineHeight: "1.5",
                maxWidth: "400px",
              }}
            >
              The file information is not downloaded. Please download the file
              template to open this file.
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <IonButton
                fill="solid"
                size="default"
                onClick={() => history.push("/app/files")}
                style={{ minWidth: "140px" }}
              >
                <IonIcon icon={folder} slot="start" />
                Go to Files
              </IonButton>
              <IonButton
                fill="outline"
                size="default"
                onClick={() => {
                  // Add download template functionality here
                  setToastMessage(
                    "Template download functionality coming soon"
                  );
                  setToastColor("warning");
                  setShowToast(true);
                }}
                style={{ minWidth: "140px" }}
              >
                <IonIcon icon={downloadOutline} slot="start" />
                Download Template
              </IonButton>
            </div>
          </div>
        ) : (
          <div id="container">
            <div id="workbookControl"></div>
            <div id="tableeditor"></div>
            <div id="msg"></div>
          </div>
        )}

        {/* Toast for save notifications */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
          position="top"
        />

        {/* Save As Dialog */}
        <IonAlert
          isOpen={showSaveAsDialog}
          onDidDismiss={() => {
            setShowSaveAsDialog(false);
            setSaveAsFileName("");
            setSaveAsOperation(null);
          }}
          header="Save As - Local Storage"
          message="Enter a filename for your invoice:"
          inputs={[
            {
              name: "filename",
              type: "text",
              placeholder: "Enter filename...",
              value: saveAsFileName,
              attributes: {
                maxlength: 50,
              },
            },
          ]}
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
              handler: () => {
                setSaveAsFileName("");
                setSaveAsOperation(null);
              },
            },
            {
              text: "Save",
              handler: (data) => {
                if (data.filename && data.filename.trim()) {
                  setSaveAsFileName(data.filename.trim());
                  // Close dialog and execute save
                  setShowSaveAsDialog(false);
                  // Use setTimeout to ensure state updates
                  setTimeout(async () => {
                    await executeSaveAsWithFilename(data.filename.trim());
                  }, 100);
                } else {
                  setToastMessage("Please enter a valid filename");
                  setToastColor("warning");
                  setShowToast(true);
                  return false; // Prevent dialog from closing
                }
              },
            },
          ]}
        />

        {/* File Options Popover */}
        <FileOptions
          showActionsPopover={showActionsPopover}
          setShowActionsPopover={setShowActionsPopover}
          showColorModal={showColorModal}
          setShowColorPicker={setShowColorModal}
          onSave={handleSave}
          isAutoSaveEnabled={isAutoSaveEnabled}
          fileName={fileName}
        />

        {/* Color Picker Modal */}
        <IonModal
          className="color-picker-modal"
          isOpen={showColorModal}
          onDidDismiss={() => {
            setShowColorModal(false);
            setCustomColorInput("");
          }}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Change Sheet Color</IonTitle>
              <IonButtons slot="end">
                <IonButton
                  className="close-button"
                  onClick={() => setShowColorModal(false)}
                  fill="clear"
                >
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {/* Tab Segments */}
            <IonSegment
              value={colorMode}
              onIonChange={(e) =>
                setColorMode(e.detail.value as "background" | "font")
              }
            >
              <IonSegmentButton value="background">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: activeBackgroundColor,
                      borderRadius: "50%",
                      border: "2px solid #ccc",
                    }}
                  />
                  <IonLabel>Background Color</IonLabel>
                </div>
              </IonSegmentButton>
              <IonSegmentButton value="font">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: activeFontColor,
                      borderRadius: "50%",
                      border: "2px solid #ccc",
                    }}
                  />
                  <IonLabel>Font Color</IonLabel>
                </div>
              </IonSegmentButton>
            </IonSegment>

            <IonItemDivider>
              <IonLabel>
                {colorMode === "background"
                  ? "Background Colors"
                  : "Font Colors"}
              </IonLabel>
            </IonItemDivider>

            <IonGrid>
              <IonRow>
                {availableColors.map((color) => (
                  <IonCol size="3" size-md="2" key={color.name}>
                    <div
                      className="color-swatch"
                      onClick={() => handleColorChange(color.name)}
                      style={{
                        width: "60px",
                        height: "60px",
                        backgroundColor: color.color,
                        borderRadius: "12px",
                        margin: "8px auto",
                        border:
                          (colorMode === "background" &&
                            activeBackgroundColor === color.color) ||
                          (colorMode === "font" &&
                            activeFontColor === color.color)
                            ? "3px solid #3880ff"
                            : "2px solid #ccc",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    />
                    <p
                      style={{
                        textAlign: "center",
                        fontSize: "12px",
                        margin: "4px 0",
                        fontWeight: "500",
                      }}
                    >
                      {color.label}
                    </p>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>

            <IonItemDivider>
              <IonLabel>Custom Hex Color</IonLabel>
            </IonItemDivider>

            <div style={{ padding: "16px" }}>
              <IonInput
                fill="outline"
                value={customColorInput}
                placeholder="Enter hex color (e.g., #FF0000)"
                onIonInput={(e) => setCustomColorInput(e.detail.value!)}
                maxlength={7}
                style={{ marginBottom: "16px" }}
              />
              <IonButton
                expand="block"
                onClick={handleCustomColorApply}
                disabled={!customColorInput.trim()}
              >
                Apply Custom Color
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        <DynamicInvoiceForm
          isOpen={showInvoiceForm}
          onClose={() => setShowInvoiceForm(false)}
          
        />

        {/* Floating Action Button for Invoice Edit */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton
            onClick={() => setShowInvoiceForm(true)}
            color="primary"
          >
            <IonIcon icon={createOutline} />
          </IonFabButton>
        </IonFab>

        {/* Save Options Popover */}
        <IonPopover
          trigger="save-trigger"
          isOpen={showSavePopover}
          onDidDismiss={() => setShowSavePopover(false)}
        >
          <IonContent>
            <IonList>
              <IonItem button onClick={handleSaveClick}>
                <IonLabel>Save Now</IonLabel>
              </IonItem>

              <IonItem>
                <IonLabel>
                  <h3>Enable Auto-save</h3>
                  <p>Temporary setting for this file</p>
                </IonLabel>
                <IonCheckbox
                  slot="end"
                  checked={isAutoSaveEnabled}
                  onIonChange={(e) => {
                    setIsAutoSaveEnabled(e.detail.checked);
                    console.log("🔄 Auto-save toggled:", e.detail.checked);
                  }}
                />
              </IonItem>
            </IonList>
          </IonContent>
        </IonPopover>

        <Menu showM={showMenu} setM={() => setShowMenu(false)} />
      </IonContent>
    </IonPage>
  );
};

export default Home;
