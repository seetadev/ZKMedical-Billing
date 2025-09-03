import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonLoading,
  IonList,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonBadge,
  IonAlert,
} from "@ionic/react";
import {
  arrowBack,
  save,
  wallet,
  cloud,
  shield,
  fitness,
  medical,
  heart,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { useAccount } from "@starknet-react/core";
import WalletConnection from "../components/wallet/WalletConnection";
import SubscriptionPlans from "../components/wallet/SubscriptionPlans";
import MedTokenBalance from "../components/wallet/MedTokenBalance";
import { useSaveFile } from "../hooks/useContractWrite";
import {
  useGetUserFiles,
  useGetUserSubscriptionSummary,
} from "../hooks/useContractRead";
import { uploadJSONToIPFS, getIPFSUrl } from "../utils/ipfs";
import "./HealthDataPage.css";

interface HealthRecord {
  id: string;
  type:
    | "weight"
    | "exercise"
    | "diet"
    | "medication"
    | "appointment"
    | "vitals";
  title: string;
  description: string;
  value?: string;
  unit?: string;
  date: string;
  timestamp: number;
}

const HealthDataPage: React.FC = () => {
  const history = useHistory();
  const { isDarkMode } = useTheme();
  const { address, status } = useAccount();

  // Contract hooks
  const { saveFile, isPending: isSaving, error: saveError } = useSaveFile();
  const { files, refetchFiles } = useGetUserFiles({
    accountAddress: address as `0x${string}`,
  });
  const { subscriptionSummary } = useGetUserSubscriptionSummary({
    accountAddress: address as `0x${string}`,
  });

  // Local state
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [newRecord, setNewRecord] = useState<Partial<HealthRecord>>({
    type: "weight",
    title: "",
    description: "",
    value: "",
    unit: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<
    "success" | "danger" | "warning"
  >("success");
  const [showSubscriptionAlert, setShowSubscriptionAlert] = useState(false);

  const isConnected = status === "connected" && address;

  // Load health records from local storage on component mount
  useEffect(() => {
    const savedRecords = localStorage.getItem("healthRecords");
    if (savedRecords) {
      setHealthRecords(JSON.parse(savedRecords));
    }
  }, []);

  // Save health records to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("healthRecords", JSON.stringify(healthRecords));
  }, [healthRecords]);

  const handleAddRecord = () => {
    if (!newRecord.title || !newRecord.description) {
      showToastMessage("Please fill in all required fields", "warning");
      return;
    }

    const record: HealthRecord = {
      id: Date.now().toString(),
      type: newRecord.type as HealthRecord["type"],
      title: newRecord.title,
      description: newRecord.description,
      value: newRecord.value || "",
      unit: newRecord.unit || "",
      date: newRecord.date || new Date().toISOString().split("T")[0],
      timestamp: Date.now(),
    };

    setHealthRecords((prev) => [record, ...prev]);
    setNewRecord({
      type: "weight",
      title: "",
      description: "",
      value: "",
      unit: "",
      date: new Date().toISOString().split("T")[0],
    });

    showToastMessage("Health record added successfully!", "success");
  };

  const handleSaveToBlockchain = async () => {
    if (!isConnected) {
      showToastMessage("Please connect your wallet first", "warning");
      return;
    }

    if (healthRecords.length === 0) {
      showToastMessage("No health records to save", "warning");
      return;
    }

    // Check subscription status
    if (subscriptionSummary) {
      const [filesUsed, filesAllowed] = subscriptionSummary;
      if (filesUsed >= filesAllowed) {
        setShowSubscriptionAlert(true);
        return;
      }
    }

    try {
      const fileName = `health-data-${Date.now()}`;

      // Prepare data for IPFS
      const healthData = {
        records: healthRecords,
        owner: address,
        createdAt: new Date().toISOString(),
        version: "1.0",
        metadata: {
          totalRecords: healthRecords.length,
          recordTypes: [...new Set(healthRecords.map((r) => r.type))],
          dateRange: {
            from: healthRecords[healthRecords.length - 1]?.date,
            to: healthRecords[0]?.date,
          },
        },
      };

      // Upload to IPFS
      const ipfsHash = await uploadJSONToIPFS(healthData, fileName);

      // Save to blockchain
      await saveFile(fileName, ipfsHash);

      // Refresh files list
      refetchFiles();

      showToastMessage(
        "Health data saved to blockchain successfully!",
        "success"
      );
    } catch (error: any) {
      console.error("Error saving to blockchain:", error);
      showToastMessage(
        error.message || "Failed to save to blockchain",
        "danger"
      );
    }
  };

  const showToastMessage = (
    message: string,
    color: "success" | "danger" | "warning"
  ) => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const getRecordIcon = (type: HealthRecord["type"]) => {
    switch (type) {
      case "weight":
        return fitness;
      case "exercise":
        return heart;
      case "diet":
        return fitness;
      case "medication":
        return medical;
      case "appointment":
        return medical;
      case "vitals":
        return heart;
      default:
        return medical;
    }
  };

  const getRecordColor = (type: HealthRecord["type"]) => {
    switch (type) {
      case "weight":
        return "primary";
      case "exercise":
        return "success";
      case "diet":
        return "warning";
      case "medication":
        return "danger";
      case "appointment":
        return "secondary";
      case "vitals":
        return "tertiary";
      default:
        return "medium";
    }
  };

  return (
    <IonPage className={isDarkMode ? "dark-theme" : ""}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>Health Data</IonTitle>
          <IonButtons slot="end">
            <WalletConnection />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="health-data-content">
        {/* Wallet Status & Subscription Info */}
        {isConnected && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Blockchain Status</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol size="12" sizeMd="4">
                    <MedTokenBalance />
                  </IonCol>
                  <IonCol size="12" sizeMd="4">
                    <div className="subscription-info">
                      <IonLabel>
                        <h3>Files Stored</h3>
                        <p>{files?.length || 0} files on blockchain</p>
                      </IonLabel>
                    </div>
                  </IonCol>
                  <IonCol size="12" sizeMd="4">
                    {subscriptionSummary && (
                      <div className="subscription-limits">
                        <IonLabel>
                          <h3>Storage Limit</h3>
                          <p>
                            {subscriptionSummary[0].toString()}/
                            {subscriptionSummary[1].toString()} used
                          </p>
                        </IonLabel>
                      </div>
                    )}
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        )}

        {/* Add New Health Record */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Add Health Record</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Type</IonLabel>
                <IonSelect
                  value={newRecord.type}
                  onIonChange={(e) =>
                    setNewRecord((prev) => ({ ...prev, type: e.detail.value }))
                  }
                >
                  <IonSelectOption value="weight">Weight</IonSelectOption>
                  <IonSelectOption value="exercise">Exercise</IonSelectOption>
                  <IonSelectOption value="diet">Diet</IonSelectOption>
                  <IonSelectOption value="medication">
                    Medication
                  </IonSelectOption>
                  <IonSelectOption value="appointment">
                    Appointment
                  </IonSelectOption>
                  <IonSelectOption value="vitals">Vitals</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Title *</IonLabel>
                <IonInput
                  value={newRecord.title}
                  onIonInput={(e) =>
                    setNewRecord((prev) => ({
                      ...prev,
                      title: e.detail.value!,
                    }))
                  }
                  placeholder="Enter title"
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Description *</IonLabel>
                <IonTextarea
                  value={newRecord.description}
                  onIonInput={(e) =>
                    setNewRecord((prev) => ({
                      ...prev,
                      description: e.detail.value!,
                    }))
                  }
                  placeholder="Enter description"
                  rows={3}
                />
              </IonItem>

              <IonRow>
                <IonCol size="8">
                  <IonItem>
                    <IonLabel position="stacked">Value</IonLabel>
                    <IonInput
                      value={newRecord.value}
                      onIonInput={(e) =>
                        setNewRecord((prev) => ({
                          ...prev,
                          value: e.detail.value!,
                        }))
                      }
                      placeholder="Enter value"
                    />
                  </IonItem>
                </IonCol>
                <IonCol size="4">
                  <IonItem>
                    <IonLabel position="stacked">Unit</IonLabel>
                    <IonInput
                      value={newRecord.unit}
                      onIonInput={(e) =>
                        setNewRecord((prev) => ({
                          ...prev,
                          unit: e.detail.value!,
                        }))
                      }
                      placeholder="kg, cm, etc."
                    />
                  </IonItem>
                </IonCol>
              </IonRow>

              <IonItem>
                <IonLabel position="stacked">Date</IonLabel>
                <IonInput
                  type="date"
                  value={newRecord.date}
                  onIonInput={(e) =>
                    setNewRecord((prev) => ({ ...prev, date: e.detail.value! }))
                  }
                />
              </IonItem>
            </IonList>

            <IonButton
              expand="block"
              onClick={handleAddRecord}
              style={{ marginTop: "16px" }}
            >
              <IonIcon icon={save} slot="start" />
              Add Record
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* Health Records List */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              Health Records ({healthRecords.length})
              {healthRecords.length > 0 && (
                <IonButton
                  fill="outline"
                  size="small"
                  onClick={handleSaveToBlockchain}
                  disabled={!isConnected || isSaving}
                  style={{ float: "right" }}
                >
                  {isSaving ? (
                    "Saving..."
                  ) : (
                    <>
                      <IonIcon icon={cloud} slot="start" />
                      Save to Blockchain
                    </>
                  )}
                </IonButton>
              )}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {healthRecords.length === 0 ? (
              <div className="empty-state">
                <IonIcon icon={medical} size="large" />
                <p>No health records yet. Add your first record above!</p>
              </div>
            ) : (
              <IonList>
                {healthRecords.map((record) => (
                  <IonItem key={record.id} className="health-record-item">
                    <IonIcon
                      icon={getRecordIcon(record.type)}
                      color={getRecordColor(record.type)}
                      slot="start"
                    />
                    <IonLabel>
                      <h2>{record.title}</h2>
                      <p>{record.description}</p>
                      {record.value && (
                        <p>
                          <strong>{record.value}</strong>
                          {record.unit && ` ${record.unit}`}
                        </p>
                      )}
                      <p className="record-date">{record.date}</p>
                    </IonLabel>
                    <IonChip color={getRecordColor(record.type)} slot="end">
                      {record.type}
                    </IonChip>
                  </IonItem>
                ))}
              </IonList>
            )}
          </IonCardContent>
        </IonCard>

        {/* Blockchain Files */}
        {isConnected && files && files.length > 0 && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Blockchain Files</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {files.map((file, index) => (
                  <IonItem key={index}>
                    <IonIcon icon={shield} color="success" slot="start" />
                    <IonLabel>
                      <h3>{file.file_name}</h3>
                      <p>IPFS: {file.ipfs_cid.substring(0, 20)}...</p>
                      <p>
                        Stored:{" "}
                        {new Date(
                          Number(file.timestamp) * 1000
                        ).toLocaleDateString()}
                      </p>
                    </IonLabel>
                    <IonButton
                      fill="outline"
                      size="small"
                      href={getIPFSUrl(file.ipfs_cid)}
                      target="_blank"
                    >
                      View
                    </IonButton>
                  </IonItem>
                ))}
              </IonList>
            </IonCardContent>
          </IonCard>
        )}

        {/* Subscription Plans for non-connected users */}
        {!isConnected && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                Connect Wallet for Blockchain Features
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>
                Connect your wallet to save health data to the blockchain with:
              </p>
              <ul>
                <li>Decentralized storage via IPFS</li>
                <li>Secure, immutable records</li>
                <li>Subscription-based access</li>
                <li>Token-powered ecosystem</li>
              </ul>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>

      {/* Loading overlay */}
      <IonLoading isOpen={isSaving} message="Saving to blockchain..." />

      {/* Toast messages */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color={toastColor}
        position="top"
      />

      {/* Subscription limit alert */}
      <IonAlert
        isOpen={showSubscriptionAlert}
        onDidDismiss={() => setShowSubscriptionAlert(false)}
        header="Storage Limit Reached"
        message="You've reached your file storage limit. Please upgrade your subscription to continue saving files to the blockchain."
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "View Plans",
            handler: () => {
              // Here you could navigate to subscription plans or show them in a modal
            },
          },
        ]}
      />
    </IonPage>
  );
};

export default HealthDataPage;
