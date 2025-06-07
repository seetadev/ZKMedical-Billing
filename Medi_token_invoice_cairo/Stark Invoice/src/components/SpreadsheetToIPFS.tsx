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
  IonList,
} from "@ionic/react";
import {
  cloudUpload,
  document,
  checkmarkCircle,
  alertCircle,
  save,
} from "ionicons/icons";
import { useAccount } from "@starknet-react/core";
import { uploadFileToIPFS } from "../utils/ipfs";
import { useSaveFile } from "../hooks/useContractWrite";
import { Local, File as LocalFile } from "../components/Storage/LocalStorage";

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

  const [metadata, setMetadata] = useState({
    title: "",
    description: "",
    tags: "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<"success" | "danger">("success");

  const { saveFile, isPending: isSaving } = useSaveFile();

  const handleUploadToIPFS = async () => {
    if (status !== "connected") {
      setToastMessage("Please connect your wallet first");
      setToastColor("danger");
      setShowToast(true);
      return;
    }

    if (!selectedFile || selectedFile === "default") {
      setToastMessage("Please select a spreadsheet file to upload");
      setToastColor("danger");
      setShowToast(true);
      return;
    }

    if (!metadata.title.trim()) {
      setToastMessage("Please provide a title for your spreadsheet");
      setToastColor("danger");
      setShowToast(true);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Get the spreadsheet data from localStorage
      const fileData = await store._getFile(selectedFile);

      if (!fileData) {
        throw new Error("Could not retrieve spreadsheet data");
      }

      setUploadProgress(25);

      // Create a comprehensive data object for IPFS
      const ipfsData = {
        name: selectedFile,
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        created: fileData.created,
        modified: fileData.modified,
        billType: fileData.billType,
        content: fileData.content,
        uploadedBy: address,
        uploadedAt: new Date().toISOString(),
        version: "1.0",
        type: "socialcalc-spreadsheet",
      };

      setUploadProgress(50);

      // Convert to JSON and create a blob for upload
      const jsonData = JSON.stringify(ipfsData, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const file = new File([blob], `${selectedFile}.json`, {
        type: "application/json",
      });

      setUploadProgress(75);

      // Upload to IPFS
      const ipfsHash = await uploadFileToIPFS(file);

      if (!ipfsHash) {
        throw new Error("Failed to upload to IPFS");
      }

      setUploadProgress(90);

      // Save to blockchain
      await saveFile({
        fileName: selectedFile,
        ipfsHash: ipfsHash,
        metadata: {
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags,
          fileType: "spreadsheet",
          uploadedAt: new Date().toISOString(),
        },
      });

      setUploadProgress(100);

      console.log("Spreadsheet uploaded to IPFS:", ipfsHash);
      setToastMessage("Spreadsheet successfully saved to blockchain!");
      setToastColor("success");
      setShowToast(true);

      // Reset form
      setMetadata({
        title: "",
        description: "",
        tags: "",
      });

      onFileUploaded?.(ipfsHash);
    } catch (error) {
      console.error("Error uploading spreadsheet:", error);
      setToastMessage(
        error instanceof Error ? error.message : "Failed to upload spreadsheet"
      );
      setToastColor("danger");
      setShowToast(true);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const isWalletConnected = status === "connected";
  const hasSelectedFile = selectedFile && selectedFile !== "default";

  return (
    <>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle className="ion-text-center">
            <IonIcon
              icon={cloudUpload}
              color={isWalletConnected ? "primary" : "medium"}
              size="large"
            />
            <div style={{ marginTop: "8px" }}>Save to Blockchain</div>
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {!isWalletConnected ? (
            <div className="ion-text-center">
              <IonText color="medium">
                <p>Connect your wallet to save spreadsheets to blockchain</p>
              </IonText>
            </div>
          ) : !hasSelectedFile ? (
            <div className="ion-text-center">
              <IonText color="medium">
                <p>Select a spreadsheet file to save to blockchain</p>
              </IonText>
            </div>
          ) : (
            <>
              <IonList>
                <IonItem>
                  <IonIcon icon={document} slot="start" color="primary" />
                  <IonLabel>
                    <h3>Selected Spreadsheet</h3>
                    <p>{selectedFile}</p>
                  </IonLabel>
                </IonItem>
              </IonList>

              <IonGrid>
                <IonRow>
                  <IonCol size="12">
                    <IonItem>
                      <IonLabel position="stacked">
                        Title <span style={{ color: "red" }}>*</span>
                      </IonLabel>
                      <IonInput
                        value={metadata.title}
                        placeholder="Enter spreadsheet title"
                        onIonInput={(e) =>
                          setMetadata({ ...metadata, title: e.detail.value! })
                        }
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol size="12">
                    <IonItem>
                      <IonLabel position="stacked">Description</IonLabel>
                      <IonTextarea
                        value={metadata.description}
                        placeholder="Brief description of the spreadsheet"
                        rows={3}
                        onIonInput={(e) =>
                          setMetadata({
                            ...metadata,
                            description: e.detail.value!,
                          })
                        }
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol size="12">
                    <IonItem>
                      <IonLabel position="stacked">Tags</IonLabel>
                      <IonInput
                        value={metadata.tags}
                        placeholder="invoice, medical, billing (comma-separated)"
                        onIonInput={(e) =>
                          setMetadata({ ...metadata, tags: e.detail.value! })
                        }
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>

                {isUploading && (
                  <IonRow>
                    <IonCol size="12">
                      <IonText>
                        <p className="ion-text-center">
                          Uploading to blockchain... {uploadProgress}%
                        </p>
                      </IonText>
                      <IonProgressBar
                        value={uploadProgress / 100}
                        color="primary"
                      />
                    </IonCol>
                  </IonRow>
                )}

                <IonRow>
                  <IonCol size="12">
                    <IonButton
                      expand="block"
                      onClick={handleUploadToIPFS}
                      disabled={
                        !metadata.title.trim() || isUploading || isSaving
                      }
                      color="primary"
                    >
                      <IonIcon icon={save} slot="start" />
                      {isUploading || isSaving
                        ? "Saving to Blockchain..."
                        : "Save to Blockchain"}
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </>
          )}
        </IonCardContent>
      </IonCard>

      <IonLoading
        isOpen={isUploading || isSaving}
        message={
          isUploading
            ? "Uploading spreadsheet to IPFS..."
            : "Saving to blockchain..."
        }
      />

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color={toastColor}
        position="top"
      />
    </>
  );
};

export default SpreadsheetToIPFS;
