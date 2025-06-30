import React, { useState } from "react";
import * as AppGeneral from "../socialcalc/index.js";
import { File, Local } from "../Storage/LocalStorage";
import { isPlatform, IonToast, IonLoading } from "@ionic/react";
import { EmailComposer } from "capacitor-email-composer";
import { Printer } from "@ionic-native/printer";
import { IonActionSheet, IonAlert } from "@ionic/react";
import {
  saveOutline,
  save,
  mail,
  print,
  cloudUpload,
  download,
  documentOutline,
  documents,
  key,
  server,
} from "ionicons/icons";
import { APP_NAME } from "../../app-data";
import { useAccount } from "@starknet-react/core";
import { uploadJSONToIPFS } from "../../utils/ipfs";
import { useSaveFile } from "../../hooks/useContractWrite";
import { useIsUserSubscribed } from "../../hooks/useContractRead";
import { useTheme } from "../../contexts/ThemeContext";
import { useInvoice } from "../../contexts/InvoiceContext";
import { exportHTMLAsPDF } from "../../services/exportAsPdf.js";
import { exportAllSheetsAsPDF } from "../../services/exportAllSheetsAsPdf";
import { exportCSV, parseSocialCalcCSV } from "../../services/exportAsCsv";
import { Share } from "@capacitor/share";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";

