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
  arrowUndo,
  arrowRedo,
} from "ionicons/icons";
import "./Home.css";
import NewFile from "../components/NewFile/NewFile";
import WalletConnection from "../components/wallet/WalletConnection";
import Menu from "../components/Menu/Menu";
import { useAccount } from "@starknet-react/core";
import { useTheme } from "../contexts/ThemeContext";
import { useInvoice } from "../contexts/InvoiceContext";
import { useSaveFile } from "../hooks/useContractWrite";
import { uploadJSONToIPFS } from "../utils/ipfs";

const Home: React.FC = () => {
  const { address } = useAccount();
  const { saveFile, isPending: isSaving } = useSaveFile();
  const { isDarkMode } = useTheme();
  const { selectedFile, billType, store, updateSelectedFile, updateBillType } =
    useInvoice();

  const [showMenu, setShowMenu] = useState(false);
  const [device] = useState(AppGeneral.getDeviceType());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<
    "success" | "danger" | "warning"
  >("success");

  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [saveAsFileName, setSaveAsFileName] = useState("");
  const [saveAsOperation, setSaveAsOperation] = useState<
    "local" | "blockchain" | null
  >(null);

  const activateFooter = (footer) => {
    AppGeneral.activateFooterButton(footer);
  };

  const executeSaveAsWithFilename = async (filename: string) => {
    updateSelectedFile(filename);

    if (saveAsOperation === "local") {
      await performLocalSave(filename);
    } else if (saveAsOperation === "blockchain") {
      await performBlockchainSave(filename);
    }
    setSaveAsFileName("");
    setSaveAsOperation(null);
  };
  const performLocalSave = async (fileName: string) => {
    try {
      const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
      const file = new File(
        new Date().toString(),
        new Date().toString(),
        content,
        fileName,
        billType
      );
      await store._saveFile(file);

      setToastMessage(`File "${fileName}" saved locally!`);
      setToastColor("success");
      setShowToast(true);
    } catch (error) {
      console.error("Error saving file:", error);
      setToastMessage("Failed to save file locally.");
      setToastColor("danger");
      setShowToast(true);
    }
  };
  const performBlockchainSave = async (fileName: string) => {
    if (!address) {
      setToastMessage("Please connect your wallet first");
      setToastColor("warning");
      setShowToast(true);
      return;
    }

    try {
      setToastMessage("Uploading to IPFS and blockchain...");
      setToastColor("success");
      setShowToast(true);

      // Get current spreadsheet content
      const content = AppGeneral.getSpreadsheetContent();

      // Create file metadata
      const fileData = {
        fileName: fileName,
        content: content,
        timestamp: new Date().toISOString(),
        billType: billType,
        creator: address,
      };

      // Upload to IPFS
      const ipfsHash = await uploadJSONToIPFS(fileData);
      console.log("File uploaded to IPFS:", ipfsHash);

      // Save to blockchain
      await saveFile(fileName, ipfsHash);

      // Also save locally
      const localFile = new File(
        new Date().toString(),
        new Date().toString(),
        encodeURIComponent(content),
        fileName,
        billType
      );
      await store._saveFile(localFile);

      setToastMessage(
        `File saved to blockchain! IPFS: ${ipfsHash.substring(0, 10)}...`
      );
      setToastColor("success");
      setShowToast(true);
    } catch (error) {
      console.error("Error saving to blockchain:", error);
      setToastMessage("Failed to save to blockchain. Please try again.");
      setToastColor("danger");
      setShowToast(true);
    }
  };

  useEffect(() => {
    const data = DATA["home"][device]["msc"];
    AppGeneral.initializeApp(JSON.stringify(data));
  }, []);

  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const handleAutoSave = () => {
    if (selectedFile === "default") {
      return;
    }
    console.log("Auto-saving file...");
    const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
    const data = store._getFile(selectedFile);
    const file = new File(
      (data as any)?.created || new Date().toString(),
      new Date().toString(),
      content,
      selectedFile,
      billType
    );
    store._saveFile(file);
    updateSelectedFile(selectedFile);
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
          <IonTitle slot="start" className="editing-title">
            <div style={{ display: "flex", alignItems: "center" }}>
              <IonIcon
                icon={pencil}
                size="medium"
                style={{ marginRight: "8px" }}
              />
              <span>{selectedFile}</span>
              {selectedFile !== "default" && (
                <IonButton
                  fill="clear"
                  size="small"
                  onClick={handleAutoSave}
                  disabled={autoSaveTimer !== null}
                  style={{
                    marginLeft: "12px",
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
          </IonTitle>

          <IonButtons slot="end" className="ion-padding-end">
            <IonIcon
              icon={arrowUndo}
              size="large"
              onClick={() => AppGeneral.undo()}
              style={{ cursor: "pointer", marginRight: "12px" }}
            />
            <IonIcon
              icon={arrowRedo}
              size="large"
              onClick={() => AppGeneral.redo()}
              style={{ cursor: "pointer", marginRight: "12px" }}
            />
            <div style={{ marginRight: "12px" }}>
              <NewFile data-testid="new-file-btn" />
            </div>
            <IonIcon
              icon={saveSharp}
              size="large"
              onClick={(e) => {
                setShowMenu(true);
              }}
              style={{ cursor: "pointer", marginRight: "12px" }}
            />

            <WalletConnection />
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
          header={`Save As - ${
            saveAsOperation === "local" ? "Local Storage" : "Blockchain"
          }`}
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
        <Menu showM={showMenu} setM={() => setShowMenu(false)} />
      </IonContent>
    </IonPage>
  );
};

export default Home;
