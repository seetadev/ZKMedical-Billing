import React, { useState } from "react";
import {
  IonAlert,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToast,
  IonToolbar,
} from "@ionic/react";
import Files from "../components/Files/Files";
import { useTheme } from "../contexts/ThemeContext";
import { useInvoice } from "../contexts/InvoiceContext";
import { DATA } from "../app-data";
import * as AppGeneral from "../components/socialcalc/index.js";
import "./FilesPage.css";
import { useHistory } from "react-router-dom";
import { File } from "../components/Storage/LocalStorage";

const FilesPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const {
    selectedFile,
    resetToDefaults,
    billType,
    store,
    updateSelectedFile,
    updateBillType,
  } = useInvoice();
  const history = useHistory();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showUnsavedChangesAlert, setShowUnsavedChangesAlert] = useState(false);

  const [device] = useState(AppGeneral.getDeviceType());

  const handleNewFileClick = async () => {
    try {
      // Get the default file from storage
      const defaultExists = await store._checkKey("default");
      if (selectedFile === "default" && defaultExists) {
        const storedDefaultFile = await store._getFile("default");

        // Decode the stored content
        const storedContent = decodeURIComponent(storedDefaultFile.content);
        const msc = DATA["home"][device]["msc"];

        const hasUnsavedChanges = storedContent !== JSON.stringify(msc);

        if (hasUnsavedChanges) {
          // If there are unsaved changes, show confirmation alert
          setShowUnsavedChangesAlert(true);
          return;
        }
      }
      await createNewFile();
    } catch (error) {
      console.error("Error checking for unsaved changes:", error);
      // On error, proceed with normal flow
      setShowUnsavedChangesAlert(true);
    }
  };
  const handleNewMedClick = async () => {
    try {
      // Get the default file from storage
      const defaultExists = await store._checkKey("default");
      if (selectedFile === "default" && defaultExists) {
        const storedDefaultFile = await store._getFile("default");

        // Decode the stored content
        const storedContent = decodeURIComponent(storedDefaultFile.content);
        const msc = DATA["home"][device]["msc"];

        const hasUnsavedChanges = storedContent !== JSON.stringify(msc);

        if (hasUnsavedChanges) {
          // If there are unsaved changes, show confirmation alert
          setShowUnsavedChangesAlert(true);
          return;
        }
      }
      await createNewMed();
    } catch (error) {
      console.error("Error checking for unsaved changes:", error);
      // On error, proceed with normal flow
      setShowUnsavedChangesAlert(true);
    }
  };

  const createNewFile = async () => {
    try {
      // Reset to defaults first
      resetToDefaults();

      // Set selected file to "default"
      updateSelectedFile("default");

      const msc = DATA["home"][device]["msc"];

      // Load the template data into the spreadsheet
      AppGeneral.viewFile("default", JSON.stringify(msc));

      // Save the new template as the default file in storage
      const templateContent = encodeURIComponent(JSON.stringify(msc));
      const now = new Date().toISOString();
      const newDefaultFile = new File(now, now, templateContent, "default", 1);
      await store._saveFile(newDefaultFile);

      setToastMessage("New file created successfully");
      setShowToast(true);
      history.push("/app/editor");
    } catch (error) {
      console.error("Error creating new file:", error);
      setToastMessage("Error creating new invoice");
      setShowToast(true);
    }
  };

  const createNewMed = async () => {
    try {
      // Reset to defaults first
      resetToDefaults();
      console.log("creating new Med");
      // Set selected file to "default"
      updateSelectedFile("default");

      const msc = DATA["home"]["Medication"]["msc"];
      // Save the new template as the default file in storage
      const templateContent = encodeURIComponent(JSON.stringify(msc));
      const now = new Date().toISOString();
      const newDefaultFile = new File(now, now, templateContent, "default", 1);
      await store._saveFile(newDefaultFile);

      // Load the template data into the spreadsheet
      // AppGeneral.viewFile("default", JSON.stringify(msc));

      setToastMessage("New file created successfully");
      setShowToast(true);
      // Reset to defaults first
      resetToDefaults();
      history.push("/app/editor");
    } catch (error) {
      console.error("Error creating new file:", error);
      setToastMessage("Error creating new invoice");
      setShowToast(true);
    }
  };

  const handleDiscardAndCreateNew = async () => {
    try {
      // User confirmed to discard changes, proceed with creating new file
      await createNewFile();
      setShowUnsavedChangesAlert(false);
    } catch (error) {
      console.error("Error discarding and creating new file:", error);
      setToastMessage("Error creating new invoice");
      setShowToast(true);
      setShowUnsavedChangesAlert(false);
    }
  };

  return (
    <IonPage className={isDarkMode ? "dark-theme" : ""}>
      <IonHeader className="files-modal-header">
        <IonToolbar style={{ minHeight: "56px", "--min-height": "56px" }}>
          <IonTitle
            className="files-modal-title"
            style={{
              fontSize: "18px",
              fontWeight: "500",
              textAlign: "center",
            }}
          >
            🧾 Invoice App
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {/* Template Creation Options */}
        <div className="template-creation-section">
          <div className="template-options-container">
            <div className="template-option-card" onClick={handleNewFileClick}>
              <div className="template-option-icon">🧾</div>
              <div className="template-option-text">Create New Invoice</div>
            </div>
            <div className="template-option-card" onClick={handleNewMedClick}>
              <div className="template-option-icon">💊</div>
              <div className="template-option-text">Medication Invoice</div>
            </div>
          </div>
        </div>
        <Files
          store={store}
          file={selectedFile}
          updateSelectedFile={updateSelectedFile}
          updateBillType={updateBillType}
        />
      </IonContent>
      {/* unsaved changes alert */}
      <IonAlert
        isOpen={showUnsavedChangesAlert}
        onDidDismiss={() => setShowUnsavedChangesAlert(false)}
        header="⚠️ Unsaved Changes"
        message="The default file has unsaved changes. Creating a new file will discard these changes. Do you want to continue?"
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
            handler: () => {
              setShowUnsavedChangesAlert(false);
            },
          },
          {
            text: "Discard & Create New",
            handler: async () => {
              await handleDiscardAndCreateNew();
            },
          },
        ]}
      />
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color={toastMessage.includes("successfully") ? "success" : "warning"}
        position="top"
      />
    </IonPage>
  );
};

export default FilesPage;
