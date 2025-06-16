import React, { useState } from "react";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonItem,
  IonLabel,
  IonTextarea,
  IonLoading,
  IonToast,
  IonIcon,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonProgressBar,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import {
  cloudUpload,
  document,
  checkmarkCircle,
  alertCircle,
  save,
} from "ionicons/icons";
import { useAccount } from "@starknet-react/core";
import { uploadToIPFS } from "../utils/ipfs";
import { useSaveFile } from "../hooks/useContractWrite";
import { Local, File } from "../Storage/LocalStorage";

interface SpreadsheetToIPFSProps {
  store: Local;
  selectedFile: string;
  onFileUploaded?: (ipfsHash: string) => void;
}

const SpreadsheetToIPFS: React.FC<SpreadsheetToIPFSProps> = ({
  store,
  selectedFile,
  onFileUploaded,
}) => {
  const { address, status } = useAccount();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState({
    patientName: "",
    doctorName: "",
    invoiceNumber: "",
    description: "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<"success" | "danger">("success");

  const { saveFile, isPending: isSaving } = useSaveFile();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type (images, PDFs, documents)
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        setToastMessage(
          "Please select a valid file (images, PDF, or document)"
        );
        setToastColor("danger");
        setShowToast(true);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setToastMessage("Please select a file first");
      setToastColor("danger");
      setShowToast(true);
      return;
    }

    if (status !== "connected") {
      setToastMessage("Please connect your wallet first");
      setToastColor("danger");
      setShowToast(true);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to IPFS
      const ipfsHash = await uploadMedicalInvoice(selectedFile, {
        patientName: metadata.patientName,
        doctorName: metadata.doctorName,
        invoiceNumber: metadata.invoiceNumber,
        description: metadata.description,
        date: new Date().toISOString().split("T")[0],
      });

      setUploadProgress(95);
      console.log("File uploaded to IPFS:", ipfsHash);

      // Save to blockchain
      await saveFile(ipfsHash);

      setUploadProgress(100);

      // Success
      setToastMessage("File uploaded and saved to blockchain successfully!");
      setToastColor("success");
      setShowToast(true);

      // Reset form
      setSelectedFile(null);
      setMetadata({
        patientName: "",
        doctorName: "",
        invoiceNumber: "",
        description: "",
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onFileUploaded?.(ipfsHash);
    } catch (error) {
      console.error("Upload error:", error);
      setToastMessage(error instanceof Error ? error.message : "Upload failed");
      setToastColor("danger");
      setShowToast(true);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>
            <IonIcon icon={cloudUpload} /> Upload Medical Invoice
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {/* File Selection */}
          <IonItem>
            <IonLabel position="stacked">Select File</IonLabel>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px dashed #ccc",
                borderRadius: "8px",
                marginTop: "8px",
              }}
            />
          </IonItem>

          {selectedFile && (
            <IonCard style={{ marginTop: "16px", backgroundColor: "#f8f9fa" }}>
              <IonCardContent>
                <IonGrid>
                  <IonRow>
                    <IonCol>
                      <IonIcon icon={document} color="primary" />
                      <IonText style={{ marginLeft: "8px" }}>
                        <strong>{selectedFile.name}</strong>
                      </IonText>
                    </IonCol>
                  </IonRow>
                  <IonRow>
                    <IonCol>
                      <IonText color="medium">
                        Size: {formatFileSize(selectedFile.size)}
                      </IonText>
                    </IonCol>
                    <IonCol>
                      <IonText color="medium">
                        Type: {selectedFile.type}
                      </IonText>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCardContent>
            </IonCard>
          )}

          {/* Metadata Form */}
          <div style={{ marginTop: "20px" }}>
            <IonItem>
              <IonLabel position="floating">Patient Name</IonLabel>
              <IonInput
                value={metadata.patientName}
                onIonInput={(e) =>
                  setMetadata({ ...metadata, patientName: e.detail.value! })
                }
                placeholder="Enter patient name"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="floating">Doctor Name</IonLabel>
              <IonInput
                value={metadata.doctorName}
                onIonInput={(e) =>
                  setMetadata({ ...metadata, doctorName: e.detail.value! })
                }
                placeholder="Enter doctor name"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="floating">Invoice Number</IonLabel>
              <IonInput
                value={metadata.invoiceNumber}
                onIonInput={(e) =>
                  setMetadata({ ...metadata, invoiceNumber: e.detail.value! })
                }
                placeholder="Enter invoice number"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="floating">Description</IonLabel>
              <IonTextarea
                value={metadata.description}
                onIonInput={(e) =>
                  setMetadata({ ...metadata, description: e.detail.value! })
                }
                placeholder="Enter invoice description"
                rows={3}
              />
            </IonItem>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div style={{ marginTop: "20px" }}>
              <IonText>
                <p>Uploading... {uploadProgress}%</p>
              </IonText>
              <IonProgressBar value={uploadProgress / 100} />
            </div>
          )}

          {/* Upload Button */}
          <IonButton
            expand="block"
            onClick={handleUpload}
            disabled={
              !selectedFile || isUploading || isSaving || status !== "connected"
            }
            style={{ marginTop: "20px" }}
          >
            <IonIcon icon={cloudUpload} slot="start" />
            {isUploading || isSaving ? "Uploading..." : "Upload to Blockchain"}
          </IonButton>

          {/* Connection Status */}
          {status !== "connected" && (
            <IonText color="warning">
              <p style={{ textAlign: "center", marginTop: "10px" }}>
                <IonIcon icon={alertCircle} /> Connect your wallet to upload
                files
              </p>
            </IonText>
          )}
        </IonCardContent>
      </IonCard>

      {/* Loading overlay */}
      <IonLoading
        isOpen={isUploading}
        message="Uploading to IPFS and blockchain..."
      />

      {/* Toast notification */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={4000}
        color={toastColor}
        icon={toastColor === "success" ? checkmarkCircle : alertCircle}
      />
    </>
  );
};

export default FileUpload;
