import React, { useState } from "react";
import { IonButton, IonInput, IonSelect, IonSelectOption, IonToast } from "@ionic/react";
import { getSettings, saveSettings } from "../utils/settings";
import {
  ProviderId,
  getStorage,
  hasVerifier,
  getPassphrase,
  setPassphrase,
  unlockPassphrase,
} from "../services/storage";

const PROVIDERS: { value: ProviderId; label: string }[] = [
  { value: "helia", label: "Helia (via Tornado)" },
  { value: "s3", label: "S3 (via Tornado)" },
];

export const StorageSettings: React.FC = () => {
  const initial = getSettings();
  const [provider, setProvider] = useState<ProviderId>(initial.storageProvider || "helia");
  const [tornadoUrl, setTornadoUrl] = useState(initial.tornadoUrl || "");
  const [passphrase, setPass] = useState("");
  const [unlocked, setUnlocked] = useState(!!getPassphrase());
  const [toast, setToast] = useState<{ msg: string; color: "success" | "warning" | "danger" } | null>(null);
  const configured = hasVerifier();

  const say = (msg: string, color: "success" | "warning" | "danger" = "success") => setToast({ msg, color });

  const applyPassphrase = async () => {
    if (!passphrase) return say("Enter a passphrase.", "warning");
    try {
      if (configured) {
        if (await unlockPassphrase(passphrase)) {
          setUnlocked(true);
          say("Unlocked for this session.");
        } else {
          say("Passphrase does not match.", "danger");
        }
      } else {
        await setPassphrase(passphrase);
        setUnlocked(true);
        say("Passphrase set. Remember it: lost passphrases cannot be recovered.");
      }
      setPass("");
    } catch (e: any) {
      say(e.message || "Could not set passphrase", "danger");
    }
  };

  const test = async () => {
    saveSettings({ storageProvider: provider, tornadoUrl: tornadoUrl.trim() });
    try {
      await getStorage().testConnection();
      say("Connection OK.");
    } catch (e: any) {
      say(`Connection failed: ${e.message}`, "danger");
    }
  };

  return (
    <div className="settings-group">
      <div className="settings-group-title">Cloud Storage</div>
      <div className="settings-card">
        <div className="settings-row">
          <div className="settings-info">
            <h4 className="settings-card-title">Storage provider</h4>
            <p className="settings-card-desc">
              Helia and S3 encrypt on this device first. If Helia is unreachable, saves fall back to S3.
            </p>
          </div>
          <div className="settings-action">
            <IonSelect
              value={provider}
              interface="popover"
              className="settings-select"
              onIonChange={(e) => {
                setProvider(e.detail.value);
                saveSettings({ storageProvider: e.detail.value });
              }}
            >
              {PROVIDERS.map((p) => (
                <IonSelectOption key={p.value} value={p.value}>
                  {p.label}
                </IonSelectOption>
              ))}
            </IonSelect>
          </div>
        </div>
      </div>

      <div className="settings-card">
        <h4 className="settings-card-title">Tornado URL</h4>
        <IonInput
          value={tornadoUrl}
          placeholder="http://localhost:8080"
          onIonInput={(e) => setTornadoUrl(String(e.detail.value ?? ""))}
          onIonBlur={() => saveSettings({ tornadoUrl: tornadoUrl.trim() })}
        />
        <IonButton size="small" fill="outline" onClick={test}>
          Test connection
        </IonButton>
      </div>

      <div className="settings-card">
        <h4 className="settings-card-title">Encryption passphrase</h4>
        <p className="settings-card-desc">
          {unlocked
            ? "Unlocked for this session."
            : configured
              ? "Enter your passphrase to unlock saving and loading."
              : "Choose a passphrase. It is kept in memory only; just a salted verifier is stored."}
        </p>
        <IonInput
          type="password"
          value={passphrase}
          placeholder="Passphrase"
          onIonInput={(e) => setPass(String(e.detail.value ?? ""))}
        />
        <IonButton size="small" onClick={applyPassphrase}>
          {configured ? "Unlock" : "Set passphrase"}
        </IonButton>
      </div>

      <IonToast
        isOpen={!!toast}
        message={toast?.msg}
        color={toast?.color}
        duration={3000}
        onDidDismiss={() => setToast(null)}
      />
    </div>
  );
};
