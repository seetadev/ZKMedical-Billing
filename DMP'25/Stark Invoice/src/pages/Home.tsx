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
  IonCard,
  IonCardContent,
  IonSegment,
  IonSegmentButton,
  isPlatform,
} from "@ionic/react";
import { APP_NAME, DATA } from "../app-data";
import * as AppGeneral from "../components/socialcalc/index.js";
import { useEffect, useState, useRef } from "react";
import { Local, File } from "../components/Storage/LocalStorage";
import {
  checkmark,
  checkmarkCircle,
  pencil,
  saveSharp,
  syncOutline,
  colorPaletteOutline,
  closeOutline,
  textOutline,
  ellipsisVertical,
  shareSharp,
  cloudDownloadOutline,
  wifiOutline,
  downloadOutline,
} from "ionicons/icons";
import "./Home.css";
import FileOptions from "../components/FileMenu/FileOptions";
import Menu from "../components/Menu/Menu";
import PWAInstallPrompt from "../components/PWAInstallPrompt";
import { usePWA } from "../hooks/usePWA";
import { useTheme } from "../contexts/ThemeContext";
import { useInvoice } from "../contexts/InvoiceContext";
import WalletConnection from "../components/wallet/WalletConnection";
import {
  isDefaultFileEmpty,
  generateUntitledFilename,
  isQuotaExceededError,
  getQuotaExceededMessage,
} from "../utils/helper";
import { cloudService } from "../services/cloud-service";

