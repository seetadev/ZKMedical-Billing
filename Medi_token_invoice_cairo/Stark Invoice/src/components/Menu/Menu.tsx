import React, { useState } from "react";
import * as AppGeneral from "../socialcalc/index.js";
import { File, Local } from "../Storage/LocalStorage";
import { isPlatform, IonToast } from "@ionic/react";
import { EmailComposer } from "capacitor-email-composer";
import { Printer } from "@ionic-native/printer";
import { IonActionSheet, IonAlert } from "@ionic/react";
import { saveOutline, save, mail, print, cloudUpload } from "ionicons/icons";
import { APP_NAME } from "../../app-data.js";
import { useAccount } from "@starknet-react/core";
import { uploadJSONToIPFS } from "../../utils/ipfs";
import { useSaveFile } from "../../hooks/useContractWrite";
import { useIsUserSubscribed } from "../../hooks/useContractRead";

const Menu: React.FC<{
  showM: boolean;
  setM: Function;
  file: string;
  updateSelectedFile: Function;
  store: Local;
  bT: number;
}> = (props) => {
  const { address, account } = useAccount();
  const { saveFile, isPending: isSaving } = useSaveFile();
  const { isSubscribed } = useIsUserSubscribed({
    accountAddress: address as `0x${string}` | undefined,
  });

  const [showAlert1, setShowAlert1] = useState(false);
  const [showAlert2, setShowAlert2] = useState(false);
  const [showAlert3, setShowAlert3] = useState(false);
  const [showAlert4, setShowAlert4] = useState(false);
  const [showAlert5, setShowAlert5] = useState(false); // For blockchain save
  const [showToast1, setShowToast1] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  /* Utility functions */
  const _validateName = async (filename) => {
    filename = filename.trim();
    if (filename === "default" || filename === "Untitled") {
      setToastMessage("Cannot update default file!");
      return false;
    } else if (filename === "" || !filename) {
      setToastMessage("Filename cannot be empty");
      return false;
    } else if (filename.length > 30) {
      setToastMessage("Filename too long");
      return false;
    } else if (/^[a-zA-Z0-9- ]*$/.test(filename) === false) {
      setToastMessage("Special Characters cannot be used");
      return false;
    } else if (await props.store._checkKey(filename)) {
      setToastMessage("Filename already exists");
      return false;
    }
    return true;
  };

  const getCurrentFileName = () => {
    return props.file;
  };

  const _formatString = (filename) => {
    /* Remove whitespaces */
    while (filename.indexOf(" ") !== -1) {
      filename = filename.replace(" ", "");
    }
    return filename;
  };

  const doPrint = () => {
    if (isPlatform("hybrid")) {
      const printer = Printer;
      printer.print(AppGeneral.getCurrentHTMLContent());
    } else {
      const content = AppGeneral.getCurrentHTMLContent();
      // useReactToPrint({ content: () => content });
      const printWindow = window.open("/printwindow", "Print Invoice");
      printWindow.document.write(content);
      printWindow.print();
    }
  };
  const doSave = () => {
    if (props.file === "default") {
      setShowAlert1(true);
      return;
    }
    const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
    const data = props.store._getFile(props.file);
    const file = new File(
      (data as any).created,
      new Date().toString(),
      content,
      props.file,
      props.bT
    );
    props.store._saveFile(file);
    props.updateSelectedFile(props.file);
    setShowAlert2(true);
  };

  const doSaveToBlockchain = async () => {
    if (props.file === "default") {
      setShowAlert1(true);
      return;
    }

    if (!address) {
      setToastMessage("Please connect your wallet first");
      setShowToast1(true);
      return;
    }

    // Check if user is subscribed
    if (!isSubscribed) {
      setToastMessage(
        "Premium subscription required to save to blockchain. Please subscribe to access this feature."
      );
      setShowToast1(true);
      return;
    }

    try {
      setToastMessage("Uploading to IPFS and blockchain...");
      setShowToast1(true);

      // Get current spreadsheet content
      const content = AppGeneral.getSpreadsheetContent();

      // Create file metadata
      const fileData = {
        fileName: props.file,
        content: content,
        timestamp: new Date().toISOString(),
        billType: props.bT,
        creator: address,
      };

      // Upload to IPFS
      const ipfsHash = await uploadJSONToIPFS(fileData);
      console.log("File uploaded to IPFS:", ipfsHash);

      // Save to blockchain
      await saveFile(props.file, ipfsHash);

      // Also save locally
      const localFile = new File(
        new Date().toString(),
        new Date().toString(),
        encodeURIComponent(content),
        props.file,
        props.bT
      );
      props.store._saveFile(localFile);
      props.updateSelectedFile(props.file);

      setToastMessage(
        `File saved to blockchain! IPFS: ${ipfsHash.substring(0, 10)}...`
      );
      setShowToast1(true);
    } catch (error) {
      console.error("Error saving to blockchain:", error);
      setToastMessage("Failed to save to blockchain. Please try again.");
      setShowToast1(true);
    }
  };

  const doSaveAs = async (filename) => {
    // event.preventDefault();
    if (filename) {
      // console.log(filename, _validateName(filename));
      if (await _validateName(filename)) {
        // filename valid . go on save
        const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
        // console.log(content);
        const file = new File(
          new Date().toString(),
          new Date().toString(),
          content,
          filename,
          props.bT
        );
        // const data = { created: file.created, modified: file.modified, content: file.content, password: file.password };
        // console.log(JSON.stringify(data));
        props.store._saveFile(file);
        props.updateSelectedFile(filename);
        setShowAlert4(true);
      } else {
        setShowToast1(true);
      }
    }
  };

  const sendEmail = () => {
    if (isPlatform("hybrid")) {
      const content = AppGeneral.getCurrentHTMLContent();
      const base64 = btoa(content);

      EmailComposer.open({
        to: ["jackdwell08@gmail.com"],
        cc: [],
        bcc: [],
        body: "PFA",
        attachments: [{ type: "base64", path: base64, name: "Invoice.html" }],
        subject: `${APP_NAME} attached`,
        isHtml: true,
      });
    } else {
      alert("This Functionality works on Anroid/IOS devices");
    }
  };

  return (
    <React.Fragment>
      <IonActionSheet
        animated
        keyboardClose
        isOpen={props.showM}
        onDidDismiss={() => props.setM()}
        buttons={[
          {
            text: "Save Locally",
            icon: saveOutline,
            handler: () => {
              doSave();
              console.log("Save clicked");
            },
          },
          {
            text: "Save to Blockchain",
            icon: cloudUpload,
            handler: () => {
              doSaveToBlockchain();
              console.log("Save to Blockchain clicked");
            },
          },
          {
            text: "Save As",
            icon: save,
            handler: () => {
              setShowAlert3(true);
              console.log("Save As clicked");
            },
          },
          {
            text: "Print",
            icon: print,
            handler: () => {
              doPrint();
              console.log("Print clicked");
            },
          },
          {
            text: "Email",
            icon: mail,
            handler: () => {
              sendEmail();
              console.log("Email clicked");
            },
          },
        ]}
      />
      <IonAlert
        animated
        isOpen={showAlert1}
        onDidDismiss={() => setShowAlert1(false)}
        header="Alert Message"
        message={
          "Cannot update <strong>" + getCurrentFileName() + "</strong> file!"
        }
        buttons={["Ok"]}
      />
      <IonAlert
        animated
        isOpen={showAlert2}
        onDidDismiss={() => setShowAlert2(false)}
        header="Save"
        message={
          "File <strong>" +
          getCurrentFileName() +
          "</strong> updated successfully"
        }
        buttons={["Ok"]}
      />
      <IonAlert
        animated
        isOpen={showAlert3}
        onDidDismiss={() => setShowAlert3(false)}
        header="Save As"
        inputs={[
          { name: "filename", type: "text", placeholder: "Enter filename" },
        ]}
        buttons={[
          {
            text: "Ok",
            handler: (alertData) => {
              doSaveAs(alertData.filename);
            },
          },
        ]}
      />
      <IonAlert
        animated
        isOpen={showAlert4}
        onDidDismiss={() => setShowAlert4(false)}
        header="Save As"
        message={
          "File <strong>" +
          getCurrentFileName() +
          "</strong> saved successfully"
        }
        buttons={["Ok"]}
      />
      <IonToast
        animated
        isOpen={showToast1}
        onDidDismiss={() => {
          setShowToast1(false);
          // Only show Save As alert if it was not a blockchain save attempt
          if (
            toastMessage.includes("Filename") ||
            toastMessage.includes("Special Characters") ||
            toastMessage.includes("too long") ||
            toastMessage.includes("empty") ||
            toastMessage.includes("exists")
          ) {
            setShowAlert3(true);
          }
        }}
        position="bottom"
        message={toastMessage}
        duration={3000}
      />
    </React.Fragment>
  );
};

export default Menu;
