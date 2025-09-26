import React, { useState, useRef, useEffect } from "react";
import {
  IonPopover,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonAlert,
  IonToast,
} from "@ionic/react";
import {
  addOutline,
  arrowUndo,
  arrowRedo,
  saveOutline,
  documentOutline,
  colorPaletteOutline,
} from "ionicons/icons";
import * as AppGeneral from "../socialcalc/index.js";
import { File } from "../Storage/LocalStorage.js";
import { useInvoice } from "../../contexts/InvoiceContext.js";
import { useTheme } from "../../contexts/ThemeContext.js";
import {
  isQuotaExceededError,
  getQuotaExceededMessage,
} from "../../utils/helper.js";
import TemplateModal from "../TemplateModal/TemplateModal";

interface FileOptionsProps {
  showActionsPopover: boolean;
  setShowActionsPopover: (show: boolean) => void;
  showColorModal: boolean;
  setShowColorPicker: (show: boolean) => void;
  onSave?: () => Promise<void>;
  isAutoSaveEnabled?: boolean;
  fileName: string;
}

const FileOptions: React.FC<FileOptionsProps> = ({
  showActionsPopover,
  setShowActionsPopover,
  showColorModal,
  setShowColorPicker,
  onSave,
  isAutoSaveEnabled = false,
  fileName,
}) => {
  const { isDarkMode } = useTheme();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showSaveAsAlert, setShowSaveAsAlert] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [device] = useState(AppGeneral.getDeviceType());
  const actionsPopoverRef = useRef<HTMLIonPopoverElement>(null);

  // Template modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const {
    selectedFile,
    store,
    billType,
    activeTemplateData,
    updateSelectedFile,
    updateBillType,
    resetToDefaults,
  } = useInvoice();

  // Helper function to trigger save if autosave is enabled
  const triggerAutoSave = async () => {
    if (isAutoSaveEnabled && onSave) {
      try {
        await onSave();
      } catch (error) {
        // Error handled
      }
    }
  };

  const handleUndo = () => {
    AppGeneral.undo();
  };

  const handleRedo = () => {
    AppGeneral.redo();
  };

  const _validateName = (filename: string) => {
    if (!filename.trim()) {
      setToastMessage("File name cannot be empty");
      setShowToast(true);
      return false;
    }
    return true;
  };

  const _checkForExistingFile = async (filename: string) => {
    try {
      const existingFile = await store._checkKey(filename);
      if (existingFile) {
        setToastMessage("File already exists. Please choose a different name.");
        setShowToast(true);
        return true;
      }
      return false;
    } catch (error) {
      // Error handled
      return false;
    }
  };

  const doSaveAs = async (filename: string) => {
    try {
      // Validate the filename first
      if (!_validateName(filename)) {
        return;
      }

      // Check if file already exists
      const exists = await _checkForExistingFile(filename);
      if (exists) return;

      setToastMessage("Saving file...");
      setShowToast(true);

      // Get current file data to copy its structure
      const currentFile = await store._getFile(fileName || selectedFile);
      const content = AppGeneral.getSpreadsheetContent();
      const now = new Date().toISOString();
      if (!currentFile) {
        // Error handled
        setToastMessage("Error saving file!");
        setShowToast(true);
        return;
      }
      // Create new file with all structure from current file
      let data = {
        created: currentFile?.created || now,
        modified: now,
        content: encodeURIComponent(content),
        name: filename,
        billType: currentFile?.billType || billType || 1,
        isEncrypted: currentFile?.isEncrypted || false,
        templateId: currentFile?.templateId,
      };

      const file = new File(
        data.created,
        data.modified,
        data.content,
        data.name,
        data.billType,
        data.templateId,
        data.isEncrypted
      );
      // Error handled
      await store._saveFile(file);

      setToastMessage("File saved successfully!");
      setShowToast(true);
      // Redirect to the new file after a short delay
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = `/app/editor/${filename}`;
        link.click();
      }, 200);
    } catch (error) {
      // Error handled

      if (isQuotaExceededError(error)) {
        setToastMessage(getQuotaExceededMessage("saving file"));
      } else {
        setToastMessage("Failed to save file. Please try again.");
      }
      setShowToast(true);
    }
  };

  const handleSaveAs = () => {
    setShowActionsPopover(false);
    setNewFileName("");
    setShowSaveAsAlert(true);
  };

  const handleNewFileClick = () => {
    setShowActionsPopover(false);
    setShowTemplateModal(true);
  };

  return (
    <>
      {/* Actions Popover */}
      <IonPopover
        ref={actionsPopoverRef}
        isOpen={showActionsPopover}
        onDidDismiss={() => setShowActionsPopover(false)}
        trigger="actions-trigger"
        side="end"
        alignment="end"
      >
        <IonContent>
          <IonList>
            <IonItem button onClick={handleNewFileClick}>
              <IonIcon icon={addOutline} slot="start" />
              <IonLabel>New</IonLabel>
            </IonItem>

            <IonItem button onClick={handleSaveAs}>
              <IonIcon icon={documentOutline} slot="start" />
              <IonLabel>Save As</IonLabel>
            </IonItem>

            <IonItem button onClick={handleUndo}>
              <IonIcon icon={arrowUndo} slot="start" />
              <IonLabel>Undo</IonLabel>
            </IonItem>

            <IonItem button onClick={handleRedo}>
              <IonIcon icon={arrowRedo} slot="start" />
              <IonLabel>Redo</IonLabel>
            </IonItem>

            <IonItem button onClick={() => setShowColorPicker(true)}>
              <IonIcon icon={colorPaletteOutline} slot="start" />
              <IonLabel>Sheet Colors</IonLabel>
            </IonItem>
          </IonList>
        </IonContent>
      </IonPopover>

      {/* Save As Alert */}
      <IonAlert
        isOpen={showSaveAsAlert}
        onDidDismiss={() => setShowSaveAsAlert(false)}
        header="Save As"
        inputs={[
          {
            name: "filename",
            type: "text",
            placeholder: "Enter filename",
            value: newFileName,
          },
        ]}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
            cssClass: "secondary",
          },
          {
            text: "Save",
            handler: (data) => {
              if (data.filename?.trim()) {
                doSaveAs(data.filename.trim());
              }
            },
          },
        ]}
      />

      {/* Toast for notifications */}
      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={3000}
        onDidDismiss={() => setShowToast(false)}
        position="bottom"
      />

      {/* Template Modal */}
      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onFileCreated={(fileName, templateId) => {
          setToastMessage(`File "${fileName}" created successfully!`);
          setShowToast(true);
        }}
      />
    </>
  );
};

export default FileOptions;
