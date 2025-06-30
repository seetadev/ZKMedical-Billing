import React, { useState } from "react";
import * as AppGeneral from "../socialcalc/index.js";
import { File, Local } from "../Storage/LocalStorage";
import { DATA } from "../../app-data";
import { IonAlert, IonIcon, IonToast } from "@ionic/react";
import { add, addCircle, addOutline, documentText } from "ionicons/icons";
import { useTheme } from "../../contexts/ThemeContext";
import { useInvoice } from "../../contexts/InvoiceContext";
import { addIcons } from "ionicons";

const NewFile: React.FC = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showNewInvoiceAlert, setShowNewInvoiceAlert] = useState(false);
  const { isDarkMode } = useTheme();
  const [device] = useState(AppGeneral.getDeviceType());
  const { selectedFile, billType, store, updateSelectedFile, resetToDefaults } =
    useInvoice();

  const handleNewFileClick = async () => {
    setShowNewInvoiceAlert(true);
  };

  const createNewFile = () => {
    const msc = DATA["home"][device]["msc"];

    resetToDefaults();

    setTimeout(() => {
      AppGeneral.viewFile("default", JSON.stringify(msc));
    }, 100);
  };

  return (
    <React.Fragment>
      <IonIcon
        icon={addCircle}
        slot="end"
        className="new-file-icon"
        size="large"
        data-testid="new-file-btn"
        onClick={handleNewFileClick}
        title="Create New File"
      />

      {/* New Invoice Confirmation Alert */}
      <IonAlert
        isOpen={showNewInvoiceAlert}
        onDidDismiss={() => setShowNewInvoiceAlert(false)}
        header="📄 Create New Invoice"
        message="Do you want to create a new invoice? Make sure you have saved your currently working invoice."
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
            handler: () => {
              setShowNewInvoiceAlert(false);
            },
          },
          {
            text: "Create New",
            handler: () => {
              createNewFile();
              setShowNewInvoiceAlert(false);
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
    </React.Fragment>
  );
};

export default NewFile;
