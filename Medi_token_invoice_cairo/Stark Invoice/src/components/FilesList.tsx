import React, { useState, useEffect } from "react";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonText,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonSpinner,
  IonToast,
} from "@ionic/react";
import {
  document,
  eye,
  download,
  time,
  refresh,
  close,
  alertCircle,
  folderOpen,
} from "ionicons/icons";
import { useAccount } from "@starknet-react/core";
import { useGetUserFiles } from "../hooks/useContractRead";
import { getFileFromIPFS, getIPFSUrl } from "../utils/ipfs";

interface FileData {
  fileHash: string;
  filename: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  patientName?: string;
  doctorName?: string;
  invoiceNumber?: string;
  description?: string;
}

const FilesList: React.FC = () => {
  const { address } = useAccount();
  const { files, isLoading, isError, error, refetchFiles } = useGetUserFiles({
    accountAddress: address,
  });

  const [filesData, setFilesData] = useState<FileData[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Load file metadata from IPFS
  useEffect(() => {
    const loadFilesMetadata = async () => {
      if (!files || files.length === 0) {
        setFilesData([]);
        return;
      }

      setLoadingFiles(true);
      const fileDataPromises = files.map(async (ipfsHash: string) => {
        try {
          const metadata = await getFileFromIPFS(ipfsHash);
          return { ...metadata, metadataHash: ipfsHash } as FileData;
        } catch (error) {
          console.error(`Error loading metadata for ${ipfsHash}:`, error);
          return {
            fileHash: ipfsHash,
            filename: "Unknown file",
            fileSize: 0,
            fileType: "unknown",
            uploadedAt: new Date().toISOString(),
            metadataHash: ipfsHash,
          } as FileData;
        }
      });

      try {
        const resolvedFiles = await Promise.all(fileDataPromises);
        setFilesData(resolvedFiles);
      } catch (error) {
        console.error("Error loading files metadata:", error);
        setToastMessage("Error loading files metadata");
        setShowToast(true);
      } finally {
        setLoadingFiles(false);
      }
    };

    loadFilesMetadata();
  }, [files]);

  const handleRefresh = async (event: CustomEvent) => {
    await refetchFiles();
    event.detail.complete();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Unknown date";
    }
  };

  const handleViewFile = (file: FileData) => {
    setSelectedFile(file);
    setShowModal(true);
  };

  const handleDownloadFile = async (file: FileData) => {
    try {
      const url = getIPFSUrl(file.fileHash);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error downloading file:", error);
      setToastMessage("Error downloading file");
      setShowToast(true);
    }
  };

  if (!address) {
    return (
      <IonCard>
        <IonCardContent>
          <IonText color="medium">
            <p style={{ textAlign: "center", padding: "20px" }}>
              <IonIcon icon={alertCircle} size="large" />
              <br />
              Connect your wallet to view your files
            </p>
          </IonText>
        </IonCardContent>
      </IonCard>
    );
  }

  if (isError) {
    return (
      <IonCard>
        <IonCardContent>
          <IonText color="danger">
            <p style={{ textAlign: "center", padding: "20px" }}>
              <IonIcon icon={alertCircle} size="large" />
              <br />
              Error loading files: {error?.message || "Unknown error"}
            </p>
          </IonText>
          <IonButton
            expand="block"
            fill="outline"
            onClick={() => refetchFiles()}
          >
            <IonIcon icon={refresh} slot="start" />
            Try Again
          </IonButton>
        </IonCardContent>
      </IonCard>
    );
  }

  return (
    <>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>
            <IonIcon icon={folderOpen} /> Your Medical Files
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent />
          </IonRefresher>

          {isLoading || loadingFiles ? (
            <div>
              {[1, 2, 3].map((i) => (
                <IonItem key={i}>
                  <IonIcon icon={document} slot="start" />
                  <IonLabel>
                    <IonSkeletonText animated style={{ width: "60%" }} />
                    <IonSkeletonText animated style={{ width: "40%" }} />
                  </IonLabel>
                </IonItem>
              ))}
            </div>
          ) : filesData.length === 0 ? (
            <IonText color="medium">
              <p style={{ textAlign: "center", padding: "40px" }}>
                <IonIcon icon={folderOpen} size="large" />
                <br />
                No files uploaded yet
                <br />
                <small>Upload your first medical invoice to get started</small>
              </p>
            </IonText>
          ) : (
            <IonList>
              {filesData.map((file, index) => (
                <IonItem key={index}>
                  <IonIcon icon={document} slot="start" color="primary" />
                  <IonLabel>
                    <h3>{file.filename}</h3>
                    <p>
                      {file.patientName && `Patient: ${file.patientName} • `}
                      Size: {formatFileSize(file.fileSize)} • Date:{" "}
                      {formatDate(file.uploadedAt)}
                    </p>
                    {file.invoiceNumber && <p>Invoice: {file.invoiceNumber}</p>}
                  </IonLabel>
                  <IonButtons slot="end">
                    <IonButton
                      fill="clear"
                      onClick={() => handleViewFile(file)}
                    >
                      <IonIcon icon={eye} />
                    </IonButton>
                    <IonButton
                      fill="clear"
                      onClick={() => handleDownloadFile(file)}
                    >
                      <IonIcon icon={download} />
                    </IonButton>
                  </IonButtons>
                </IonItem>
              ))}
            </IonList>
          )}

          {filesData.length > 0 && (
            <IonButton
              expand="block"
              fill="outline"
              onClick={() => refetchFiles()}
              style={{ marginTop: "16px" }}
            >
              <IonIcon icon={refresh} slot="start" />
              Refresh Files
            </IonButton>
          )}
        </IonCardContent>
      </IonCard>

      {/* File Details Modal */}
      <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>File Details</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowModal(false)}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {selectedFile && (
            <div style={{ padding: "20px" }}>
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>{selectedFile.filename}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList>
                    <IonItem>
                      <IonLabel>
                        <h3>File Type</h3>
                        <p>{selectedFile.fileType}</p>
                      </IonLabel>
                    </IonItem>
                    <IonItem>
                      <IonLabel>
                        <h3>File Size</h3>
                        <p>{formatFileSize(selectedFile.fileSize)}</p>
                      </IonLabel>
                    </IonItem>
                    <IonItem>
                      <IonLabel>
                        <h3>Upload Date</h3>
                        <p>{formatDate(selectedFile.uploadedAt)}</p>
                      </IonLabel>
                    </IonItem>
                    {selectedFile.patientName && (
                      <IonItem>
                        <IonLabel>
                          <h3>Patient Name</h3>
                          <p>{selectedFile.patientName}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                    {selectedFile.doctorName && (
                      <IonItem>
                        <IonLabel>
                          <h3>Doctor Name</h3>
                          <p>{selectedFile.doctorName}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                    {selectedFile.invoiceNumber && (
                      <IonItem>
                        <IonLabel>
                          <h3>Invoice Number</h3>
                          <p>{selectedFile.invoiceNumber}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                    {selectedFile.description && (
                      <IonItem>
                        <IonLabel>
                          <h3>Description</h3>
                          <p>{selectedFile.description}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                  </IonList>

                  <IonButton
                    expand="block"
                    onClick={() => handleDownloadFile(selectedFile)}
                    style={{ marginTop: "20px" }}
                  >
                    <IonIcon icon={download} slot="start" />
                    View/Download File
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </div>
          )}
        </IonContent>
      </IonModal>

      {/* Toast */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color="danger"
      />
    </>
  );
};

export default FilesList;
