import React, { useState, useEffect } from "react";
import * as AppGeneral from "../socialcalc/index.js";
import { File, Local } from "../Storage/LocalStorage";
import { isPlatform, IonToast } from "@ionic/react";
import { EmailComposer } from "capacitor-email-composer";
import { Printer } from "@ionic-native/printer";
import { IonActionSheet, IonAlert } from "@ionic/react";
import { saveOutline, save, mail, print } from "ionicons/icons";
import medinvoiceabi from "../../utils/medinvoiceabi.json";
import { APP_NAME } from "../../app-data.js";
import { ethers } from "ethers";
import { useSigner } from "wagmi";

const Menu: React.FC<{
  showM: boolean;
  setM: Function;
  file: string;
  updateSelectedFile: Function;
  store: Local;
  bT: number;
}> = (props) => {
  const [showAlert1, setShowAlert1] = useState(false);
  const [showAlert2, setShowAlert2] = useState(false);
  const [showAlert3, setShowAlert3] = useState(false);
  const [showAlert4, setShowAlert4] = useState(false);
  const [showToast1, setShowToast1] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [numOfTokens, setNumOfTokens] = useState(0);

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

  const fetchUserTokens = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      import.meta.env.VITE_MEDI_INVOICE_CONTRACT_ADDRESS,
      medinvoiceabi,
      signer
    );
    const userTokens = await contract.getUserTokens();
    console.log("User tokens: ", userTokens);
    setNumOfTokens(userTokens / 10 ** 18);
  };

  useEffect(() => {
    try {
      fetchUserTokens();
    } catch (e) {
      console.log("Error getting user tokens: ", e);
    }
  }, []);

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

  const sendEmail = async () => {
    console.log("Number of tokens: ", numOfTokens);
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
            text: "Save",
            icon: saveOutline,
            handler: () => {
              if (numOfTokens > 1) {
                doSave();
              } else {
                alert("You need at least 1 MediToken to save the file");
              }
            },
          },
          {
            text: "Save As",
            icon: save,
            handler: () => {
              if (numOfTokens > 1) {
                setShowAlert3(true);
              } else {
                alert("You need at least 1 MediToken to save the file");
              }
            },
          },
          {
            text: "Print",
            icon: print,
            handler: () => {
              if (numOfTokens > 1) {
                doPrint();
              } else {
                alert("You need at least 1 MediToken to print");
              }
            },
          },
          {
            text: "Email",
            icon: mail,
            handler: () => {
              if (numOfTokens > 1) {
                sendEmail();
              } else {
                alert("You need at least 1 MediToken to email");
              }
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
          setShowAlert3(true);
        }}
        position="bottom"
        message={toastMessage}
        duration={500}
      />
    </React.Fragment>
  );
};

export default Menu;
