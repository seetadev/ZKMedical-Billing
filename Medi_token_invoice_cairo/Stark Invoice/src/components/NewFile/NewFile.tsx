import React, { useState } from "react";
import * as AppGeneral from "../socialcalc/index.js";
import { File, Local } from "../Storage/LocalStorage";
import { DATA } from "../../app-data.js";
import { IonAlert, IonIcon } from "@ionic/react";
import { add, documentText } from "ionicons/icons";

const NewFile: React.FC<{
  file: string;
  updateSelectedFile: Function;
  store: Local;
  billType: number;
}> = (props) => {
  const [showAlertNewFileCreated, setShowAlertNewFileCreated] = useState(false);
  const [showUnsavedChangesAlert, setShowUnsavedChangesAlert] = useState(false);
  const [originalFileContent, setOriginalFileContent] = useState<string>("");

  // Check if current file has unsaved changes
  const hasUnsavedChanges = async (): Promise<boolean> => {
    try {
      const currentContent = AppGeneral.getSpreadsheetContent();

      // If it's the default file, check if content differs from template
      if (props.file === "default") {
        const defaultTemplate = DATA["home"][AppGeneral.getDeviceType()]["msc"];
        const templateContent = JSON.stringify(defaultTemplate);

        // Compare current content with default template
        // Use a more robust comparison by normalizing whitespace
        const normalizedCurrent = currentContent.replace(/\s+/g, " ").trim();
        const normalizedTemplate = templateContent.replace(/\s+/g, " ").trim();

        return normalizedCurrent !== normalizedTemplate;
      }

      // For existing files, compare current content with saved content
      try {
        const savedData = await props.store._getFile(props.file);

        if (!savedData || !savedData.content) {
          // File doesn't exist in storage or has no content, check against template
          const defaultTemplate =
            DATA["home"][AppGeneral.getDeviceType()]["msc"];
          return currentContent !== JSON.stringify(defaultTemplate);
        }

        const savedContent = decodeURIComponent(savedData.content);

        // Use normalized comparison for more accurate detection
        const normalizedCurrent = currentContent.replace(/\s+/g, " ").trim();
        const normalizedSaved = savedContent.replace(/\s+/g, " ").trim();

        return normalizedCurrent !== normalizedSaved;
      } catch (storageError) {
        console.log("File not found in storage, assuming changes exist");
        // If file doesn't exist in storage, assume there are changes
        return true;
      }
    } catch (error) {
      console.error("Error checking for unsaved changes:", error);
      // If we can't determine, assume there are changes to be safe
      return true;
    }
  };

  const handleNewFileClick = async () => {
    const hasChanges = await hasUnsavedChanges();

    if (hasChanges) {
      // Store current content in case user wants to save
      setOriginalFileContent(AppGeneral.getSpreadsheetContent());
      setShowUnsavedChangesAlert(true);
    } else {
      // No unsaved changes, proceed directly
      createNewFile();
    }
  };

  const createNewFile = () => {
    // Save current file if it's not default
    if (props.file !== "default") {
      const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
      const data = props.store._getFile(props.file);
      const file = new File(
        (data as any)?.created || new Date().toString(),
        new Date().toString(),
        content,
        props.file,
        props.billType
      );
      props.store._saveFile(file);
      props.updateSelectedFile(props.file);
    }

    // Create new file with default template
    const msc = DATA["home"][AppGeneral.getDeviceType()]["msc"];
    AppGeneral.viewFile("default", JSON.stringify(msc));
    props.updateSelectedFile("default");
    setShowAlertNewFileCreated(true);
  };

  const saveCurrentAndCreateNew = () => {
    // Save current file before creating new one
    if (props.file === "default") {
      // For default files, create a timestamped file name
      const timestamp =
        new Date().toISOString().replace(/[:.]/g, "-").split("T")[0] +
        "_" +
        new Date().toLocaleTimeString().replace(/[:.]/g, "-");
      const fileName = `invoice_${timestamp}`;

      const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
      const file = new File(
        new Date().toString(),
        new Date().toString(),
        content,
        fileName,
        props.billType
      );
      props.store._saveFile(file);
    } else {
      // Save existing file
      const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
      const data = props.store._getFile(props.file);
      const file = new File(
        (data as any)?.created || new Date().toString(),
        new Date().toString(),
        content,
        props.file,
        props.billType
      );
      props.store._saveFile(file);
    }

    // Now create new file
    createNewFile();
    setShowUnsavedChangesAlert(false);
  };

  return (
    <React.Fragment>
      <IonIcon
        icon={documentText}
        slot="end"
        className="ion-padding-end new-file-icon"
        size="large"
        data-testid="new-file-btn"
        onClick={handleNewFileClick}
        title="Create New File"
      />

      {/* Unsaved Changes Confirmation Dialog */}
      <IonAlert
        isOpen={showUnsavedChangesAlert}
        onDidDismiss={() => setShowUnsavedChangesAlert(false)}
        header="⚠️ Unsaved Changes"
        message="You have unsaved changes in the current file. What would you like to do?"
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
            handler: () => {
              setShowUnsavedChangesAlert(false);
            },
          },
          {
            text: "Discard Changes",
            role: "destructive",
            handler: () => {
              createNewFile();
              setShowUnsavedChangesAlert(false);
            },
          },
          {
            text: "Save & New File",
            handler: () => {
              saveCurrentAndCreateNew();
            },
          },
        ]}
      />

      {/* New File Created Confirmation */}
      <IonAlert
        animated
        isOpen={showAlertNewFileCreated}
        onDidDismiss={() => setShowAlertNewFileCreated(false)}
        header="✅ Success"
        message={"New file created successfully!"}
        buttons={["Ok"]}
      />
    </React.Fragment>
  );
};

export default NewFile;