const Home: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { selectedFile, billType, store, updateSelectedFile, updateBillType } =
    useInvoice();
  const { isInstallable, isInstalled, isOnline, installApp } = usePWA();

  const [showMenu, setShowMenu] = useState(false);
  const [device] = useState(AppGeneral.getDeviceType());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<
    "success" | "danger" | "warning"
  >("success");

  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [saveAsFileName, setSaveAsFileName] = useState("");
  const [saveAsOperation, setSaveAsOperation] = useState<"local" | null>(null);

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

  const activateFooter = (footer) => {
    AppGeneral.activateFooterButton(footer);
  };

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
      setShowColorModal(false);
      setToastColor("success");
      setShowToast(true);
    } catch (error) {
      console.error("Error changing sheet color:", error);
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

  const openColorModal = (mode: "background" | "font") => {
    setColorMode(mode);
    setShowColorModal(true);
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
      const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
      const now = new Date().toISOString();
      const file = new File(now, now, content, fileName, billType);
      await store._saveFile(file);

      setToastMessage(`File "${fileName}" saved locally!`);
      setToastColor("success");
      setShowToast(true);
    } catch (error) {
      console.error("Error saving file:", error);

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

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // First try to load the default file from local storage
        const defaultExists = await store._checkKey("default");
        if (defaultExists) {
          const defaultFile = await store._getFile("default");
          const decodedContent = decodeURIComponent(defaultFile.content);
          AppGeneral.viewFile("default", decodedContent);
          updateBillType(defaultFile.billType);
          console.log("Loaded existing default file from local storage");
        } else {
          // If no default file exists, initialize with template data and save it
          const data = DATA["home"][device]["msc"];
          AppGeneral.initializeApp(JSON.stringify(data));

          // Save the initial template as the default file
          const initialContent = encodeURIComponent(JSON.stringify(data));
          const now = new Date().toISOString();
          const file = new File(now, now, initialContent, "default", billType);
          await store._saveFile(file);
          console.log("Created and saved new default file");
        }
      } catch (error) {
        console.error("Error initializing app:", error);

        // Check if the error is due to storage quota exceeded
        if (isQuotaExceededError(error)) {
          setToastMessage(getQuotaExceededMessage("initializing the app"));
          setToastColor("danger");
          setShowToast(true);
        }

        // Fallback to template initialization
        const data = DATA["home"][device]["msc"];
        AppGeneral.initializeApp(JSON.stringify(data));
        AppGeneral.changeSheetColor("#000000");
      }
      // Alternative smooth scrolling implementation
      setTimeout(() => {
        const gridDiv = document.getElementById("te_griddiv");
        if (gridDiv) {
          // Force smooth scrolling CSS
          gridDiv.style.scrollBehavior = "smooth";

          // Override SocialCalc's internal scrolling
          const tables = gridDiv.querySelectorAll("table");
          tables.forEach((table) => {
            table.style.scrollBehavior = "smooth";
          });

          // Intercept keyboard navigation to use smooth scrolling
          gridDiv.addEventListener("keydown", function (e) {
            const step = 30; // Pixels to scroll per key press

            switch (e.key) {
              case "ArrowUp":
                e.preventDefault();
                gridDiv.scrollBy({ top: -step, behavior: "smooth" });
                break;
              case "ArrowDown":
                e.preventDefault();
                gridDiv.scrollBy({ top: step, behavior: "smooth" });
                break;
              case "ArrowLeft":
                e.preventDefault();
                gridDiv.scrollBy({ left: -step, behavior: "smooth" });
                break;
              case "ArrowRight":
                e.preventDefault();
                gridDiv.scrollBy({ left: step, behavior: "smooth" });
                break;
            }
          });
        }
      }, 1000);
    };

    initializeApp();
  }, []);

  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const handleAutoSave = async () => {
    try {
      console.log("Auto-saving file...");
      const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());

      if (selectedFile === "default") {
        // Autosave the default file to local storage
        const now = new Date().toISOString();
        const file = new File(now, now, content, "default", billType);
        await store._saveFile(file);
        return;
      }

      // For named files, get existing metadata and update
      const data = await store._getFile(selectedFile);
      const file = new File(
        (data as any)?.created || new Date().toISOString(),
        new Date().toISOString(),
        content,
        selectedFile,
        billType
      );
      await store._saveFile(file);
      updateSelectedFile(selectedFile);
    } catch (error) {
      console.error("Error auto-saving file:", error);

      // Check if the error is due to storage quota exceeded
      if (isQuotaExceededError(error)) {
        setToastMessage(getQuotaExceededMessage("auto-saving"));
        setToastColor("danger");
        setShowToast(true);
      } else {
        // For other errors during auto-save, show a less intrusive message
        setToastMessage("Auto-save failed. Please save manually.");
        setToastColor("warning");
        setShowToast(true);
      }
    }
  };
  useEffect(() => {
    const debouncedAutoSave = () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      const newTimer = setTimeout(() => {
        handleAutoSave();
        setAutoSaveTimer(null);
      }, 1000);

      setAutoSaveTimer(newTimer);
    };

    const removeListener = AppGeneral.setupCellChangeListener((_) => {
      debouncedAutoSave();
    });

    return () => {
      removeListener();
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [selectedFile, billType, autoSaveTimer]);

  useEffect(() => {
    activateFooter(billType);
  }, [billType]);

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

  const footers = DATA["home"][device]["footers"];
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

  return (
    <IonPage
      className={isDarkMode ? "dark-theme" : ""}
      // style={{ overflow: "hidden", maxHeight: "80vh" }}
    >
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start" className="editing-title">
            <div style={{ display: "flex", alignItems: "center" }}>
              <IonIcon
                icon={pencil}
                size="medium"
                style={{ marginRight: "8px" }}
              />
              {isPlatform("mobile") || isPlatform("hybrid") ? (
                <span title={selectedFile}>
                  {selectedFile.length > 15
                    ? `${selectedFile.substring(0, 15)}...`
                    : selectedFile}
                </span>
              ) : (
                <span>{selectedFile}</span>
              )}
              {selectedFile !== "default" && (
                <IonButton
                  fill="clear"
                  size="small"
                  onClick={handleAutoSave}
                  disabled={autoSaveTimer !== null}
                  style={{
                    minWidth: "auto",
                    height: "32px",
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
                    }}
                  />
                </IonButton>
              )}
            </div>
          </IonButtons>

          <IonButtons
            slot="end"
            className={isPlatform("desktop") && "ion-padding-end"}
          >
            {/* PWA Status Indicators */}
            <IonIcon
              icon={isOnline ? wifiOutline : cloudDownloadOutline}
              size="small"
              style={{
                cursor: "pointer",
                marginRight: "8px",
                color: isOnline ? "#28ba62" : "#f04141",
              }}
              title={isOnline ? "Online" : "Offline"}
            />
            {isInstallable && !isInstalled && (
              <IonIcon
                icon={downloadOutline}
                size="small"
                onClick={installApp}
                style={{
                  cursor: "pointer",
                  marginRight: "8px",
                  color: "#ffffff",
                }}
                title="Install App"
              />
            )}
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
              icon={colorPaletteOutline}
              size="large"
              onClick={() => openColorModal("background")}
              style={{ cursor: "pointer", marginRight: "12px" }}
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
        <div id="container">
          <div id="workbookControl"></div>
          <div id="tableeditor"></div>
          <div id="msg"></div>
        </div>

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

        <Menu showM={showMenu} setM={() => setShowMenu(false)} />
      </IonContent>
    </IonPage>
  );
};

export default Home;
