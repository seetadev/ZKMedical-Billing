import React, { useState, useRef } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonItem,
  IonLabel,
  IonList,
  IonToggle,
  IonInput,
  IonModal,
  IonToast,
  IonGrid,
  IonRow,
  IonCol,
  IonSelect,
  IonSelectOption,
  IonRange,
  IonPopover,
} from "@ionic/react";
import {
  saveOutline,
  cloudUpload,
  save,
  print,
  mail,
  settings,
  informationCircle,
  moon,
  sunny,
  card,
  alertCircle,
  logIn,
  personAdd,
  logOut,
  checkmarkCircle,
  personCircle,
  createOutline,
  trashOutline,
  colorPaletteOutline,
  add,
  checkmark,
  pencil,
  trash,
  cloudUploadOutline,
  imageOutline,
  downloadOutline,
  notifications,
  wifiOutline,
  cloudOfflineOutline,
  cloudDoneOutline,
  refreshOutline,
  bug,
  wallet,
} from "ionicons/icons";
import SignatureCanvas from "react-signature-canvas";
import Menu from "../components/Menu/Menu";
import { Local } from "../components/Storage/LocalStorage";
import { useTheme } from "../contexts/ThemeContext";
import { useInvoice } from "../contexts/InvoiceContext";
import PWAInstallPrompt from "../components/PWAInstallPrompt";
import PWADemo from "../components/PWADemo";
import { usePushNotifications } from "../utils/pushNotifications";
import { usePWA } from "../hooks/usePWA";
import "./SettingsPage.css";
import {
  cloudService,
  ServerFile,
  LoginCredentials,
  RegisterCredentials,
} from "../services/cloud-service";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useGetUserFileLimits } from "../hooks/useContractRead";