const Menu: React.FC<{
  showM: boolean;
  setM: Function;
}> = (props) => {
  const { address, account } = useAccount();
  const { isDarkMode } = useTheme();
  const { selectedFile, billType, store, updateSelectedFile } = useInvoice();
  const { saveFile, isPending: isSaving } = useSaveFile();
  const { isSubscribed } = useIsUserSubscribed({
    accountAddress: address as `0x${string}` | undefined,
  });

  const [showAlert1, setShowAlert1] = useState(false);
  const [showAlert2, setShowAlert2] = useState(false);
  const [showAlert3, setShowAlert3] = useState(false);
  const [showAlert4, setShowAlert4] = useState(false);
  const [showAlert5, setShowAlert5] = useState(false); // For blockchain save
  const [showAlert6, setShowAlert6] = useState(false); // For PDF filename
  const [showAlert7, setShowAlert7] = useState(false); // For CSV filename
  const [showAlert8, setShowAlert8] = useState(false); // For export all PDF filename
  const [showAlert9, setShowAlert9] = useState(false); // For password protection
  const [showAlert10, setShowAlert10] = useState(false); // For password input when loading
  const [showAlert11, setShowAlert11] = useState(false); // For server save filename
  const [showToast1, setShowToast1] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingCSV, setIsGeneratingCSV] = useState(false);
  const [isExportingAllPDF, setIsExportingAllPDF] = useState(false);
  const [pdfProgress, setPdfProgress] = useState("");
  const [exportAllProgress, setExportAllProgress] = useState("");
  const [passwordProtect, setPasswordProtect] = useState(false);
  const [filePassword, setFilePassword] = useState("");
  const [currentFileForPassword, setCurrentFileForPassword] = useState("");

  /* Utility functions */
  const _validateName = async (filename) => {
    filename = filename.trim();
    if (filename === "default" || filename === "Untitled") {
      setToastMessage(
        "cannot update default or Untitled file! Use Save As Button to save."
      );
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
    } else if (await store._checkKey(filename)) {
      setToastMessage("Filename already exists");
      return false;
    }
    return true;
  };

  const getCurrentFileName = () => {
    return selectedFile;
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

  const doGeneratePDF = async (filename?: string) => {
    try {
      setIsGeneratingPDF(true);
      setPdfProgress("Preparing content for PDF...");

      // Get the current HTML content from the spreadsheet
      const htmlContent = AppGeneral.getCurrentHTMLContent();

      if (!htmlContent || htmlContent.trim() === "") {
        setToastMessage("No content available to export as PDF");
        setShowToast1(true);
        setIsGeneratingPDF(false);
        return;
      }

      const pdfFilename = filename || selectedFile || "invoice";

      // Check if we're on a mobile device
      if (isPlatform("hybrid") || isPlatform("mobile")) {
        // Generate PDF as blob for sharing on mobile
        const pdfBlob = await exportHTMLAsPDF(htmlContent, {
          filename: pdfFilename,
          format: "a4",
          orientation: "portrait",
          margin: 10,
          quality: 2,
          returnBlob: true,
          onProgress: (message: string) => {
            setPdfProgress(message);
          },
        });

        if (pdfBlob) {
          try {
            // Convert blob to base64
            const reader = new FileReader();
            reader.onloadend = async () => {
              const base64Data = reader.result as string;
              const base64 = base64Data.split(",")[1]; // Remove data:application/pdf;base64, prefix

              try {
                // Save to temporary file
                const tempFile = await Filesystem.writeFile({
                  path: `${pdfFilename}.pdf`,
                  data: base64,
                  directory: Directory.Cache,
                });

                // Share the file
                await Share.share({
                  title: `${pdfFilename}.pdf`,
                  text: "Invoice PDF generated successfully",
                  url: tempFile.uri,
                  dialogTitle: "Share PDF",
                });

                setToastMessage(`PDF generated and ready to share!`);
                setShowToast1(true);
              } catch (shareError) {
                console.log("Error sharing PDF:", shareError);
                // Fallback: still generate PDF normally
                await exportHTMLAsPDF(htmlContent, {
                  filename: pdfFilename,
                  format: "a4",
                  orientation: "portrait",
                  margin: 10,
                  quality: 2,
                  onProgress: (message: string) => {
                    setPdfProgress(message);
                  },
                });
                setToastMessage(`PDF saved as ${pdfFilename}.pdf`);
                setShowToast1(true);
              }
            };
            reader.readAsDataURL(pdfBlob as Blob);
          } catch (error) {
            console.error("Error processing PDF for sharing:", error);
            // Fallback to normal PDF generation
            await exportHTMLAsPDF(htmlContent, {
              filename: pdfFilename,
              format: "a4",
              orientation: "portrait",
              margin: 10,
              quality: 2,
              onProgress: (message: string) => {
                setPdfProgress(message);
              },
            });
            setToastMessage(`PDF saved as ${pdfFilename}.pdf`);
            setShowToast1(true);
          }
        }
      } else {
        // Desktop behavior - use original export function
        await exportHTMLAsPDF(htmlContent, {
          filename: pdfFilename,
          format: "a4",
          orientation: "portrait",
          margin: 10,
          quality: 2,
          onProgress: (message: string) => {
            setPdfProgress(message);
          },
        });

        setToastMessage(`PDF saved as ${pdfFilename}.pdf`);
        setShowToast1(true);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      setToastMessage("Failed to generate PDF. Please try again.");
      setShowToast1(true);
    } finally {
      setIsGeneratingPDF(false);
      setPdfProgress("");
    }
  };

  const doGenerateCSV = async (filename?: string) => {
    try {
      setIsGeneratingCSV(true);

      // Get CSV content from the spreadsheet using SocialCalc
      const csvContent = AppGeneral.getCSVContent();

      if (!csvContent || csvContent.trim() === "") {
        setToastMessage("No data available to export as CSV");
        setShowToast1(true);
        setIsGeneratingCSV(false);
        return;
      }

      const csvFilename = filename || selectedFile || "invoice_data";

      // Parse and clean the CSV content
      const cleanedCSV = parseSocialCalcCSV(csvContent);

      // Check if we're on a mobile device
      if (isPlatform("hybrid") || isPlatform("mobile")) {
        try {
          // Generate CSV as blob for sharing on mobile
          const csvBlob = await exportCSV(cleanedCSV, {
            filename: csvFilename,
            returnBlob: true,
          });

          if (csvBlob) {
            // Convert blob to base64
            const reader = new FileReader();
            reader.onloadend = async () => {
              const base64Data = reader.result as string;
              const base64 = base64Data.split(",")[1]; // Remove data prefix

              try {
                // Save to temporary file
                const tempFile = await Filesystem.writeFile({
                  path: `${csvFilename}.csv`,
                  data: base64,
                  directory: Directory.Cache,
                });

                // Share the file
                await Share.share({
                  title: `${csvFilename}.csv`,
                  text: "Invoice data exported as CSV",
                  url: tempFile.uri,
                  dialogTitle: "Share CSV",
                });

                setToastMessage(`CSV generated and ready to share!`);
                setShowToast1(true);
              } catch (shareError) {
                console.log("Error sharing CSV:", shareError);
                // Fallback: generate CSV normally
                await exportCSV(cleanedCSV, {
                  filename: csvFilename,
                });
                setToastMessage(`CSV saved as ${csvFilename}.csv`);
                setShowToast1(true);
              }
            };
            reader.readAsDataURL(csvBlob as Blob);
          }
        } catch (error) {
          console.error("Error processing CSV for sharing:", error);
          // Fallback to normal CSV generation
          await exportCSV(cleanedCSV, {
            filename: csvFilename,
          });
          setToastMessage(`CSV saved as ${csvFilename}.csv`);
          setShowToast1(true);
        }
      } else {
        // Desktop behavior - direct download
        await exportCSV(cleanedCSV, {
          filename: csvFilename,
        });

        setToastMessage(`CSV saved as ${csvFilename}.csv`);
        setShowToast1(true);
      }
    } catch (error) {
      console.error("Error generating CSV:", error);
      setToastMessage("Failed to generate CSV. Please try again.");
      setShowToast1(true);
    } finally {
      setIsGeneratingCSV(false);
    }
  };

  const doExportAllSheetsAsPDF = async (filename?: string) => {
    try {
      setIsExportingAllPDF(true);
      setExportAllProgress("Collecting all sheets data...");

      // Get all sheets data using the new function from index.js
      const sheetsData = AppGeneral.getAllSheetsData();

      if (!sheetsData || sheetsData.length === 0) {
        setToastMessage("No sheets available to export");
        setShowToast1(true);
        setIsExportingAllPDF(false);
        return;
      }

      const pdfFilename =
        filename || `${selectedFile}_all_sheets` || "all_invoices";

      setExportAllProgress(`Exporting ${sheetsData.length} sheets...`);

      // Check if we're on a mobile device
      if (isPlatform("hybrid") || isPlatform("mobile")) {
        // Generate PDF as blob for sharing on mobile
        const pdfBlob = await exportAllSheetsAsPDF(sheetsData, {
          filename: pdfFilename,
          format: "a4",
          orientation: "portrait",
          margin: 10,
          quality: 2,
          returnBlob: true,
          onProgress: (message: string) => {
            setExportAllProgress(message);
          },
        });

        if (pdfBlob) {
          try {
            // Convert blob to base64
            const reader = new FileReader();
            reader.onloadend = async () => {
              const base64Data = reader.result as string;
              const base64 = base64Data.split(",")[1]; // Remove data:application/pdf;base64, prefix

              try {
                // Save to temporary file
                const tempFile = await Filesystem.writeFile({
                  path: `${pdfFilename}.pdf`,
                  data: base64,
                  directory: Directory.Cache,
                });

                // Share the file
                await Share.share({
                  title: `${pdfFilename}.pdf`,
                  text: `Combined PDF with ${sheetsData.length} invoices generated successfully`,
                  url: tempFile.uri,
                  dialogTitle: "Share Combined PDF",
                });

                setToastMessage(
                  `Combined PDF with ${sheetsData.length} sheets generated and ready to share!`
                );
                setShowToast1(true);
              } catch (shareError) {
                console.log("Error sharing combined PDF:", shareError);
                // Fallback: still generate PDF normally
                await exportAllSheetsAsPDF(sheetsData, {
                  filename: pdfFilename,
                  format: "a4",
                  orientation: "portrait",
                  margin: 10,
                  quality: 2,
                  onProgress: (message: string) => {
                    setExportAllProgress(message);
                  },
                });
                setToastMessage(`Combined PDF saved as ${pdfFilename}.pdf`);
                setShowToast1(true);
              }
            };
            reader.readAsDataURL(pdfBlob as Blob);
          } catch (error) {
            console.error("Error processing combined PDF for sharing:", error);
            // Fallback to normal PDF generation
            await exportAllSheetsAsPDF(sheetsData, {
              filename: pdfFilename,
              format: "a4",
              orientation: "portrait",
              margin: 10,
              quality: 2,
              onProgress: (message: string) => {
                setExportAllProgress(message);
              },
            });
            setToastMessage(`Combined PDF saved as ${pdfFilename}.pdf`);
            setShowToast1(true);
          }
        }
      } else {
        // Desktop behavior - use original export function
        await exportAllSheetsAsPDF(sheetsData, {
          filename: pdfFilename,
          format: "a4",
          orientation: "portrait",
          margin: 10,
          quality: 2,
          onProgress: (message: string) => {
            setExportAllProgress(message);
          },
        });

        setToastMessage(
          `Combined PDF with ${sheetsData.length} sheets saved as ${pdfFilename}.pdf`
        );
        setShowToast1(true);
      }
    } catch (error) {
      console.error("Error generating combined PDF:", error);
      setToastMessage("Failed to generate combined PDF. Please try again.");
      setShowToast1(true);
    } finally {
      setIsExportingAllPDF(false);
      setExportAllProgress("");
    }
  };

  const showPDFNameDialog = () => {
    setShowAlert6(true);
  };

  const showCSVNameDialog = () => {
    setShowAlert7(true);
  };

  const showExportAllPDFNameDialog = () => {
    setShowAlert8(true);
  };

  const doSaveToBlockchain = async () => {
    if (selectedFile === "default") {
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
        fileName: selectedFile,
        content: content,
        timestamp: new Date().toISOString(),
        billType: billType,
        creator: address,
      };

      // Upload to IPFS
      const ipfsHash = await uploadJSONToIPFS(fileData);
      console.log("File uploaded to IPFS:", ipfsHash);

      // Save to blockchain
      await saveFile(selectedFile, ipfsHash);

      // Also save locally
      const localFile = new File(
        new Date().toString(),
        new Date().toString(),
        encodeURIComponent(content),
        selectedFile,
        billType
      );
      store._saveFile(localFile);
      updateSelectedFile(selectedFile);

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
          billType,
          passwordProtect,
          passwordProtect ? filePassword : undefined
        );
        console.log(file);
        // const data = { created: file.created, modified: file.modified, content: file.content, password: file.password };
        // console.log(JSON.stringify(data));
        store._saveFile(file);
        updateSelectedFile(filename);

        // Reset password protection state
        setPasswordProtect(false);
        setFilePassword("");

        setShowAlert4(true);
      } else {
        setShowToast1(true);
      }
    }
  };

  const doSaveToServer = async (filename) => {
    if (filename) {
      if (await _validateName(filename)) {
        try {
          setToastMessage("Saving to server...");
          setShowToast1(true);

          const content = AppGeneral.getSpreadsheetContent();

          // Import the server files service
          const { serverFilesService } = await import(
            "../../services/serverFiles"
          );

          // Check if user is authenticated
          if (!serverFilesService.isAuthenticated()) {
            setToastMessage("Please login to server files first");
            setShowToast1(true);
            return;
          }

          // Upload to server
          const result = await serverFilesService.uploadInvoiceData(
            filename,
            content,
            billType
          );

          setToastMessage(`File saved to server as server_${filename}`);
          setShowToast1(true);
        } catch (error) {
          console.error("Error saving to server:", error);
          setToastMessage("Failed to save to server. Please try again.");
          setShowToast1(true);
        }
      } else {
        setShowToast1(true);
      }
    }
  };

  const doSaveAsWithPassword = async (filename, password) => {
    if (filename && password) {
      if (await _validateName(filename)) {
        const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
        const file = new File(
          new Date().toString(),
          new Date().toString(),
          content,
          filename,
          billType,
          true,
          password
        );

        store._saveFile(file);
        updateSelectedFile(filename);
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

  // Function to generate invoice filename with current datetime
  const generateInvoiceFilename = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `invoice_${year}${month}${day}_${hours}${minutes}${seconds}`;
  };

  // Function to select text in input field after dialog opens
  const selectInputText = (inputElement: HTMLIonInputElement) => {
    if (inputElement && inputElement.getInputElement) {
      inputElement.getInputElement().then((nativeInput) => {
        if (nativeInput) {
          nativeInput.select();
        }
      });
    }
  };

  // Create buttons array conditionally based on platform
  const getMenuButtons = () => {
    const baseButtons = [
      {
        text: "Save As",
        icon: save,
        handler: () => {
          setShowAlert3(true);
          console.log("Save As clicked");
        },
      },
      {
        text: "Save As (Password Protected)",
        icon: key,
        handler: () => {
          setShowAlert9(true);
          console.log("Save As with Password clicked");
        },
      },
    ];

    // Only add print button for non-mobile devices
    if (!isPlatform("mobile") && !isPlatform("hybrid")) {
      baseButtons.push({
        text: "Print",
        icon: print,
        handler: () => {
          doPrint();
          console.log("Print clicked");
        },
      });
    }

    // Add remaining buttons
    baseButtons.push(
      {
        text: "Export as PDF",
        icon: download,
        handler: () => {
          showPDFNameDialog();
          console.log("Download as PDF clicked");
        },
      },
      {
        text: "Export as CSV",
        icon: documentOutline,
        handler: () => {
          showCSVNameDialog();
          console.log("Export as CSV clicked");
        },
      },
      {
        text: "Export Workbook as PDF",
        icon: documents,
        handler: () => {
          showExportAllPDFNameDialog();
          console.log("Export All Sheets as PDF clicked");
        },
      },
      // {
      //   text: "Email",
      //   icon: mail,
      //   handler: () => {
      //     sendEmail();
      //     console.log("Email clicked");
      //   },
      // },
      {
        text: "Upload to Blockchain",
        icon: cloudUpload,
        handler: () => {
          doSaveToBlockchain();
          console.log("Save to Blockchain clicked");
        },
      },
      {
        text: "Save to Server",
        icon: server,
        handler: () => {
          setShowAlert11(true);
          console.log("Save to Server clicked");
        },
      }
    );

    return baseButtons;
  };

  return (
    <React.Fragment>
      <IonActionSheet
        animated
        keyboardClose
        isOpen={props.showM}
        onDidDismiss={() => props.setM()}
        buttons={getMenuButtons()}
      />
      <IonAlert
        animated
        isOpen={showAlert1}
        onDidDismiss={() => setShowAlert1(false)}
        header="Alert Message"
        message={
          "Cannot update " +
          getCurrentFileName() +
          " file! Use Save As Button to save."
        }
        buttons={["Ok"]}
      />
      <IonAlert
        animated
        isOpen={showAlert2}
        onDidDismiss={() => setShowAlert2(false)}
        header="Save"
        message={"File " + getCurrentFileName() + " updated successfully"}
        buttons={["Ok"]}
      />
      <IonAlert
        animated
        isOpen={showAlert3}
        onDidDismiss={() => setShowAlert3(false)}
        header="Save As"
        inputs={[
          {
            name: "filename",
            type: "text",
            placeholder: "Enter filename",
            value: generateInvoiceFilename(),
          },
        ]}
        buttons={[
          {
            text: "Ok",
            handler: (alertData) => {
              doSaveAs(alertData.filename);
            },
          },
        ]}
        onDidPresent={(ev) => {
          // Select the text in the input field when dialog opens
          const inputElement = ev.target?.querySelector(
            "ion-input"
          ) as HTMLIonInputElement;
          if (inputElement) {
            setTimeout(() => selectInputText(inputElement), 100);
          }
        }}
      />
      <IonAlert
        animated
        isOpen={showAlert4}
        onDidDismiss={() => setShowAlert4(false)}
        header="Save As"
        message={"File " + getCurrentFileName() + " saved successfully"}
        buttons={["Ok"]}
      />
      <IonAlert
        animated
        isOpen={showAlert6}
        onDidDismiss={() => setShowAlert6(false)}
        header="Export as PDF"
        inputs={[
          {
            name: "pdfFilename",
            type: "text",
            placeholder: "Enter PDF filename",
            value: selectedFile || "invoice",
          },
        ]}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Download",
            handler: (alertData) => {
              const filename =
                alertData.pdfFilename?.trim() || selectedFile || "invoice";
              doGeneratePDF(filename);
            },
          },
        ]}
      />
      <IonAlert
        animated
        isOpen={showAlert7}
        onDidDismiss={() => setShowAlert7(false)}
        header="Export as CSV"
        inputs={[
          {
            name: "csvFilename",
            type: "text",
            placeholder: "Enter CSV filename",
            value: selectedFile || "invoice_data",
          },
        ]}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Export",
            handler: (alertData) => {
              const filename =
                alertData.csvFilename?.trim() || selectedFile || "invoice_data";
              doGenerateCSV(filename);
            },
          },
        ]}
      />
      <IonAlert
        animated
        isOpen={showAlert7}
        onDidDismiss={() => setShowAlert7(false)}
        header="Download as CSV"
        inputs={[
          {
            name: "csvFilename",
            type: "text",
            placeholder: "Enter CSV filename",
            value: selectedFile || "invoice_data",
          },
        ]}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Download",
            handler: (alertData) => {
              const filename =
                alertData.csvFilename?.trim() || selectedFile || "invoice_data";
              doGenerateCSV(filename);
            },
          },
        ]}
      />
      <IonAlert
        animated
        isOpen={showAlert8}
        onDidDismiss={() => setShowAlert8(false)}
        header="Download Workbook as PDF"
        inputs={[
          {
            name: "pdfFilename",
            type: "text",
            placeholder: "Enter PDF filename",
            value: selectedFile ? `${selectedFile}_all_sheets` : "all_invoices",
          },
        ]}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Download",
            handler: (alertData) => {
              const filename =
                alertData.pdfFilename?.trim() ||
                `${selectedFile}_all_sheets` ||
                "all_invoices";
              doExportAllSheetsAsPDF(filename);
            },
          },
        ]}
      />
      <IonAlert
        animated
        isOpen={showAlert9}
        onDidDismiss={() => setShowAlert9(false)}
        header="Password Protection"
        message="Enter password to protect the file"
        inputs={[
          {
            name: "password",
            type: "password",
            placeholder: "Enter password",
          },
          {
            name: "filename",
            type: "text",
            placeholder: "Enter filename",
            value:
              selectedFile === "default"
                ? generateInvoiceFilename()
                : selectedFile,
          },
        ]}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Save",
            handler: (alertData) => {
              if (alertData.password && alertData.filename) {
                doSaveAsWithPassword(alertData.filename, alertData.password);
              } else {
                setToastMessage("Please enter both filename and password");
                setShowToast1(true);
                return false; // Prevent dialog from closing
              }
            },
          },
        ]}
        onDidPresent={(ev) => {
          // Select the text in the filename input field when dialog opens
          const inputElements = ev.target?.querySelectorAll(
            "ion-input"
          ) as NodeListOf<HTMLIonInputElement>;
          if (inputElements && inputElements.length > 1) {
            setTimeout(() => selectInputText(inputElements[1]), 100); // Select the filename input (second input)
          }
        }}
      />
      <IonAlert
        animated
        isOpen={showAlert10}
        onDidDismiss={() => setShowAlert10(false)}
        header="Password Input"
        message="Enter the password to access the file"
        inputs={[
          {
            name: "password",
            type: "password",
            placeholder: "Enter password",
          },
        ]}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Access",
            handler: (alertData) => {
              if (alertData.password === filePassword) {
                setPasswordProtect(false);
                setCurrentFileForPassword("");
                setToastMessage("File accessed successfully");
                setShowToast1(true);
              } else {
                setToastMessage("Incorrect password");
                setShowToast1(true);
              }
            },
          },
        ]}
      />
      <IonAlert
        animated
        isOpen={showAlert11}
        onDidDismiss={() => setShowAlert11(false)}
        header="Save to Server"
        inputs={[
          {
            name: "serverFilename",
            type: "text",
            placeholder: "Enter filename",
            value:
              selectedFile === "default"
                ? generateInvoiceFilename()
                : selectedFile,
          },
        ]}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Save",
            handler: (alertData) => {
              const filename = alertData.serverFilename?.trim();
              if (filename) {
                doSaveToServer(filename);
              } else {
                setToastMessage("Please enter a filename");
                setShowToast1(true);
                return false; // Prevent dialog from closing
              }
            },
          },
        ]}
        onDidPresent={(ev) => {
          // Select the text in the input field when dialog opens
          const inputElement = ev.target?.querySelector(
            "ion-input"
          ) as HTMLIonInputElement;
          if (inputElement) {
            setTimeout(() => selectInputText(inputElement), 100);
          }
        }}
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
        position="top"
        message={toastMessage}
        duration={3000}
      />
      <IonLoading
        isOpen={isGeneratingPDF}
        message={pdfProgress || "Generating PDF..."}
        onDidDismiss={() => setIsGeneratingPDF(false)}
      />
      <IonLoading
        isOpen={isGeneratingCSV}
        message="Generating CSV..."
        onDidDismiss={() => setIsGeneratingCSV(false)}
      />
      <IonLoading
        isOpen={isExportingAllPDF}
        message={exportAllProgress || "Exporting all sheets as PDF..."}
        onDidDismiss={() => setIsExportingAllPDF(false)}
      />
    </React.Fragment>
  );
};

export default Menu;
