import React, { useState, useEffect } from "react";
import { useAccount } from "@starknet-react/core";
import { IonButton, IonItem, IonLabel, IonList, IonAlert } from "@ionic/react";
import { useGetUserFiles } from "../hooks/useContractRead";
import { downloadFromIPFS } from "../utils/ipfs";

interface SpreadsheetFromIPFSProps {
  onDataLoaded?: (data: any) => void;
  className?: string;
}

const SpreadsheetFromIPFS: React.FC<SpreadsheetFromIPFSProps> = ({
  onDataLoaded,
  className = "",
}) => {
  const { account } = useAccount();
  const [filesList, setFilesList] = useState<string[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { files: userFiles, refetchFiles: refetchFiles } = useGetUserFiles({
    accountAddress: account?.address as `0x${string}` | undefined,
  });

  useEffect(() => {
    if (userFiles && Array.isArray(userFiles)) {
      setFilesList(userFiles);
    }
  }, [userFiles]);

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setIsAlertOpen(true);
  };

  const handleLoadSpreadsheet = async (ipfsHash: string) => {
    if (!ipfsHash) {
      showAlert("Invalid file: No IPFS hash found");
      return;
    }

    setLoading(true);
    try {
      // Download JSON data from IPFS
      const jsonData = await downloadFromIPFS(ipfsHash);

      if (!jsonData) {
        throw new Error("Failed to download file from IPFS");
      }

      // Parse the JSON data
      let spreadsheetData;
      try {
        spreadsheetData =
          typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
      } catch (parseError) {
        throw new Error("Failed to parse spreadsheet data");
      }

      // Validate that it contains SocialCalc data
      if (!spreadsheetData.sheet || !spreadsheetData.sheet.cells) {
        throw new Error(
          "Invalid spreadsheet format: Missing required SocialCalc data"
        );
      }

      // For now, just notify the parent component
      if (onDataLoaded) {
        onDataLoaded(spreadsheetData);
      }

      showAlert(`Successfully loaded spreadsheet from IPFS`);
    } catch (error) {
      console.error("Error loading spreadsheet:", error);
      showAlert(
        `Failed to load spreadsheet: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshFiles = () => {
    refetchFiles();
  };

  if (!account) {
    return (
      <div className={className}>
        <p>Connect your wallet to view saved spreadsheets</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <h3>Load Spreadsheet from Blockchain</h3>
        <IonButton
          fill="outline"
          size="small"
          onClick={refreshFiles}
          disabled={loading}
        >
          Refresh
        </IonButton>
      </div>

      {filesList.length === 0 ? (
        <p>No spreadsheets found. Save a spreadsheet first to see it here.</p>
      ) : (
        <IonList>
          {filesList.map((ipfsHash, index) => (
            <IonItem key={index}>
              <IonLabel>
                <h3>Spreadsheet {index + 1}</h3>
                <p>IPFS: {ipfsHash.substring(0, 20)}...</p>
              </IonLabel>
              <IonButton
                slot="end"
                fill="outline"
                onClick={() => handleLoadSpreadsheet(ipfsHash)}
                disabled={loading}
              >
                {loading ? "Loading..." : "Load"}
              </IonButton>
            </IonItem>
          ))}
        </IonList>
      )}

      <IonAlert
        isOpen={isAlertOpen}
        onDidDismiss={() => setIsAlertOpen(false)}
        header="Load Spreadsheet"
        message={alertMessage}
        buttons={["OK"]}
      />
    </div>
  );
};

export default SpreadsheetFromIPFS;
