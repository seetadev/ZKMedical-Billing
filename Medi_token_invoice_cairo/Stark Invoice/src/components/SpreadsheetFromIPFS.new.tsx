import React, { useState } from "react";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonText,
  IonLoading,
  IonToast,
  IonChip,
  IonGrid,
  IonRow,
  IonCol,
  IonRefresher,
  IonRefresherContent,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from "@ionic/react";
import {
  download,
  document,
  time,
  person,
  pricetag,
  refresh,
  cloudDownload,
  trash,
} from "ionicons/icons";
import { useAccount } from "@starknet-react/core";
import { downloadFromIPFS } from "../utils/ipfs";
import { useGetUserFiles } from "../hooks/useContractRead";
import { Local, File as LocalFile } from "./Storage/LocalStorage";

interface SpreadsheetFromIPFSProps {
  store: Local;
  onFileLoaded?: (fileName: string) => void;
  updateSelectedFile?: (fileName: string) => void;
}

interface BlockchainFile {
  fileName: string;
  ipfsHash: string;
  metadata: {
    title: string;
    description: string;
    tags: string;
    fileType: string;
    uploadedAt: string;
  };
}

const SpreadsheetFromIPFS: React.FC<SpreadsheetFromIPFSProps> = ({
  store,
  onFileLoaded,
  updateSelectedFile,
}) => {
  const { address, status } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<"success" | "danger">("success");

  const {
    files: blockchainFiles,
    isLoading: filesLoading,
    refetchFiles,
  } = useGetUserFiles({
    accountAddress: address,
  });

  const handleDownloadFromIPFS = async (file: BlockchainFile) => {
    try {
      setIsLoading(true);

      // Download from IPFS
      const ipfsData = await downloadFromIPFS(file.ipfsHash);

      if (!ipfsData) {
        throw new Error("Failed to download from IPFS");
      }

      // Parse the downloaded data
      const spreadsheetData = JSON.parse(ipfsData);

      // Create a LocalFile object for local storage
      const localFile = new LocalFile(
        spreadsheetData.created || new Date().toISOString(),
        new Date().toISOString(), // Update modified time
        spreadsheetData.content,
        spreadsheetData.name || file.fileName,
        spreadsheetData.billType || 1
      );

      // Save to local storage
      await store._saveFile(localFile);

      setToastMessage(
        `Spreadsheet "${file.metadata.title}" loaded successfully!`
      );
      setToastColor("success");
      setShowToast(true);

      // Notify parent components
      onFileLoaded?.(localFile.name);
      updateSelectedFile?.(localFile.name);
    } catch (error) {
      console.error("Error downloading spreadsheet:", error);
      setToastMessage(
        error instanceof Error
          ? error.message
          : "Failed to download spreadsheet"
      );
      setToastColor("danger");
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const formatTags = (tags: string) => {
    if (!tags) return [];
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
  };

  const handleRefresh = async (event: CustomEvent) => {
    await refetchFiles();
    event.detail.complete();
  };

  const isWalletConnected = status === "connected";

  return (
    <>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle className="ion-text-center">
            <IonIcon
              icon={cloudDownload}
              color={isWalletConnected ? "primary" : "medium"}
              size="large"
            />
            <div style={{ marginTop: "8px" }}>Load from Blockchain</div>
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {!isWalletConnected ? (
            <div className="ion-text-center">
              <IonText color="medium">
                <p>
                  Connect your wallet to access your blockchain spreadsheets
                </p>
              </IonText>
            </div>
          ) : (
            <>
              <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                <IonRefresherContent></IonRefresherContent>
              </IonRefresher>

              {filesLoading ? (
                <div className="ion-text-center">
                  <IonText color="medium">
                    <p>Loading your spreadsheets...</p>
                  </IonText>
                </div>
              ) : !blockchainFiles || blockchainFiles.length === 0 ? (
                <div className="ion-text-center">
                  <IonText color="medium">
                    <p>No spreadsheets found on blockchain</p>
                    <p>Save a spreadsheet first to see it here</p>
                  </IonText>
                </div>
              ) : (
                <IonList>
                  {blockchainFiles.map((file, index) => (
                    <IonItemSliding key={`${file.ipfsHash}-${index}`}>
                      <IonItem>
                        <IonIcon icon={document} slot="start" color="primary" />
                        <IonLabel>
                          <h2>{file.metadata.title || file.fileName}</h2>
                          <p>{file.metadata.description || "No description"}</p>
                          <div style={{ marginTop: "8px" }}>
                            <IonGrid>
                              <IonRow>
                                <IonCol size="auto">
                                  <IonChip outline color="medium">
                                    <IonIcon icon={time} />
                                    <IonLabel>
                                      {formatDate(file.metadata.uploadedAt)}
                                    </IonLabel>
                                  </IonChip>
                                </IonCol>
                                <IonCol size="auto">
                                  <IonChip outline color="primary">
                                    <IonIcon icon={document} />
                                    <IonLabel>
                                      {file.metadata.fileType}
                                    </IonLabel>
                                  </IonChip>
                                </IonCol>
                              </IonRow>
                              {file.metadata.tags && (
                                <IonRow>
                                  <IonCol size="12">
                                    {formatTags(file.metadata.tags).map(
                                      (tag, tagIndex) => (
                                        <IonChip
                                          key={tagIndex}
                                          outline
                                          color="secondary"
                                          style={{
                                            marginRight: "4px",
                                            marginBottom: "4px",
                                          }}
                                        >
                                          <IonIcon icon={pricetag} />
                                          <IonLabel>{tag}</IonLabel>
                                        </IonChip>
                                      )
                                    )}
                                  </IonCol>
                                </IonRow>
                              )}
                            </IonGrid>
                          </div>
                        </IonLabel>
                        <IonButton
                          fill="outline"
                          slot="end"
                          onClick={() => handleDownloadFromIPFS(file)}
                          disabled={isLoading}
                        >
                          <IonIcon icon={download} />
                        </IonButton>
                      </IonItem>
                      <IonItemOptions side="end">
                        <IonItemOption
                          color="primary"
                          onClick={() => handleDownloadFromIPFS(file)}
                        >
                          <IonIcon icon={download} />
                          Load
                        </IonItemOption>
                      </IonItemOptions>
                    </IonItemSliding>
                  ))}
                </IonList>
              )}
            </>
          )}
        </IonCardContent>
      </IonCard>

      <IonLoading
        isOpen={isLoading}
        message="Downloading spreadsheet from blockchain..."
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

export default SpreadsheetFromIPFS;