const SettingsPage: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // PWA features
  const { requestPermission, subscribe, getPermissionState } =
    usePushNotifications();
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const { isInstallable, isInstalled, isOnline, installApp } = usePWA();

  // Signature state
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [penColor, setPenColor] = useState("#000000");
  const [penWidth, setPenWidth] = useState(2);
  const signatureRef = useRef<SignatureCanvas>(null);
  const [savedSignatures, setSavedSignatures] = useState<
    Array<{ id: string; data: string; name: string }>
  >([]);
  const [selectedSignatureId, setSelectedSignatureId] = useState<string | null>(
    null
  );
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingSignatureId, setEditingSignatureId] = useState<string | null>(
    null
  );
  const [showUploadSignatureModal, setShowUploadSignatureModal] =
    useState(false);
  const [selectedSignatureFile, setSelectedSignatureFile] =
    useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  // Wallet connection hooks
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { fileLimits } = useGetUserFileLimits({
    accountAddress: address as `0x${string}` | undefined,
  });

  // Available pen colors
  const penColors = [
    { name: "Black", value: "#000000" },
    { name: "Blue", value: "#0066CC" },
    { name: "Red", value: "#CC0000" },
    { name: "Green", value: "#00AA00" },
    { name: "Purple", value: "#6600CC" },
    { name: "Brown", value: "#8B4513" },
  ];

  // Auth state
  const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [registerCredentials, setRegisterCredentials] =
    useState<RegisterCredentials>({
      name: "",
      email: "",
      password: "",
    });

  // const handleSaveLocal = () => {
  //   setShowMenu(true);
  // };

  const handleLogin = async () => {
    if (!loginCredentials.email || !loginCredentials.password) {
      setToastMessage("Please fill in all fields");
      setShowToast(true);
      return;
    }

    setIsLoading(true);
    try {
      await cloudService.login(loginCredentials);
      setShowLoginModal(false);
      setLoginCredentials({ email: "", password: "" });
    } catch (error) {
      setToastMessage(
        error instanceof Error
          ? error.message
          : "Login failed. Please check your credentials."
      );
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (
      !registerCredentials.name ||
      !registerCredentials.email ||
      !registerCredentials.password
    ) {
      setToastMessage("Please fill in all fields");
      setShowToast(true);
      return;
    }

    if (registerCredentials.password.length < 6) {
      setToastMessage("Password must be at least 6 characters long");
      setShowToast(true);
      return;
    }

    setIsLoading(true);
    try {
      await cloudService.register(registerCredentials);
      setShowRegisterModal(false);
      setRegisterCredentials({ name: "", email: "", password: "" });
      setToastMessage(
        "Registration successful! Please login with your new account."
      );
      setShowToast(true);
    } catch (error) {
      setToastMessage(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again."
      );
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await cloudService.logout();
      setToastMessage("Logged out successfully");
      setShowToast(true);
    } catch (error) {
      // Even if logout fails on server, we still clear local data
      setToastMessage("Logged out successfully");
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Load saved signatures from localStorage on component mount
  React.useEffect(() => {
    const saved = localStorage.getItem("userSignatures");
    if (saved) {
      try {
        const signatures = JSON.parse(saved);
        setSavedSignatures(signatures);
      } catch (error) {
        console.error("Error parsing saved signatures:", error);
        setSavedSignatures([]);
      }
    }

    // Load selected signature ID
    const selectedId = localStorage.getItem("selectedSignatureId");
    if (selectedId) {
      setSelectedSignatureId(selectedId);
    }
  }, []);

  // Load signature data when editing
  React.useEffect(() => {
    if (editingSignatureId && showSignatureModal && signatureRef.current) {
      const signatureToEdit = savedSignatures.find(
        (sig) => sig.id === editingSignatureId
      );
      if (signatureToEdit) {
        // Clear the canvas first
        signatureRef.current.clear();
        // Create an image and load the signature data
        const img = new Image();
        img.onload = () => {
          const canvas = signatureRef.current?.getCanvas();
          const ctx = canvas?.getContext("2d");
          if (canvas && ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
        };
        img.src = signatureToEdit.data;
      }
    }
  }, [editingSignatureId, showSignatureModal, savedSignatures]);

  // Fix canvas sizing and positioning when modal opens
  React.useEffect(() => {
    if (showSignatureModal && signatureRef.current) {
      const canvas = signatureRef.current.getCanvas();
      const container = canvas.parentElement;

      if (container) {
        // Ensure canvas dimensions match its display size
        const resizeCanvas = () => {
          const rect = container.getBoundingClientRect();
          const dpr = window.devicePixelRatio || 1;

          // Set actual canvas size in memory (scaled for high DPI)
          canvas.width = 500 * dpr;
          canvas.height = 200 * dpr;

          // Scale the drawing context back down
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.scale(dpr, dpr);
            // Restore signature if editing
            if (editingSignatureId) {
              const signatureToEdit = savedSignatures.find(
                (sig) => sig.id === editingSignatureId
              );
              if (signatureToEdit) {
                const img = new Image();
                img.onload = () => {
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0, 500, 200);
                };
                img.src = signatureToEdit.data;
              }
            }
          }

          // Set CSS size
          canvas.style.width = "100%";
          canvas.style.height = "200px";
        };

        // Initial resize
        setTimeout(resizeCanvas, 100);

        // Handle window resize
        window.addEventListener("resize", resizeCanvas);

        return () => {
          window.removeEventListener("resize", resizeCanvas);
        };
      }
    }
  }, [showSignatureModal, editingSignatureId, savedSignatures]);

  // Utility function to trim canvas
  const getTrimmedCanvas = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;

    // Find the bounding box of non-transparent pixels
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const alpha = data[(y * canvas.width + x) * 4 + 3];
        if (alpha > 0) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    // If no content found, return original canvas
    if (minX >= maxX || minY >= maxY) {
      return canvas;
    }

    // Add some padding
    const padding = 10;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(canvas.width, maxX + padding);
    maxY = Math.min(canvas.height, maxY + padding);

    // Create trimmed canvas
    const trimmedCanvas = document.createElement("canvas");
    const trimmedCtx = trimmedCanvas.getContext("2d");
    if (!trimmedCtx) return canvas;

    trimmedCanvas.width = maxX - minX;
    trimmedCanvas.height = maxY - minY;

    // Fill with white background
    trimmedCtx.fillStyle = "white";
    trimmedCtx.fillRect(0, 0, trimmedCanvas.width, trimmedCanvas.height);

    // Draw the trimmed signature
    trimmedCtx.drawImage(
      canvas,
      minX,
      minY,
      maxX - minX,
      maxY - minY,
      0,
      0,
      trimmedCanvas.width,
      trimmedCanvas.height
    );

    return trimmedCanvas;
  };

  // Signature handling functions
  const handleSaveSignature = () => {
    if (!signatureRef.current) {
      setToastMessage("Signature canvas not available");
      setShowToast(true);
      return;
    }

    if (signatureRef.current.isEmpty()) {
      setToastMessage("Please draw a signature first");
      setShowToast(true);
      return;
    }

    try {
      // Get the original canvas and trim it
      const originalCanvas = signatureRef.current.getCanvas();
      const trimmedCanvas = getTrimmedCanvas(originalCanvas);
      const signatureData = trimmedCanvas.toDataURL("image/png", 0.9);

      if (signatureData) {
        const newSignature = {
          id: editingSignatureId || Date.now().toString(),
          data: signatureData,
          name: editingSignatureId
            ? `Signature ${editingSignatureId}`
            : `Signature ${Date.now()}`,
        };

        let updatedSignatures;
        if (editingSignatureId) {
          // Update existing signature
          updatedSignatures = savedSignatures.map((sig) =>
            sig.id === editingSignatureId ? newSignature : sig
          );
        } else {
          // Check if we're at the limit before adding
          if (savedSignatures.length >= 3) {
            setToastMessage(
              "Maximum 3 signatures can be stored. Please delete an existing signature to add a new one."
            );
            setShowToast(true);
            return;
          }
          // Add new signature
          updatedSignatures = [...savedSignatures, newSignature];
        }

        setSavedSignatures(updatedSignatures);
        localStorage.setItem(
          "userSignatures",
          JSON.stringify(updatedSignatures)
        );

        // Set as selected if it's the first one or if editing
        if (updatedSignatures.length === 1 || editingSignatureId) {
          setSelectedSignatureId(newSignature.id);
          localStorage.setItem("selectedSignatureId", newSignature.id);
        }

        setShowSignatureModal(false);
        setEditingSignatureId(null);
        setToastMessage(
          editingSignatureId
            ? "Signature updated successfully"
            : "Signature saved successfully"
        );
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error saving signature:", error);
      setToastMessage("Error saving signature. Please try again.");
      setShowToast(true);
    }
  };

  const handleClearSignature = () => {
    signatureRef.current?.clear();
  };

  const handleDeleteSignature = (signatureId: string) => {
    const updatedSignatures = savedSignatures.filter(
      (sig) => sig.id !== signatureId
    );
    setSavedSignatures(updatedSignatures);
    localStorage.setItem("userSignatures", JSON.stringify(updatedSignatures));

    // If deleted signature was selected, select first available or none
    if (selectedSignatureId === signatureId) {
      const newSelectedId =
        updatedSignatures.length > 0 ? updatedSignatures[0].id : null;
      setSelectedSignatureId(newSelectedId);
      if (newSelectedId) {
        localStorage.setItem("selectedSignatureId", newSelectedId);
      } else {
        localStorage.removeItem("selectedSignatureId");
      }
    }

    setToastMessage("Signature deleted successfully");
    setShowToast(true);
  };

  const handleSelectSignature = (signatureId: string | null) => {
    setSelectedSignatureId(signatureId);
    if (signatureId) {
      localStorage.setItem("selectedSignatureId", signatureId);
    } else {
      localStorage.removeItem("selectedSignatureId");
    }
  };

  const handleEditSignature = (signatureId: string) => {
    setEditingSignatureId(signatureId);
    setShowSignatureModal(true);
  };

  const handleAddSignature = () => {
    if (savedSignatures.length >= 3) {
      setToastMessage(
        "Maximum 3 signatures can be stored. Please delete an existing signature to add a new one."
      );
      setShowToast(true);
      return;
    }
    setEditingSignatureId(null);
    setShowSignatureModal(true);
  };

  const handleCloseSignatureModal = () => {
    setShowSignatureModal(false);
    setEditingSignatureId(null);
    // Reset pen settings to defaults when closing
    setPenColor("#000000");
    setPenWidth(2);
  };

  // Upload signature functions
  const handleUploadSignature = () => {
    if (savedSignatures.length >= 3) {
      setToastMessage(
        "Maximum 3 signatures can be stored. Please delete an existing signature to add a new one."
      );
      setShowToast(true);
      return;
    }
    setShowUploadSignatureModal(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      setToastMessage(
        "Invalid file type. Only PNG, JPG, JPEG, GIF, WebP, and SVG files are allowed."
      );
      setShowToast(true);
      return;
    }

    // Validate file size (50KB = 50 * 1024 bytes)
    const maxSize = 50 * 1024; // 50KB
    if (file.size > maxSize) {
      setToastMessage(
        `File size too large. Maximum size allowed is ${Math.round(
          maxSize / 1024
        )}KB. Your file is ${Math.round(file.size / 1024)}KB.`
      );
      setShowToast(true);
      return;
    }

    setSelectedSignatureFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        // For SVG files, create a data URL
        if (file.type === "image/svg+xml") {
          setUploadPreview(result);
        } else {
          setUploadPreview(result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const validateImageDimensions = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;

        // Validate dimensions - reasonable signature size
        const minWidth = 50,
          maxWidth = 800;
        const minHeight = 30,
          maxHeight = 400;
        const maxAspectRatio = 10; // width/height shouldn't exceed 10:1
        const minAspectRatio = 0.1; // height/width shouldn't exceed 10:1

        const aspectRatio = width / height;

        if (width < minWidth || width > maxWidth) {
          setToastMessage(
            `Image width must be between ${minWidth}px and ${maxWidth}px. Your image is ${width}px wide.`
          );
          setShowToast(true);
          resolve(false);
          return;
        }

        if (height < minHeight || height > maxHeight) {
          setToastMessage(
            `Image height must be between ${minHeight}px and ${maxHeight}px. Your image is ${height}px tall.`
          );
          setShowToast(true);
          resolve(false);
          return;
        }

        if (aspectRatio > maxAspectRatio || aspectRatio < minAspectRatio) {
          setToastMessage(
            `Image aspect ratio is not suitable for a signature. Please use an image with more balanced dimensions.`
          );
          setShowToast(true);
          resolve(false);
          return;
        }

        resolve(true);
      };

      img.onerror = () => {
        setToastMessage("Unable to load image. Please try a different file.");
        setShowToast(true);
        resolve(false);
      };

      if (uploadPreview) {
        img.src = uploadPreview;
      }
    });
  };

  const handleSaveUploadedSignature = async () => {
    if (!selectedSignatureFile || !uploadPreview) {
      setToastMessage("Please select a file first.");
      setShowToast(true);
      return;
    }

    // Validate image dimensions
    const isValidDimensions = await validateImageDimensions(
      selectedSignatureFile
    );
    if (!isValidDimensions) {
      return;
    }

    try {
      const newSignature = {
        id: Date.now().toString(),
        data: uploadPreview,
        name: `Uploaded Signature ${Date.now()}`,
      };

      const updatedSignatures = [...savedSignatures, newSignature];
      setSavedSignatures(updatedSignatures);
      localStorage.setItem("userSignatures", JSON.stringify(updatedSignatures));

      // Set as selected if it's the first one
      if (updatedSignatures.length === 1) {
        setSelectedSignatureId(newSignature.id);
        localStorage.setItem("selectedSignatureId", newSignature.id);
      }

      setShowUploadSignatureModal(false);
      setSelectedSignatureFile(null);
      setUploadPreview(null);
      setToastMessage("Signature uploaded successfully!");
      setShowToast(true);
    } catch (error) {
      console.error("Error saving uploaded signature:", error);
      setToastMessage("Error saving signature. Please try again.");
      setShowToast(true);
    }
  };

  const handleCloseUploadModal = () => {
    setShowUploadSignatureModal(false);
    setSelectedSignatureFile(null);
    setUploadPreview(null);
  };

  const handleNotificationPermission = async () => {
    try {
      const permission = await requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        await subscribe();
        setToastMessage("Notifications enabled successfully!");
      } else {
        setToastMessage("Notification permission denied");
      }
      setShowToast(true);
    } catch (error) {
      setToastMessage("Failed to enable notifications");
      setShowToast(true);
    }
  };

  React.useEffect(() => {
    getPermissionState().then((state) => {
      setNotificationPermission(state.permission);
    });
  }, []);

  return (
    <IonPage
      className={isDarkMode ? "settings-page-dark" : "settings-page-light"}
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle style={{ fontWeight: "bold", fontSize: "1.3em" }}>
            Account Settings
          </IonTitle>
          <IonButtons slot="end">
            <IonButton
              fill="clear"
              onClick={toggleDarkMode}
              style={{ fontSize: "1.5em" }}
            >
              <IonIcon icon={isDarkMode ? sunny : moon} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent
        fullscreen
        className={
          isDarkMode ? "settings-content-dark" : "settings-content-light"
        }
      >
        <div className="settings-container">
          {/* Authentication Section */}
          <div className="auth-section">
            <IonCard
              className={isDarkMode ? "auth-card-dark" : "auth-card-light"}
            >
              <div
                className={
                  isDarkMode ? "auth-header-dark" : "auth-header-light"
                }
              >
                <h2 className="auth-title">
                  <IonIcon icon={personCircle} />
                  Account Management
                </h2>
                <p className="auth-subtitle">
                  {cloudService.isAuthenticated()
                    ? "Manage your cloud storage account"
                    : "Connect to access cloud features"}
                </p>
              </div>
              <div className="auth-content">
                {cloudService.isAuthenticated() ? (
                  <>
                    <div
                      className={`auth-status-message ${
                        isDarkMode ? "success-dark" : "success-light"
                      }`}
                    >
                      <IonIcon
                        icon={checkmarkCircle}
                        style={{ marginRight: "8px", fontSize: "1.2em" }}
                      />
                      You are successfully logged in to your cloud account
                    </div>
                    {cloudService.getCurrentUserInfo() && (
                      <div
                        style={{
                          padding: "12px",
                          marginBottom: "16px",
                          borderRadius: "8px",
                          backgroundColor: isDarkMode ? "#1a1a1a" : "#f5f5f5",
                          border: `1px solid ${isDarkMode ? "#333" : "#ddd"}`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.9em",
                            color: isDarkMode ? "#8b949e" : "#656d76",
                          }}
                        >
                          Logged in as:
                        </div>
                        <div style={{ fontWeight: "bold", marginTop: "4px" }}>
                          {cloudService.getCurrentUserInfo()?.email}
                        </div>
                      </div>
                    )}
                    <div className="auth-buttons-container">
                      <IonButton
                        className={`auth-button logout ${
                          isDarkMode ? "dark" : "light"
                        }`}
                        onClick={handleLogout}
                        disabled={isLoading}
                      >
                        <IonIcon icon={logOut} slot="start" />
                        {isLoading ? "Logging out..." : "Logout"}
                      </IonButton>
                    </div>
                  </>
                ) : (
                  <>
                    <p
                      style={{
                        textAlign: "center",
                        marginBottom: "20px",
                        color: isDarkMode ? "#8b949e" : "#656d76",
                      }}
                    >
                      Please login to access your server files and sync your
                      data across devices.
                    </p>
                    <div className="auth-buttons-container">
                      <IonButton
                        className={`auth-button primary ${
                          isDarkMode ? "dark" : "light"
                        }`}
                        onClick={() => setShowLoginModal(true)}
                      >
                        <IonIcon icon={logIn} slot="start" />
                        Login
                      </IonButton>
                      <IonButton
                        className={`auth-button secondary ${
                          isDarkMode ? "dark" : "light"
                        }`}
                        fill="outline"
                        onClick={() => setShowRegisterModal(true)}
                      >
                        <IonIcon icon={personAdd} slot="start" />
                        Register
                      </IonButton>
                    </div>
                  </>
                )}
              </div>
            </IonCard>
          </div>

          {/* Signature Section */}
          <div className="signature-section" style={{ marginBottom: "20px" }}>
            <IonCard
              className={isDarkMode ? "auth-card-dark" : "auth-card-light"}
            >
              <IonCardHeader
                className={
                  isDarkMode
                    ? "settings-card-header-dark"
                    : "settings-card-header-light"
                }
                style={{ marginBottom: "20px" }}
              >
                <IonCardTitle
                  className={
                    isDarkMode
                      ? "settings-card-title-dark"
                      : "settings-card-title-light"
                  }
                >
                  <IonIcon
                    icon={createOutline}
                    style={{ marginRight: "8px", fontSize: "1.5em" }}
                  />
                  Manage Signatures
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  {/* None option */}
                  <div
                    style={{
                      width: "150px",
                      height: "80px",
                      border: `2px solid ${
                        selectedSignatureId === null
                          ? isDarkMode
                            ? "#4c8dff"
                            : "#3880ff"
                          : isDarkMode
                          ? "#555"
                          : "#ddd"
                      }`,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      backgroundColor:
                        selectedSignatureId === null
                          ? isDarkMode
                            ? "#1a2332"
                            : "#e3f2fd"
                          : "transparent",
                      position: "relative",
                    }}
                    onClick={() => handleSelectSignature(null)}
                  >
                    <span
                      style={{
                        color: isDarkMode ? "#8b949e" : "#656d76",
                        fontSize: "0.9rem",
                      }}
                    >
                      None
                    </span>
                    {selectedSignatureId === null && (
                      <IonIcon
                        icon={checkmark}
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          color: isDarkMode ? "#4c8dff" : "#3880ff",
                          fontSize: "1.2rem",
                        }}
                      />
                    )}
                  </div>

                  {/* Saved signatures */}
                  {savedSignatures.map((signature) => (
                    <div
                      key={signature.id}
                      style={{
                        width: "150px",
                        height: "80px",
                        border: `2px solid ${
                          selectedSignatureId === signature.id
                            ? isDarkMode
                              ? "#4c8dff"
                              : "#3880ff"
                            : isDarkMode
                            ? "#555"
                            : "#ddd"
                        }`,
                        borderRadius: "8px",
                        position: "relative",
                        cursor: "pointer",
                        backgroundColor:
                          selectedSignatureId === signature.id
                            ? isDarkMode
                              ? "#1a2332"
                              : "#e3f2fd"
                            : "transparent",
                        overflow: "hidden",
                      }}
                      onClick={() => handleSelectSignature(signature.id)}
                    >
                      <img
                        src={signature.data}
                        alt="Signature"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          padding: "4px",
                          backgroundColor: "white",
                        }}
                      />

                      {/* Selection checkmark */}
                      {selectedSignatureId === signature.id && (
                        <IonIcon
                          icon={checkmark}
                          style={{
                            position: "absolute",
                            top: "8px",
                            right: "8px",
                            color: isDarkMode ? "#4c8dff" : "#3880ff",
                            fontSize: "1.2rem",
                            backgroundColor: "white",
                            borderRadius: "50%",
                            padding: "2px",
                          }}
                        />
                      )}

                      {/* Action buttons */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: "4px",
                          right: "4px",
                          display: "flex",
                          gap: "2px",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IonButton
                          fill="clear"
                          size="small"
                          onClick={() => handleEditSignature(signature.id)}
                          style={{
                            "--color": "#3880ff",
                            "--padding-start": "4px",
                            "--padding-end": "4px",
                            height: "24px",
                            minHeight: "24px",
                          }}
                        >
                          <IonIcon
                            icon={pencil}
                            style={{ fontSize: "0.9rem" }}
                          />
                        </IonButton>
                        <IonButton
                          fill="clear"
                          size="small"
                          onClick={() => handleDeleteSignature(signature.id)}
                          style={{
                            "--color": "#eb445a",
                            "--padding-start": "4px",
                            "--padding-end": "4px",
                            height: "24px",
                            minHeight: "24px",
                          }}
                        >
                          <IonIcon
                            icon={trash}
                            style={{ fontSize: "0.9rem" }}
                          />
                        </IonButton>
                      </div>
                    </div>
                  ))}
                </div>

                {savedSignatures.length === 0 && (
                  <p
                    style={{
                      textAlign: "center",
                      marginTop: "20px",
                      color: isDarkMode ? "#8b949e" : "#656d76",
                    }}
                  >
                    No signatures created yet. Click "Add" to create or "Upload"
                    to upload your first signature.
                  </p>
                )}

                {/* Action buttons at bottom */}
                <div
                  style={{
                    marginTop: "16px",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                  }}
                >
                  <IonButton
                    fill="outline"
                    size="small"
                    onClick={handleUploadSignature}
                    style={{
                      "--border-radius": "20px",
                      minWidth: "80px",
                    }}
                  >
                    <IonIcon icon={cloudUploadOutline} slot="start" />
                    Upload
                  </IonButton>
                  <IonButton
                    fill="outline"
                    size="small"
                    onClick={handleAddSignature}
                    style={{
                      "--border-radius": "20px",
                      minWidth: "80px",
                    }}
                  >
                    <IonIcon icon={add} slot="start" />
                    Add
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>
          </div>

          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Menu & Settings</IonTitle>
              <IonButtons slot="end">
                <IonButton
                  fill="clear"
                  onClick={toggleDarkMode}
                  style={{ fontSize: "1.5em" }}
                >
                  <IonIcon icon={isDarkMode ? sunny : moon} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <div
            className={`menu-page-container ${isDarkMode ? "" : "light-mode"}`}
          >
            {/* Settings Card */}
            <IonCard
              className={
                isDarkMode ? "settings-card-dark" : "settings-card-light"
              }
            >
              <IonCardHeader
                className={
                  isDarkMode
                    ? "settings-card-header-dark"
                    : "settings-card-header-light"
                }
              >
                <IonCardTitle
                  className={
                    isDarkMode
                      ? "settings-card-title-dark"
                      : "settings-card-title-light"
                  }
                >
                  <IonIcon
                    icon={settings}
                    style={{ marginRight: "8px", fontSize: "1.5em" }}
                  />
                  Preferences
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  <IonItem>
                    <IonIcon icon={isDarkMode ? moon : sunny} slot="start" />
                    <IonLabel>Dark Mode</IonLabel>
                    <IonToggle
                      checked={isDarkMode}
                      onIonChange={(e) => toggleDarkMode()}
                      slot="end"
                    />
                  </IonItem>
                </IonList>
              </IonCardContent>
            </IonCard>

            {/* PWA Status Card */}
            <IonCard
              className={
                isDarkMode ? "settings-card-dark" : "settings-card-light"
              }
            >
              <IonCardHeader
                className={
                  isDarkMode
                    ? "settings-card-header-dark"
                    : "settings-card-header-light"
                }
              >
                <IonCardTitle
                  className={
                    isDarkMode
                      ? "settings-card-title-dark"
                      : "settings-card-title-light"
                  }
                >
                  <IonIcon
                    icon={downloadOutline}
                    style={{ marginRight: "8px", fontSize: "1.5em" }}
                  />
                  PWA Features
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  <IonItem>
                    <IonIcon
                      icon={downloadOutline}
                      slot="start"
                      color={
                        isInstallable && !isInstalled ? "success" : "medium"
                      }
                    />
                    <IonLabel>
                      <h2>App Installation</h2>
                      <p>
                        {isInstalled
                          ? "✓ App is installed"
                          : isInstallable
                          ? "Ready to install - Click to add to home screen"
                          : "Installation not available (may already be installed)"}
                      </p>
                    </IonLabel>
                    {isInstallable && !isInstalled && (
                      <IonButton
                        fill="outline"
                        size="small"
                        onClick={async () => {
                          const success = await installApp();
                          if (success) {
                            setToastMessage("App installed successfully!");
                            setShowToast(true);
                          }
                        }}
                        slot="end"
                      >
                        Install
                      </IonButton>
                    )}
                  </IonItem>

                  <IonItem>
                    <IonIcon
                      icon={isOnline ? wifiOutline : cloudOfflineOutline}
                      slot="start"
                      color={isOnline ? "success" : "warning"}
                    />
                    <IonLabel>
                      <h2>Connection Status</h2>
                      <p>
                        {isOnline
                          ? "✓ Online - All features available"
                          : "⚠ Offline - Limited functionality"}
                      </p>
                    </IonLabel>
                  </IonItem>

                  <IonItem>
                    <IonIcon
                      icon={notifications}
                      slot="start"
                      color={
                        notificationPermission === "granted"
                          ? "success"
                          : "medium"
                      }
                    />
                    <IonLabel>
                      <h2>Push Notifications</h2>
                      <p>
                        {notificationPermission === "granted"
                          ? "✓ Enabled - You'll receive updates"
                          : "Enable notifications for app updates"}
                      </p>
                    </IonLabel>
                    {notificationPermission !== "granted" && (
                      <IonButton
                        fill="outline"
                        size="small"
                        onClick={handleNotificationPermission}
                        slot="end"
                      >
                        Enable
                      </IonButton>
                    )}
                  </IonItem>

                  <IonItem>
                    <IonIcon
                      icon={cloudDoneOutline}
                      slot="start"
                      color="success"
                    />
                    <IonLabel>
                      <h2>Offline Storage</h2>
                      <p>✓ Your data is saved locally and syncs when online</p>
                    </IonLabel>
                  </IonItem>

                  <IonItem>
                    <IonIcon
                      icon={refreshOutline}
                      slot="start"
                      color="success"
                    />
                    <IonLabel>
                      <h2>Auto Updates</h2>
                      <p>✓ App updates automatically in the background</p>
                    </IonLabel>
                  </IonItem>
                </IonList>
              </IonCardContent>
            </IonCard>

            {/* Wallet Connection Card */}
            <IonCard
              className={
                isDarkMode ? "settings-card-dark" : "settings-card-light"
              }
            >
              <IonCardHeader
                className={
                  isDarkMode
                    ? "settings-card-header-dark"
                    : "settings-card-header-light"
                }
              >
                <IonCardTitle
                  className={
                    isDarkMode
                      ? "settings-card-title-dark"
                      : "settings-card-title-light"
                  }
                >
                  <IonIcon
                    icon={wallet}
                    style={{ marginRight: "8px", fontSize: "1.5em" }}
                  />
                  Wallet Connection
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  {!isConnected ? (
                    <>
                      <IonItem lines="none">
                        <IonLabel>
                          <h2>Connect Wallet</h2>
                          <p>
                            Connect your StarkNet wallet to save files to
                            blockchain
                          </p>
                        </IonLabel>
                      </IonItem>
                      {connectors.map((connector) => (
                        <IonItem key={connector.id}>
                          <IonIcon icon={wallet} slot="start" color="primary" />
                          <IonLabel>
                            <h3>{connector.name}</h3>
                            <p>{connector.id}</p>
                          </IonLabel>
                          <IonButton
                            fill="outline"
                            size="small"
                            onClick={() => connect({ connector })}
                            slot="end"
                          >
                            Connect
                          </IonButton>
                        </IonItem>
                      ))}
                    </>
                  ) : (
                    <>
                      <IonItem>
                        <IonIcon
                          icon={checkmarkCircle}
                          slot="start"
                          color="success"
                        />
                        <IonLabel>
                          <h2>Wallet Connected</h2>
                          <p>
                            Address: {address?.slice(0, 6)}...
                            {address?.slice(-4)}
                          </p>
                        </IonLabel>
                        <IonButton
                          fill="outline"
                          size="small"
                          color="danger"
                          onClick={() => disconnect()}
                          slot="end"
                        >
                          Disconnect
                        </IonButton>
                      </IonItem>
                      {fileLimits &&
                        Array.isArray(fileLimits) &&
                        fileLimits.length >= 2 && (
                          <IonItem>
                            <IonIcon
                              icon={cloudUpload}
                              slot="start"
                              color="primary"
                            />
                            <IonLabel>
                              <h3>Blockchain Storage</h3>
                              <p>
                                Files Used: {fileLimits[0].toString()}/
                                {fileLimits[1].toString()}
                              </p>
                              {fileLimits[0] >= fileLimits[1] && (
                                <p
                                  style={{ color: "var(--ion-color-warning)" }}
                                >
                                  Storage limit reached. Consider upgrading.
                                </p>
                              )}
                            </IonLabel>
                          </IonItem>
                        )}
                    </>
                  )}
                </IonList>
              </IonCardContent>
            </IonCard>

            {/* PWA Demo Component */}
            <PWADemo />
          </div>
        </div>

        {/* Menu Component (Action Sheet) */}
        <Menu showM={showMenu} setM={() => setShowMenu(false)} />
      </IonContent>

      {/* Login Modal */}
      <IonModal
        isOpen={showLoginModal}
        onDidDismiss={() => setShowLoginModal(false)}
        className={isDarkMode ? "auth-modal-dark" : "auth-modal-light"}
      >
        <IonHeader>
          <IonToolbar className="auth-modal-header">
            <IonTitle className="auth-modal-title">
              <IonIcon icon={logIn} style={{ marginRight: "8px" }} />
              Welcome Back
            </IonTitle>
            <IonButton
              slot="end"
              fill="clear"
              color="light"
              onClick={() => setShowLoginModal(false)}
            >
              Cancel
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent className="auth-modal-content">
          <div style={{ padding: "24px" }}>
            <div className="auth-input-container">
              <IonInput
                className={`auth-input ${isDarkMode ? "dark" : "light"}`}
                label=""
                labelPlacement="stacked"
                type="email"
                value={loginCredentials.email}
                onIonInput={(e) =>
                  setLoginCredentials({
                    ...loginCredentials,
                    email: e.detail.value!,
                  })
                }
                placeholder="Enter your email address"
                required
              />
            </div>
            <div className="auth-input-container">
              <IonInput
                className={`auth-input ${isDarkMode ? "dark" : "light"}`}
                label=""
                labelPlacement="stacked"
                type="password"
                value={loginCredentials.password}
                onIonInput={(e) =>
                  setLoginCredentials({
                    ...loginCredentials,
                    password: e.detail.value!,
                  })
                }
                placeholder="Enter your password"
                required
              />
            </div>
            <IonButton
              expand="block"
              onClick={handleLogin}
              className="auth-submit-button"
              color="primary"
              disabled={isLoading}
            >
              {isLoading ? (
                "Signing In..."
              ) : (
                <>
                  <IonIcon icon={logIn} slot="start" />
                  Sign In
                </>
              )}
            </IonButton>
            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <IonButton
                fill="clear"
                size="small"
                onClick={() => {
                  setShowLoginModal(false);
                  setShowRegisterModal(true);
                }}
              >
                Don't have an account? Register here
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonModal>

      {/* Register Modal */}
      <IonModal
        isOpen={showRegisterModal}
        onDidDismiss={() => setShowRegisterModal(false)}
        className={isDarkMode ? "auth-modal-dark" : "auth-modal-light"}
      >
        <IonHeader>
          <IonToolbar className="auth-modal-header">
            <IonTitle className="auth-modal-title">
              <IonIcon icon={personAdd} style={{ marginRight: "8px" }} />
              Create Account
            </IonTitle>
            <IonButton
              slot="end"
              fill="clear"
              color="light"
              onClick={() => setShowRegisterModal(false)}
            >
              Cancel
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent className="auth-modal-content">
          <div style={{ padding: "24px" }}>
            <div className="auth-input-container">
              <IonInput
                className={`auth-input ${isDarkMode ? "dark" : "light"}`}
                label=""
                labelPlacement="stacked"
                type="text"
                value={registerCredentials.name}
                onIonInput={(e) =>
                  setRegisterCredentials({
                    ...registerCredentials,
                    name: e.detail.value!,
                  })
                }
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="auth-input-container">
              <IonInput
                className={`auth-input ${isDarkMode ? "dark" : "light"}`}
                type="email"
                value={registerCredentials.email}
                onIonInput={(e) =>
                  setRegisterCredentials({
                    ...registerCredentials,
                    email: e.detail.value!,
                  })
                }
                placeholder="Enter your email address"
                required
              />
            </div>
            <div className="auth-input-container">
              <IonInput
                className={`auth-input ${isDarkMode ? "dark" : "light"}`}
                type="password"
                value={registerCredentials.password}
                onIonInput={(e) =>
                  setRegisterCredentials({
                    ...registerCredentials,
                    password: e.detail.value!,
                  })
                }
                placeholder="Choose a secure password"
                required
              />
            </div>
            <IonButton
              expand="block"
              onClick={handleRegister}
              className="auth-submit-button"
              color="primary"
              disabled={isLoading}
            >
              {isLoading ? (
                "Creating Account..."
              ) : (
                <>
                  <IonIcon icon={personAdd} slot="start" />
                  Create Account
                </>
              )}
            </IonButton>
            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <IonButton
                fill="clear"
                size="small"
                onClick={() => {
                  setShowRegisterModal(false);
                  setShowLoginModal(true);
                }}
              >
                Already have an account? Sign in here
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonModal>

      {/* Signature Modal */}
      <IonModal
        isOpen={showSignatureModal}
        onDidDismiss={handleCloseSignatureModal}
        className={isDarkMode ? "auth-modal-dark" : "auth-modal-light"}
      >
        <IonHeader>
          <IonToolbar className="auth-modal-header">
            <IonTitle className="auth-modal-title">
              {/* Modal Title and Pen Settings */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    fontSize: "16px",
                    color: "white",
                    fontWeight: "600",
                  }}
                >
                  {editingSignatureId ? "Edit Signature" : "Create Signature"}
                </span>

                {/* Pen Settings */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "20px" }}
                >
                  {/* Pen Color */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        color: "white",
                        fontWeight: "500",
                      }}
                    >
                      Color:
                    </span>
                    <div
                      id="color-trigger"
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: penColor,
                        border: "2px solid white",
                        boxShadow: "0 0 0 1px rgba(0,0,0,0.3)",
                        cursor: "pointer",
                      }}
                      onClick={() => setShowColorPicker(true)}
                    />
                  </div>

                  {/* Pen Width */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      minWidth: "120px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        color: "white",
                        fontWeight: "500",
                      }}
                    >
                      Width:
                    </span>
                    <IonRange
                      min={1}
                      max={8}
                      value={penWidth}
                      onIonChange={(e) => setPenWidth(e.detail.value as number)}
                      style={{
                        flex: 1,
                        "--bar-background": "rgba(255,255,255,0.3)",
                        "--bar-background-active": "white",
                        "--knob-background": "white",
                        "--knob-size": "18px",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "12px",
                        color: "white",
                        minWidth: "24px",
                        textAlign: "center",
                      }}
                    >
                      {penWidth}px
                    </span>
                  </div>
                </div>
              </div>
            </IonTitle>
            <IonButton
              slot="end"
              fill="clear"
              color="light"
              onClick={handleCloseSignatureModal}
              style={{ fontSize: "20px", minWidth: "40px", minHeight: "40px" }}
            >
              ✕
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent className="auth-modal-content">
          <div style={{ padding: "24px" }}>
            {/* Signature Canvas */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  border: "2px dashed #ccc",
                  borderRadius: "8px",
                  padding: "16px",
                  backgroundColor: "white",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxWidth: "500px",
                    margin: "0 auto",
                    position: "relative",
                  }}
                >
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      width: 500,
                      height: 200,
                      className: "signature-canvas",
                      style: {
                        width: "100%",
                        height: "200px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        touchAction: "none",
                        display: "block",
                      },
                    }}
                    penColor={penColor}
                    minWidth={penWidth * 0.5}
                    maxWidth={penWidth}
                    backgroundColor="rgb(255, 255, 255)"
                    dotSize={penWidth * 0.5}
                    throttle={16}
                    velocityFilterWeight={0.7}
                  />
                </div>
                <p
                  style={{
                    fontSize: "0.9em",
                    color: "#666",
                    marginTop: "8px",
                    marginBottom: "0",
                  }}
                >
                  Sign above with your finger or stylus
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <IonGrid>
              <IonRow>
                <IonCol size="12" sizeMd="4">
                  <IonButton
                    expand="block"
                    fill="outline"
                    onClick={handleClearSignature}
                  >
                    Clear
                  </IonButton>
                </IonCol>
                <IonCol size="12" sizeMd="8">
                  <IonButton
                    expand="block"
                    onClick={handleSaveSignature}
                    className="auth-submit-button"
                    color="primary"
                  >
                    <IonIcon icon={saveOutline} slot="start" />
                    {editingSignatureId ? "Update Signature" : "Save Signature"}
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>
        </IonContent>
      </IonModal>

      {/* Upload Signature Modal */}
      <IonModal
        isOpen={showUploadSignatureModal}
        onDidDismiss={handleCloseUploadModal}
        className={isDarkMode ? "auth-modal-dark" : "auth-modal-light"}
      >
        <IonHeader>
          <IonToolbar className="auth-modal-header">
            <IonTitle className="auth-modal-title">
              <IonIcon
                icon={cloudUploadOutline}
                style={{ marginRight: "8px" }}
              />
              Upload Signature
            </IonTitle>
            <IonButton
              slot="end"
              fill="clear"
              color="light"
              onClick={handleCloseUploadModal}
              style={{ fontSize: "20px", minWidth: "40px", minHeight: "40px" }}
            >
              ✕
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <IonContent className="auth-modal-content">
          <div style={{ padding: "24px" }}>
            {/* File Upload Section */}
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  border: "2px dashed #ccc",
                  borderRadius: "8px",
                  padding: "20px",
                  textAlign: "center",
                  backgroundColor: isDarkMode ? "#1a1a1a" : "#f9f9f9",
                }}
              >
                <IonIcon
                  icon={imageOutline}
                  style={{
                    fontSize: "48px",
                    color: "#ccc",
                    marginBottom: "16px",
                  }}
                />
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    color: isDarkMode ? "#fff" : "#000",
                  }}
                >
                  Select Signature File
                </h3>
                <p
                  style={{
                    margin: "0 0 16px 0",
                    color: isDarkMode ? "#8b949e" : "#656d76",
                  }}
                >
                  Upload PNG, JPG, GIF, WebP, or SVG files (max 50KB)
                </p>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                  id="signature-file-input"
                />

                <IonButton
                  fill="outline"
                  onClick={() =>
                    document.getElementById("signature-file-input")?.click()
                  }
                >
                  <IonIcon icon={imageOutline} slot="start" />
                  Choose File
                </IonButton>
              </div>

              {/* Requirements */}
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  backgroundColor: isDarkMode ? "#1a1a1a" : "#f0f8ff",
                  borderRadius: "6px",
                  border: `1px solid ${isDarkMode ? "#333" : "#e0e8f0"}`,
                }}
              >
                <h4
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "14px",
                    color: isDarkMode ? "#fff" : "#000",
                  }}
                >
                  Requirements:
                </h4>
                <ul
                  style={{
                    margin: "0",
                    paddingLeft: "16px",
                    fontSize: "12px",
                    color: isDarkMode ? "#8b949e" : "#656d76",
                  }}
                >
                  <li>File size: Maximum 50KB</li>
                  <li>Formats: PNG, JPG, JPEG, GIF, WebP, SVG</li>
                  <li>Dimensions: 50-800px width, 30-400px height</li>
                  <li>Reasonable aspect ratio for signature</li>
                </ul>
              </div>
            </div>

            {/* Preview Section */}
            {uploadPreview && selectedSignatureFile && (
              <div style={{ marginBottom: "20px" }}>
                <h4
                  style={{
                    margin: "0 0 12px 0",
                    color: isDarkMode ? "#fff" : "#000",
                  }}
                >
                  Preview:
                </h4>
                <div
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "16px",
                    backgroundColor: "white",
                    textAlign: "center",
                  }}
                >
                  <img
                    src={uploadPreview}
                    alt="Signature preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "120px",
                      objectFit: "contain",
                    }}
                  />
                  <p
                    style={{
                      margin: "8px 0 0 0",
                      fontSize: "12px",
                      color: "#666",
                    }}
                  >
                    File: {selectedSignatureFile.name} (
                    {Math.round(selectedSignatureFile.size / 1024)}KB)
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <IonGrid>
              <IonRow>
                <IonCol size="12" sizeMd="6">
                  <IonButton
                    expand="block"
                    fill="outline"
                    onClick={handleCloseUploadModal}
                  >
                    Cancel
                  </IonButton>
                </IonCol>
                <IonCol size="12" sizeMd="6">
                  <IonButton
                    expand="block"
                    onClick={handleSaveUploadedSignature}
                    disabled={!selectedSignatureFile || !uploadPreview}
                    className="auth-submit-button"
                    color="primary"
                  >
                    <IonIcon icon={saveOutline} slot="start" />
                    Save Signature
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>
        </IonContent>
      </IonModal>

      {/* Color Picker Popover */}
      <IonPopover
        trigger="color-trigger"
        isOpen={showColorPicker}
        onDidDismiss={() => setShowColorPicker(false)}
        showBackdrop={true}
      >
        <IonContent className="ion-padding">
          <div style={{ padding: "8px" }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>
              Select Pen Color
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                width: "120px",
              }}
            >
              {penColors.map((color, index) => (
                <div
                  key={index}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: color.value,
                    border:
                      penColor === color.value
                        ? "3px solid #0969da"
                        : "2px solid #ccc",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                  onClick={() => {
                    setPenColor(color.value);
                    setShowColorPicker(false);
                  }}
                >
                  {penColor === color.value && (
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor:
                          color.value === "#000000" ? "white" : "#000000",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </IonContent>
      </IonPopover>

      {/* Toast for notifications */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={toastMessage.includes("Maximum") ? 4000 : 3000}
        position="bottom"
        color={
          toastMessage.includes("successful")
            ? "success"
            : toastMessage.includes("Maximum")
            ? "warning"
            : "danger"
        }
      />
    </IonPage>
  );
};

export default SettingsPage;
