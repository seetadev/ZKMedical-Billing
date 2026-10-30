import React, { useState, useEffect } from "react";
import {
  IonModal,
  IonContent,
  IonIcon,
  IonToast,
  IonSpinner,
} from "@ionic/react";
import {
  closeOutline,
  cloudOutline,
  copyOutline,
  openOutline,
  trashOutline,
} from "ionicons/icons";
import { getStorage } from "../services/storage";
import "./IpfsCloudModal.css";

interface IpfsCloudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: (fileName: string) => void;
}

interface PinnedHistoryItem {
  cid: string;
  name: string;
  date?: string;
}

export const IpfsCloudModal: React.FC<IpfsCloudModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  // Cloud Files State
  const [historyList, setHistoryList] = useState<PinnedHistoryItem[]>([]);
  const [importCid, setImportCid] = useState("");
  const [importing, setImporting] = useState(false);

  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<"success" | "warning" | "danger" | "primary">("primary");

  // Load history on open
  useEffect(() => {
    if (isOpen) loadHistory();
  }, [isOpen]);

  const loadHistory = () => {
    try {
      const historyStr = localStorage.getItem("ipfs_pinned_history") || "[]";
      const history: PinnedHistoryItem[] = JSON.parse(historyStr);
      // Sort: newest first if date exists
      setHistoryList(history);
    } catch (e) {
      console.warn("Failed to load IPFS history:", e);
      setHistoryList([]);
    }
  };

  const showToastNotification = (msg: string, color: "success" | "warning" | "danger" | "primary" = "primary") => {
    setToastMessage(msg);
    setToastColor(color);
    setShowToast(true);
  };

  // Load Action
  const handleLoadByCid = async (cidToImport: string) => {
    const cid = cidToImport.trim();
    if (!cid) {
      showToastNotification("Please enter a valid CID", "warning");
      return;
    }

    setImporting(true);
    showToastNotification("Fetching file from IPFS...", "primary");

    try {
      const { data } = await getStorage((msg) => showToastNotification(msg, "warning")).load(cid);
      const invoiceData = JSON.parse(new TextDecoder().decode(data));
      if (!invoiceData || typeof invoiceData !== "object" || !invoiceData.content) {
        throw new Error("Retrieved data is not a valid file.");
      }
      
      // Save data directly to temporary localStorage key
      localStorage.setItem("ipfs_temp_invoice_content", JSON.stringify(invoiceData));

      // Append/prepend to IPFS pinned history list if it's not already in there!
      const historyStr = localStorage.getItem("ipfs_pinned_history") || "[]";
      let history: PinnedHistoryItem[] = JSON.parse(historyStr);
      if (!history.some(item => item.cid === cid)) {
        history = [
          {
            cid,
            name: invoiceData.name || "Imported File",
            date: new Date().toLocaleString(),
          },
          ...history,
        ];
        localStorage.setItem("ipfs_pinned_history", JSON.stringify(history));
      }

      showToastNotification(`Successfully loaded file from IPFS!`, "success");
      setImportCid("");
      
      // Force navigation to the editor page with "invoice" filename
      window.location.href = "/app/tabs/home/invoice";

      onClose();
    } catch (e: any) {
      console.error("IPFS Load Error:", e);
      showToastNotification(`Load failed: ${e.message || "check the CID, provider and passphrase"}`, "danger");
    } finally {
      setImporting(false);
    }
  };

  // Helper actions for history items
  const handleCopyCid = (cid: string) => {
    navigator.clipboard.writeText(cid);
    showToastNotification("CID copied to clipboard!", "success");
  };

  const handleRemoveFromHistory = (cid: string) => {
    try {
      const updated = historyList.filter((item) => item.cid !== cid);
      localStorage.setItem("ipfs_pinned_history", JSON.stringify(updated));
      setHistoryList(updated);
      showToastNotification("Removed from local history list.", "primary");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      className="ipfs-cloud-modal"
      initialBreakpoint={0.92}
      breakpoints={[0, 0.5, 0.92]}
      handle={true}
    >
      {/* Header */}
      <div className="ipfs-modal-header">
        <div className="ipfs-modal-header-top">
          <div className="ipfs-modal-header-left">
            <div className="ipfs-modal-header-icon-wrap">
              <IonIcon icon={cloudOutline} />
            </div>
            <span className="ipfs-modal-header-text">IPFS Cloud Manager</span>
          </div>
          <button className="ipfs-modal-close-btn" onClick={onClose} aria-label="Close">
            <IonIcon icon={closeOutline} />
          </button>
        </div>
      </div>

      <IonContent className="ipfs-modal-content">
        <div className="ipfs-modal-body">
            {/* Load CID Section */}
            <div className="ipfs-card">
              <div className="ipfs-card-label">Load File via CID</div>
              <p className="ipfs-card-desc">
                Paste a CID to retrieve and open a file in the editor. The provider and passphrase are set in Settings → Cloud Storage.
              </p>
              <div className="ipfs-cid-input-row">
                <input
                  type="text"
                  placeholder="Qm... or bafy..."
                  value={importCid}
                  onChange={(e) => setImportCid(e.target.value)}
                  disabled={importing}
                  className="ipfs-input"
                />
                <button
                  className="ipfs-load-cid-btn"
                  onClick={() => handleLoadByCid(importCid)}
                  disabled={importing || !importCid.trim()}
                >
                  {importing ? (
                    <IonSpinner name="crescent" style={{ width: 18, height: 18, color: "#fff" }} />
                  ) : (
                    <>
                      <IonIcon icon={openOutline} />
                      Load
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* History */}
            <div className="ipfs-history-header">
              <span className="ipfs-history-label">Cloud Backup History</span>
              <span className="ipfs-history-count">{historyList.length}</span>
            </div>

            {historyList.length === 0 ? (
              <div className="ipfs-empty">
                <div className="ipfs-empty-circle">
                  <IonIcon icon={cloudOutline} />
                </div>
                <div className="ipfs-empty-title">No Pinned Files</div>
                <div className="ipfs-empty-sub">
                  Files you upload to IPFS will appear here.
                </div>
              </div>
            ) : (
              <div className="ipfs-history-list">
                {historyList.map((item, index) => (
                  <div key={item.cid + index} className="ipfs-history-item">
                    <div className="ipfs-history-item-top">
                      <div className="ipfs-history-item-info">
                        <div className="ipfs-history-item-name">
                          {item.name || "Unnamed File"}
                        </div>
                        {item.date && (
                          <div className="ipfs-history-item-date">{item.date}</div>
                        )}
                      </div>
                      <div className="ipfs-history-item-actions">
                        <button className="ipfs-icon-btn" onClick={() => handleCopyCid(item.cid)} title="Copy CID">
                          <IonIcon icon={copyOutline} />
                        </button>
                        <button className="ipfs-icon-btn primary" onClick={() => handleLoadByCid(item.cid)} title="Load">
                          <IonIcon icon={openOutline} />
                        </button>
                        <button className="ipfs-icon-btn danger" onClick={() => handleRemoveFromHistory(item.cid)} title="Remove">
                          <IonIcon icon={trashOutline} />
                        </button>
                      </div>
                    </div>
                    <div className="ipfs-history-item-cid">{item.cid}</div>
                  </div>
                ))}
              </div>
            )}
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          color={toastColor}
          duration={2500}
          position="bottom"
        />
      </IonContent>
    </IonModal>
  );
};
