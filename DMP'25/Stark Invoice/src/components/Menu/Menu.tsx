import React, { useState } from "react";
import * as AppGeneral from "../socialcalc/index.js";
import { File, Local } from "../Storage/LocalStorage";
import { isPlatform, IonToast, IonLoading } from "@ionic/react";
import { EmailComposer } from "capacitor-email-composer";
import { Printer } from "@bcyesil/capacitor-plugin-printer";
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
import { APP_NAME, DATA } from "../../app-data";
import { useTheme } from "../../contexts/ThemeContext";
import { useInvoice } from "../../contexts/InvoiceContext";
import { exportHTMLAsPDF } from "../../services/exportAsPdf.js";
import { exportAllSheetsAsPDF } from "../../services/exportAllSheetsAsPdf";
import { exportCSV, parseSocialCalcCSV } from "../../services/exportAsCsv";
import { Share } from "@capacitor/share";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import MenuDialogs from "./MenuDialogs.js";
import { cloudService } from "../../services/cloud-service.js";

const Menu: React.FC<{
  showM: boolean;
  setM: Function;
}> = (props) => {
  const { isDarkMode } = useTheme();
  const { selectedFile, billType, store, updateSelectedFile } = useInvoice();

  const [showAlert1, setShowAlert1] = useState(false);
  const [showAlert2, setShowAlert2] = useState(false);
  const [showAlert3, setShowAlert3] = useState(false);
  const [showAlert4, setShowAlert4] = useState(false);
  const [showAlert6, setShowAlert6] = useState(false); // For PDF filename
  const [showAlert7, setShowAlert7] = useState(false); // For CSV filename
  const [showAlert8, setShowAlert8] = useState(false); // For export all PDF filename
  const [showAlert9, setShowAlert9] = useState(false); // For password protection
  const [showAlert10, setShowAlert10] = useState(false); // For password input when loading
  const [showAlert12, setShowAlert12] = useState(false); // For server PDF filename
  const [showToast1, setShowToast1] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingCSV, setIsGeneratingCSV] = useState(false);
  const [isExportingAllPDF, setIsExportingAllPDF] = useState(false);
  const [isGeneratingServerPDF, setIsGeneratingServerPDF] = useState(false);
  const [pdfProgress, setPdfProgress] = useState("");
  const [exportAllProgress, setExportAllProgress] = useState("");
  const [serverPdfProgress, setServerPdfProgress] = useState("");
  const [passwordProtect, setPasswordProtect] = useState(false);
  const [filePassword, setFilePassword] = useState("");
  const [device] = useState(AppGeneral.getDeviceType());

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

  const doPrint = async () => {
    if (isPlatform("hybrid")) {
      try {
        const htmlContent = AppGeneral.getCurrentHTMLContent();
        
        await Printer.print({
          content: htmlContent,
          name: selectedFile || "Invoice",
          orientation: "portrait"
        });
        
        setToastMessage("Print job sent successfully!");
        setShowToast1(true);
      } catch (error) {
        console.error("Print error:", error);
        setToastMessage("Failed to print. Please check if a printer is available.");
        setShowToast1(true);
      }
    } else {
      const content = AppGeneral.getCurrentHTMLContent();
      const printWindow = window.open("/printwindow", "Print Invoice");
      if (printWindow) {
        printWindow.document.write(content);
        printWindow.print();
      }
    }
  };

  const doGeneratePDF = async (filename?: string) => {
    try {
      setIsGeneratingPDF(true);
      setPdfProgress("Preparing content for PDF...");

      // Get the current HTML content from the spreadsheet
      const htmlContent = AppGeneral.getCurrentHTMLContent();
      console.log(htmlContent);

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

  /**
   * Extracts all image URLs from HTML content
   * @param htmlContent - The HTML string to search for img tags
   * @returns Array of URLs found in img src attributes, or -1 for non-HTTP/HTTPS URLs
   */
  function extractImageUrls(htmlContent: string): (string | number)[] {
    if (!htmlContent || typeof htmlContent !== "string") {
      return [];
    }

    // Regular expression to match img tags and capture src attribute values
    const imgRegex = /<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/gi;
    const urls: (string | number)[] = [];
    let match;

    while ((match = imgRegex.exec(htmlContent)) !== null) {
      const srcValue = match[1];

      // Check if it's a valid HTTP/HTTPS URL
      if (isValidHttpUrl(srcValue)) {
        urls.push(srcValue);
      } else {
        urls.push(-1);
      }
    }

    return urls;
  }

  /**
   * Checks if a URL is a valid HTTP or HTTPS URL
   * @param url - The URL string to validate
   * @returns true if it's a valid HTTP/HTTPS URL, false otherwise
   */
  function isValidHttpUrl(url: string): boolean {
    if (!url || typeof url !== "string") {
      return false;
    }

    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch (error) {
      // If URL constructor throws, it's not a valid URL
      return false;
    }
  }

  const urlsToBase64 = async (htmlContent: string): Promise<string> => {
    const imgArr = extractImageUrls(htmlContent);
    console.log("HTML content for server PDF:", imgArr);

    const urlReplace: string[] = [];
    if (imgArr.length > 0 && imgArr[0] !== -1) {
      // Do something with the image array
      console.log("Extracting image URLs:", imgArr);

      for (const imgUrl of imgArr) {
        console.log("trying to convert to base64:", imgUrl);
        if (typeof imgUrl === "string") {
          const parts = imgUrl.split("/");
          const base64Response = await cloudService.convertUrlToBase64(
            "/logos/" + parts[parts.length - 1]
          );
          urlReplace.push(base64Response.data_url);
        } else {
          urlReplace.push("0");
        }
      }
    }

    if (urlReplace.length > 0) {
      // Replace URLs in the HTML content with base64 data
      let htmlContentWithBase64 = htmlContent;

      // Regular expression to match img tags and capture the entire tag
      const imgRegex = /<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/gi;
      let match;
      let imgIndex = 0;

      // Process each img tag in order
      htmlContentWithBase64 = htmlContentWithBase64.replace(
  imgRegex,
  (fullMatch, srcValue) => {
    if (imgIndex < urlReplace.length) {
      const base64Url = urlReplace[imgIndex];
      imgIndex++;

      // Keep the img tag unchanged if base64Url is "0"
      if (base64Url === "0") {
        return fullMatch; // Return the original img tag without changes
      }

      // Replace the src attribute with the base64 data URL
      return fullMatch.replace(srcValue, base64Url);
    }

    return fullMatch; // Return unchanged if no replacement available
  }
);

      return htmlContentWithBase64;
    }

    return htmlContent;
  };

  /**
   * Generate PDF on server using HTML to PDF API
   * This function sends the current spreadsheet content as HTML to the server
   * where it gets converted to PDF and returns it directly for download
   */
  const doGenerateServerPDF = async (filename?: string) => {
    try {
      setIsGeneratingServerPDF(true);
      setServerPdfProgress("Preparing content for server PDF generation...");
      console.log("Generating server PDF with filename:", filename);

      if (!cloudService.isAuthenticated()) {
        setToastMessage(
          "You're not logged in. Please login to use this feature."
        );
        setShowToast1(true);
        setIsGeneratingServerPDF(false);
        return;
      }

      // Get the current HTML content from the spreadsheet
      const rawHtmlContent = AppGeneral.getCurrentHTMLContent();
      const htmlContent = await urlsToBase64(rawHtmlContent);
      // console.log(htmlContent);
      // return;

      if (!htmlContent || htmlContent.trim() === "") {
        setToastMessage("No content available to export as PDF");
        setShowToast1(true);
        setIsGeneratingServerPDF(false);
        return;
      }

      const pdfFilename = filename || selectedFile || "invoice";

      setServerPdfProgress("Converting HTML to PDF on server...");
      console.log("PDF Filename:", pdfFilename);
      // Generate PDF using the new direct conversion API
      const pdfBlob = await cloudService.convertHTMLToPDF(htmlContent, {
        filename: `${pdfFilename}.pdf`,
        pdfOptions: {
          "page-size": "A4",
          "margin-top": "0.75in",
          "margin-right": "0.75in",
          "margin-bottom": "0.75in",
          "margin-left": "0.75in",
          orientation: "portrait",
        },
      });
      console.log("PDF Blob received from server:", pdfBlob);

      setServerPdfProgress("Processing PDF for download...");

      // Check if we're on a mobile device
      if (isPlatform("hybrid") || isPlatform("mobile")) {
        try {
          // Convert blob to base64 for sharing on mobile
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
                text: "Server generated PDF ready to share",
                url: tempFile.uri,
                dialogTitle: "Share Server PDF",
              });

              setToastMessage(`Server PDF generated and ready to share!`);
              setShowToast1(true);
            } catch (shareError) {
              console.log("Error sharing server PDF:", shareError);
              // Fallback to direct download
              const url = URL.createObjectURL(pdfBlob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `${pdfFilename}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);

              setToastMessage(`Server PDF downloaded: ${pdfFilename}.pdf`);
              setShowToast1(true);
            }
          };
          reader.readAsDataURL(pdfBlob);
        } catch (error) {
          console.error("Error processing server PDF for sharing:", error);
          // Fallback to direct download
          const url = URL.createObjectURL(pdfBlob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${pdfFilename}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          setToastMessage(`Server PDF downloaded: ${pdfFilename}.pdf`);
          setShowToast1(true);
        }
      } else {
        // Desktop behavior - direct download
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${pdfFilename}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setToastMessage(`Server PDF downloaded: ${pdfFilename}.pdf`);
        setShowToast1(true);
      }
    } catch (error) {
      console.error("Error generating server PDF:", error);
      setToastMessage(
        error.message || "Failed to generate PDF on server. Please try again."
      );
      setShowToast1(true);
    } finally {
      setIsGeneratingServerPDF(false);
      setServerPdfProgress("");
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

  const showServerPDFNameDialog = () => {
    setShowAlert12(true);
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

    return `invoice-${year}${month}${day}-${hours}${minutes}${seconds}`;
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
    const baseButtons = [];

    // Add print button for all platforms
    baseButtons.push({
      text: "Print",
      icon: print,
      handler: () => {
        doPrint();
        console.log("Print clicked");
      },
    });

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
      {
        text: "Export as PDF via Server",
        icon: cloudUpload,
        handler: () => {
          showServerPDFNameDialog();
          console.log("Export as PDF via Server clicked");
        },
      }
      // {
      //   text: "Email",
      //   icon: mail,
      //   handler: () => {
      //     sendEmail();
      //     console.log("Email clicked");
      //   },
      // },
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
      <MenuDialogs
        // Alert states
        showAlert1={showAlert1}
        showAlert2={showAlert2}
        showAlert3={showAlert3}
        showAlert4={showAlert4}
        showAlert6={showAlert6}
        showAlert7={showAlert7}
        showAlert8={showAlert8}
        showAlert9={showAlert9}
        showAlert10={showAlert10}
        showAlert12={showAlert12}
        // Alert setters
        setShowAlert1={setShowAlert1}
        setShowAlert2={setShowAlert2}
        setShowAlert3={setShowAlert3}
        setShowAlert4={setShowAlert4}
        setShowAlert6={setShowAlert6}
        setShowAlert7={setShowAlert7}
        setShowAlert8={setShowAlert8}
        setShowAlert9={setShowAlert9}
        setShowAlert10={setShowAlert10}
        setShowAlert12={setShowAlert12}
        // Toast states
        showToast1={showToast1}
        setShowToast1={setShowToast1}
        toastMessage={toastMessage}
        setToastMessage={setToastMessage}
        // Loading states
        isGeneratingPDF={isGeneratingPDF}
        setIsGeneratingPDF={setIsGeneratingPDF}
        isGeneratingCSV={isGeneratingCSV}
        setIsGeneratingCSV={setIsGeneratingCSV}
        isExportingAllPDF={isExportingAllPDF}
        setIsExportingAllPDF={setIsExportingAllPDF}
        isGeneratingServerPDF={isGeneratingServerPDF}
        setIsGeneratingServerPDF={setIsGeneratingServerPDF}
        // Progress messages
        pdfProgress={pdfProgress}
        exportAllProgress={exportAllProgress}
        serverPdfProgress={serverPdfProgress}
        // Data for dialogs
        selectedFile={selectedFile}
        filePassword={filePassword}
        // Handlers
        doGeneratePDF={doGeneratePDF}
        doGenerateCSV={doGenerateCSV}
        doExportAllSheetsAsPDF={doExportAllSheetsAsPDF}
        doGenerateServerPDF={doGenerateServerPDF}
        generateInvoiceFilename={generateInvoiceFilename}
        selectInputText={selectInputText}
      />
    </React.Fragment>
  );
};

export default Menu;
