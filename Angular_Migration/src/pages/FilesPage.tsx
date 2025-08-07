import React from "react";
import { IonContent, IonPage } from "@ionic/react";
import Files from "../components/Files/Files";
import { useTheme } from "../contexts/ThemeContext";
import { useInvoice } from "../contexts/InvoiceContext";
import "./FilesPage.css";

const FilesPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { selectedFile, billType, store, updateSelectedFile, updateBillType } =
    useInvoice();

  return (
    <IonPage className={isDarkMode ? "dark-theme" : ""}>
      <IonContent fullscreen>
        <Files
          store={store}
          file={selectedFile}
          updateSelectedFile={updateSelectedFile}
          updateBillType={updateBillType}
        />
      </IonContent>
    </IonPage>
  );
};

export default FilesPage;
