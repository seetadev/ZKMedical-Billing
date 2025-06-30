import React, { useState, useEffect } from "react";
import "./Files.css";
import * as AppGeneral from "../socialcalc/index.js";
import { DATA } from "../../app-data.js";
import { File as LocalFile, Local } from "../Storage/LocalStorage";
import {
  IonIcon,
  IonItem,
  IonList,
  IonLabel,
  IonAlert,
  IonItemGroup,
  IonBadge,
  IonSpinner,
  IonToast,
  IonSegment,
  IonSegmentButton,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonPage,
  IonSearchbar,
  IonButton,
  IonInput,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonModal,
  IonFab,
  IonFabButton,
} from "@ionic/react";
import {
  trash,
  key,
  documentText,
  cloudOutline,
  server,
  logIn,
  personAdd,
  download,
  folderOpen,
} from "ionicons/icons";
import { useAccount } from "@starknet-react/core";
import { useGetUserFiles } from "../../hooks/useContractRead";
import { useTheme } from "../../contexts/ThemeContext";
import { downloadFromIPFS } from "../../utils/ipfs";
import { useHistory } from "react-router-dom";
import {
  serverFilesService,
  ServerFile,
  LoginCredentials,
  RegisterCredentials,
} from "../../services/serverFiles";
import { useInvoice } from "../../contexts/InvoiceContext";

const Files: React.FC<{
  store: Local;
  file: string;
  updateSelectedFile: Function;
  updateBillType: Function;
}> = (props) => {
  const { billType, store, updateSelectedFile, updateBillType } = useInvoice();
  const { address } = useAccount();
  const { isDarkMode } = useTheme();
  const history = useHistory();
  const { files: blockchainFiles, isLoading: filesLoading } = useGetUserFiles({
    accountAddress: address as `0x${string}` | undefined,
  });

  const [showAlert1, setShowAlert1] = useState(false);
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [fileSource, setFileSource] = useState<
    "local" | "blockchain" | "server"
  >("local");
  const [searchQuery, setSearchQuery] = useState("");
  const [fileListContent, setFileListContent] = useState<React.ReactNode>(null);
  const [showPasswordAlert, setShowPasswordAlert] = useState(false);
  const [fileRequiringPassword, setFileRequiringPassword] = useState<
    string | null
  >(null);
  const [passwordForFile, setPasswordForFile] = useState("");

  // Server files state
  const [serverFiles, setServerFiles] = useState<ServerFile[]>([]);
  const [serverFilesLoading, setServerFilesLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [deletingFile, setDeletingFile] = useState<number | null>(null);

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

  // Load file from blockchain
  const loadFromBlockchain = async (file: any) => {
    if (!file.ipfs_cid) {
      setToastMessage("No IPFS hash found for this file");
      setShowToast(true);
      return;
    }
    setLoadingFile(file.file_name);
    try {
      const jsonString = await downloadFromIPFS(file.ipfs_cid);
      if (!jsonString) throw new Error("Failed to download file from IPFS");
      const jsonData = JSON.parse(jsonString);
      if (!jsonData || typeof jsonData !== "object" || !jsonData.content)
        throw new Error("Invalid file data from IPFS");
      AppGeneral.viewFile(file.file_name, jsonData.content);
      props.updateSelectedFile(file.file_name);
      if (jsonData.billType) props.updateBillType(jsonData.billType);
      setToastMessage(`Loaded ${file.file_name}`);
      setShowToast(true);
    } catch (error) {
      setToastMessage("Failed to load from blockchain");
      setShowToast(true);
    } finally {
      setLoadingFile(null);
    }
  };

  // Edit local file
  const editFile = async (key: string) => {
    try {
      console.log("Attempting to edit file:", key);
      const isEncrypted = await props.store._isFileEncrypted(key);
      console.log("Is file encrypted:", isEncrypted);

      if (isEncrypted) {
        setFileRequiringPassword(key);
        setShowPasswordAlert(true);
        return;
      }

      const data = await props.store._getFile(key);
      console.log("File data retrieved:", {
        name: data.name,
        contentLength: data.content?.length,
        billType: data.billType,
        hasContent: !!data.content,
      });

      if (!data.content) {
        setToastMessage("File content is empty or corrupted");
        setShowToast(true);
        return;
      }

      const decodedContent = decodeURIComponent(data.content);
      console.log("Decoded content length:", decodedContent.length);
      console.log("Decoded content preview:", decodedContent.substring(0, 200));

      // Ensure SocialCalc is properly initialized before loading the file
      // First, try to get the current workbook control to see if it's initialized
      try {
        const currentControl = AppGeneral.getWorkbookInfo();
        console.log("Current workbook info:", currentControl);

        if (currentControl && currentControl.workbook) {
          // SocialCalc is initialized, use viewFile
          AppGeneral.viewFile(key, decodedContent);
          console.log("File loaded successfully with viewFile");
        } else {
          // SocialCalc not initialized, initialize it first
          console.log("SocialCalc not initialized, initializing...");
          AppGeneral.initializeApp(decodedContent);
          console.log("File loaded successfully with initializeApp");
        }
      } catch (error) {
        console.error("Error checking SocialCalc state:", error);
        // Fallback: try to initialize the app
        try {
          AppGeneral.initializeApp(decodedContent);
          console.log("File loaded successfully with initializeApp (fallback)");
        } catch (initError) {
          console.error("initializeApp failed:", initError);
          throw new Error(
            "Failed to load file: SocialCalc initialization error"
          );
        }
      }

      props.updateSelectedFile(key);
      props.updateBillType(data.billType);
      setToastMessage(`Loaded ${key}`);
      setShowToast(true);
      history.push("/home");
    } catch (error) {
      console.error("Error in editFile:", error);
      setToastMessage("Failed to load file");
      setShowToast(true);
    }
  };

  // Load encrypted file
  const loadFileWithPassword = async (key: string, password: string) => {
    try {
      const data = await props.store._getFileWithPassword(key, password);
      AppGeneral.viewFile(key, decodeURIComponent(data.content));
      props.updateSelectedFile(key);
      props.updateBillType(data.billType);
      setToastMessage(`Loaded ${key}`);
      setShowToast(true);
      history.push("/home");
    } catch (error) {
      setToastMessage("Wrong password or file corrupted");
      setShowToast(true);
    }
  };

  // Delete file
  const deleteFile = (key: string) => {
    setShowAlert1(true);
    setCurrentKey(key);
  };

  // Load default file
  const loadDefault = () => {
    const msc = DATA["home"][AppGeneral.getDeviceType()]["msc"];
    AppGeneral.viewFile("default", JSON.stringify(msc));
    props.updateSelectedFile("default");
  };

  // Format date
  const _formatDate = (date: string) => new Date(date).toLocaleString();

  // Group files by date
  const groupFilesByDate = (files: any[]) => {
    const groups: { [key: string]: any[] } = {};
    files.forEach((file) => {
      const dateHeader = new Date(file.date).toDateString();
      if (!groups[dateHeader]) groups[dateHeader] = [];
      groups[dateHeader].push(file);
    });
    return groups;
  };

  // Filter files by search
  const filterFilesBySearch = (files: any[], query: string) => {
    if (!query.trim()) return files;
    const searchTerm = query.toLowerCase().trim();
    return files.filter((file) => {
      const fileName =
        file.name?.toLowerCase() ||
        file.file_name?.toLowerCase() ||
        file.key?.toLowerCase() ||
        file.filename?.toLowerCase() ||
        "";
      return fileName.includes(searchTerm);
    });
  };

  // Server files functions
  const loadServerFiles = async () => {
    if (!serverFilesService.isAuthenticated()) return;

    setServerFilesLoading(true);
    try {
      const files = await serverFilesService.getFiles();
      setServerFiles(files);
    } catch (error) {
      setToastMessage("Failed to load server files");
      setShowToast(true);
    } finally {
      setServerFilesLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      await serverFilesService.login(loginCredentials);
      setShowLoginModal(false);
      setLoginCredentials({ email: "", password: "" });
      setToastMessage("Login successful");
      setShowToast(true);
      loadServerFiles();
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : "Login failed");
      setShowToast(true);
    }
  };

  const handleRegister = async () => {
    try {
      await serverFilesService.register(registerCredentials);
      setShowRegisterModal(false);
      setRegisterCredentials({ name: "", email: "", password: "" });
      setToastMessage("Registration successful. Please login.");
      setShowToast(true);
    } catch (error) {
      setToastMessage(
        error instanceof Error ? error.message : "Registration failed"
      );
      setShowToast(true);
    }
  };

  const handleLogout = () => {
    serverFilesService.clearToken();
    setServerFiles([]);
    setToastMessage("Logged out successfully");
    setShowToast(true);
  };

  const handleFileDownload = async (file: ServerFile) => {
    try {
      const blob = await serverFilesService.downloadFile(file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setToastMessage("File downloaded successfully");
      setShowToast(true);
    } catch (error) {
      setToastMessage(
        error instanceof Error ? error.message : "Download failed"
      );
      setShowToast(true);
    }
  };

  const handleFileDelete = async (fileId: number) => {
    setDeletingFile(fileId);
    try {
      await serverFilesService.deleteFile(fileId);
      setToastMessage("File deleted successfully");
      setShowToast(true);
      loadServerFiles();
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : "Delete failed");
      setShowToast(true);
    } finally {
      setDeletingFile(null);
    }
  };

  const handleMoveToLocal = async (file: ServerFile) => {
    try {
      setToastMessage("Moving file to local storage...");
      setShowToast(true);

      // Download the file from server
      const blob = await serverFilesService.downloadFile(file.id);

      // Convert blob to text
      const text = await blob.text();

      // Parse the JSON content
      const fileData = JSON.parse(text);
      console.log("Server file data:", fileData);

      // Check if this is a server invoice file (has the expected structure)
      if (
        fileData.content &&
        fileData.fileName &&
        fileData.billType !== undefined
      ) {
        // The content from server is already the raw content, not URL-encoded
        // We need to URL-encode it for local storage
        const encodedContent = encodeURIComponent(fileData.content);

        // Remove the "server_" prefix from the filename
        const localFileName = fileData.fileName.replace("server_", "");

        console.log("Creating local file with:", {
          fileName: localFileName,
          contentLength: fileData.content.length,
          encodedContentLength: encodedContent.length,
          billType: fileData.billType,
        });

        // Validate the filename (basic check)
        if (!localFileName || localFileName.trim() === "") {
          setToastMessage("Invalid filename. Cannot move to local storage.");
          setShowToast(true);
          return;
        }

        // Check if file already exists locally
        const fileExists = await props.store._checkKey(localFileName);
        if (fileExists) {
          setToastMessage(
            `File "${localFileName}" already exists in local storage.`
          );
          setShowToast(true);
          return;
        }

        // Create a local file
        const localFile = new LocalFile(
          new Date().toString(),
          new Date().toString(),
          encodedContent, // Use URL-encoded content
          localFileName, // Use filename without server_ prefix
          fileData.billType,
          false // isEncrypted = false for server files
        );

        console.log("Local file created:", {
          name: localFile.name,
          contentLength: localFile.content.length,
          billType: localFile.billType,
          created: localFile.created,
          modified: localFile.modified,
        });

        // Save to local storage
        await props.store._saveFile(localFile);
        console.log("File saved to local storage successfully");

        // Verify the file was saved correctly
        const savedData = await props.store._getFile(localFileName);
        console.log("Verification - saved file data:", {
          name: savedData.name,
          contentLength: savedData.content?.length,
          billType: savedData.billType,
          hasContent: !!savedData.content,
        });

        setToastMessage(`File moved to local storage as ${localFile.name}`);
        setShowToast(true);

        // Refresh the file list
        await renderFileList();
      } else {
        console.error("Invalid file structure:", fileData);
        setToastMessage("Invalid file format. Cannot move to local storage.");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error moving file to local storage:", error);
      setToastMessage("Failed to move file to local storage");
      setShowToast(true);
    }
  };

  // Render file list
  const renderFileList = async () => {
    let content;
    if (fileSource === "local") {
      const localFiles = await props.store._getAllFiles();
      const filesArray = Object.keys(localFiles).map((key) => ({
        key,
        name: key,
        date: localFiles[key].modified,
        isEncrypted: localFiles[key].isEncrypted,
        type: "local",
      }));
      const filteredFiles = filterFilesBySearch(filesArray, searchQuery);
      if (filteredFiles.length === 0) {
        content = (
          <IonList>
            <IonItem>
              <IonLabel>
                {searchQuery.trim()
                  ? `No files found matching "${searchQuery}"`
                  : "No local files found"}
              </IonLabel>
            </IonItem>
          </IonList>
        );
      } else {
        const groupedFiles = groupFilesByDate(filteredFiles);
        content = (
          <IonList>
            {Object.entries(groupedFiles).map(([dateHeader, files]) => (
              <div key={`local-group-${dateHeader}`}>
                <IonItem color="light" className="date-header-item">
                  <IonLabel>
                    <h2
                      className="date-header-text"
                      style={{ color: "var(--ion-color-primary)" }}
                    >
                      {dateHeader}
                    </h2>
                  </IonLabel>
                </IonItem>
                {(files as any[]).map((file) => (
                  <IonItemGroup key={`local-${file.key}`}>
                    <IonItem
                      className="mobile-file-item"
                      onClick={() => editFile(file.key)}
                    >
                      <IonIcon
                        icon={file.isEncrypted ? key : documentText}
                        slot="start"
                        className={`file-icon ${
                          file.isEncrypted ? "encrypted-icon" : "document-icon"
                        }`}
                        color={file.isEncrypted ? "warning" : undefined}
                      />
                      <IonLabel className="mobile-file-label">
                        <h3>{file.name}</h3>
                        <p>
                          Local file • {_formatDate(file.date)}
                          {file.isEncrypted && " • 🔒 Password Protected"}
                        </p>
                      </IonLabel>
                      <IonBadge
                        color={file.isEncrypted ? "warning" : "secondary"}
                        slot="end"
                        className="mobile-badge"
                      >
                        {file.isEncrypted ? "ENCRYPTED" : "LOCAL"}
                      </IonBadge>
                      <IonIcon
                        icon={trash}
                        color="danger"
                        slot="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFile(file.key);
                        }}
                      />
                    </IonItem>
                  </IonItemGroup>
                ))}
              </div>
            ))}
          </IonList>
        );
      }
    } else if (fileSource === "blockchain") {
      if (!blockchainFiles || blockchainFiles.length === 0) {
        content = (
          <IonList>
            {filesLoading && (
              <IonItem>
                <IonSpinner name="circular" slot="start" />
                <IonLabel>Loading blockchain files...</IonLabel>
              </IonItem>
            )}
            {!filesLoading && (
              <IonItem>
                <IonLabel>No blockchain files found</IonLabel>
              </IonItem>
            )}
          </IonList>
        );
      } else {
        const filesArray = blockchainFiles.map((file, index) => ({
          ...file,
          date: new Date(Number(file.timestamp) * 1000).toISOString(),
          type: "blockchain",
          index,
        }));
        const filteredFiles = filterFilesBySearch(filesArray, searchQuery);
        if (filteredFiles.length === 0) {
          content = (
            <IonList>
              <IonItem>
                <IonLabel>
                  {searchQuery.trim()
                    ? `No files found matching "${searchQuery}"`
                    : "No blockchain files found"}
                </IonLabel>
              </IonItem>
            </IonList>
          );
        } else {
          const groupedFiles = groupFilesByDate(filteredFiles);
          content = (
            <IonList>
              {filesLoading && (
                <IonItem>
                  <IonSpinner name="circular" slot="start" />
                  <IonLabel>Loading blockchain files...</IonLabel>
                </IonItem>
              )}
              {!filesLoading &&
                Object.entries(groupedFiles).map(([dateHeader, files]) => (
                  <div key={`blockchain-group-${dateHeader}`}>
                    <IonItem color="light" className="date-header-item">
                      <IonLabel>
                        <h2
                          className="date-header-text"
                          style={{ color: "var(--ion-color-primary)" }}
                        >
                          {dateHeader}
                        </h2>
                      </IonLabel>
                    </IonItem>
                    {(files as any[]).map((file) => {
                      const isLoading = loadingFile === file.file_name;
                      return (
                        <IonItemGroup key={`blockchain-${file.index}`}>
                          <IonItem
                            className="mobile-file-item"
                            onClick={() =>
                              !isLoading && loadFromBlockchain(file)
                            }
                          >
                            <IonIcon
                              icon={cloudOutline}
                              slot="start"
                              className="file-icon blockchain-icon"
                            />
                            <IonLabel className="mobile-file-label">
                              <h3>{file.file_name}</h3>
                              <p>
                                Blockchain file •{" "}
                                {new Date(
                                  Number(file.timestamp) * 1000
                                ).toLocaleString()}
                              </p>
                              <p>IPFS: {file.ipfs_cid.substring(0, 10)}...</p>
                            </IonLabel>
                            <IonBadge
                              color="primary"
                              slot="end"
                              className="mobile-badge"
                            >
                              BLOCKCHAIN
                            </IonBadge>
                            {isLoading && (
                              <IonSpinner name="circular" slot="end" />
                            )}
                          </IonItem>
                        </IonItemGroup>
                      );
                    })}
                  </div>
                ))}
            </IonList>
          );
        }
      }
    } else if (fileSource === "server") {
      if (!serverFilesService.isAuthenticated()) {
        content = (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Server Files</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>Please login to access your server files.</p>
              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <IonButton onClick={() => setShowLoginModal(true)}>
                  <IonIcon icon={logIn} slot="start" />
                  Login
                </IonButton>
                <IonButton
                  fill="outline"
                  onClick={() => setShowRegisterModal(true)}
                >
                  <IonIcon icon={personAdd} slot="start" />
                  Register
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        );
      } else {
        if (serverFilesLoading) {
          content = (
            <IonList>
              <IonItem>
                <IonSpinner name="circular" slot="start" />
                <IonLabel>Loading server files...</IonLabel>
              </IonItem>
            </IonList>
          );
        } else if (serverFiles.length === 0) {
          content = (
            <IonList>
              <IonItem>
                <IonLabel>
                  {searchQuery.trim()
                    ? `No files found matching "${searchQuery}"`
                    : "No server files found"}
                </IonLabel>
              </IonItem>
            </IonList>
          );
        } else {
          const filteredFiles = filterFilesBySearch(serverFiles, searchQuery);
          if (filteredFiles.length === 0) {
            content = (
              <IonList>
                <IonItem>
                  <IonLabel>
                    {searchQuery.trim()
                      ? `No files found matching "${searchQuery}"`
                      : "No server files found"}
                  </IonLabel>
                </IonItem>
              </IonList>
            );
          } else {
            const groupedFiles = groupFilesByDate(
              filteredFiles.map((file) => ({
                ...file,
                date: file.created_at,
                name: file.filename,
              }))
            );
            content = (
              <IonList>
                {Object.entries(groupedFiles).map(([dateHeader, files]) => (
                  <div key={`server-group-${dateHeader}`}>
                    <IonItem color="light" className="date-header-item">
                      <IonLabel>
                        <h2
                          className="date-header-text"
                          style={{ color: "var(--ion-color-primary)" }}
                        >
                          {dateHeader}
                        </h2>
                      </IonLabel>
                    </IonItem>
                    {(files as any[]).map((file) => {
                      const isDeleting = deletingFile === file.id;
                      return (
                        <IonItemGroup key={`server-${file.id}`}>
                          <IonItem className="mobile-file-item">
                            <IonIcon
                              icon={server}
                              slot="start"
                              className="file-icon server-icon"
                            />
                            <IonLabel className="mobile-file-label">
                              <h3>{file.filename}</h3>
                              <p>
                                Server file • {_formatDate(file.created_at)}
                              </p>
                              <p>
                                Size: {(file.file_size / 1024).toFixed(2)} KB
                                {file.filename.startsWith("server_") &&
                                  " • 📄 Invoice File"}
                              </p>
                            </IonLabel>
                            <IonBadge
                              color="tertiary"
                              slot="end"
                              className="mobile-badge"
                            >
                              SERVER
                            </IonBadge>
                            {file.filename.startsWith("server_") && (
                              <IonIcon
                                icon={download}
                                color="success"
                                slot="end"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveToLocal(file);
                                }}
                                title="Move to Local Storage"
                              />
                            )}
                            <IonIcon
                              icon={trash}
                              color="danger"
                              slot="end"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFileDelete(file.id);
                              }}
                              style={{ opacity: isDeleting ? 0.5 : 1 }}
                            />
                            {isDeleting && (
                              <IonSpinner name="circular" slot="end" />
                            )}
                          </IonItem>
                        </IonItemGroup>
                      );
                    })}
                  </div>
                ))}
              </IonList>
            );
          }
        }
      }
    }
    setFileListContent(content);
  };

  useEffect(() => {
    renderFileList();
    // eslint-disable-next-line
  }, [
    props.file,
    fileSource,
    blockchainFiles,
    filesLoading,
    searchQuery,
    serverFiles,
    serverFilesLoading,
  ]);

  useEffect(() => {
    if (fileSource === "server" && serverFilesService.isAuthenticated()) {
      loadServerFiles();
    }
  }, [fileSource]);

  return (
    <IonPage className={isDarkMode ? "dark-theme" : ""}>
      <IonHeader className="files-modal-header">
        <IonToolbar>
          <IonTitle className="files-modal-title">📁 File Manager</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="files-modal-content">
          <IonSegment
            className="smaller-segment-text"
            value={fileSource}
            onIonChange={(e) =>
              setFileSource(e.detail.value as "local" | "blockchain" | "server")
            }
          >
            <IonSegmentButton value="local">
              <IonLabel>Local Files</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="blockchain">
              <IonLabel>Blockchain Files</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="server">
              <IonLabel>Server Files</IonLabel>
            </IonSegmentButton>
          </IonSegment>
          <div style={{ padding: "16px 16px 8px 16px" }}>
            <IonSearchbar
              placeholder="Search files by name..."
              value={searchQuery}
              onIonInput={(e) => setSearchQuery(e.detail.value!)}
              onIonClear={() => setSearchQuery("")}
              showClearButton="focus"
              debounce={300}
            />
          </div>
          {fileSource === "server" && serverFilesService.isAuthenticated() && (
            <div
              style={{
                padding: "0 16px 8px 16px",
                display: "flex",
                gap: "8px",
              }}
            >
              <IonButton size="small" fill="outline" onClick={handleLogout}>
                Logout
              </IonButton>
            </div>
          )}
        </div>
        <div className="files-scrollable-container">{fileListContent}</div>
      </IonContent>

      {/* Login Modal */}
      <IonModal
        isOpen={showLoginModal}
        onDidDismiss={() => setShowLoginModal(false)}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Login</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: "16px" }}>
            <IonInput
              label="Email"
              type="email"
              value={loginCredentials.email}
              onIonInput={(e) =>
                setLoginCredentials({
                  ...loginCredentials,
                  email: e.detail.value!,
                })
              }
              placeholder="Enter your email"
            />
            <IonInput
              label="Password"
              type="password"
              value={loginCredentials.password}
              onIonInput={(e) =>
                setLoginCredentials({
                  ...loginCredentials,
                  password: e.detail.value!,
                })
              }
              placeholder="Enter your password"
            />
            <div style={{ marginTop: "16px" }}>
              <IonButton expand="block" onClick={handleLogin}>
                Login
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonModal>

      {/* Register Modal */}
      <IonModal
        isOpen={showRegisterModal}
        onDidDismiss={() => setShowRegisterModal(false)}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Register</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: "16px" }}>
            <IonInput
              label="Name"
              type="text"
              value={registerCredentials.name}
              onIonInput={(e) =>
                setRegisterCredentials({
                  ...registerCredentials,
                  name: e.detail.value!,
                })
              }
              placeholder="Enter your name"
            />
            <IonInput
              label="Email"
              type="email"
              value={registerCredentials.email}
              onIonInput={(e) =>
                setRegisterCredentials({
                  ...registerCredentials,
                  email: e.detail.value!,
                })
              }
              placeholder="Enter your email"
            />
            <IonInput
              label="Password"
              type="password"
              value={registerCredentials.password}
              onIonInput={(e) =>
                setRegisterCredentials({
                  ...registerCredentials,
                  password: e.detail.value!,
                })
              }
              placeholder="Enter your password"
            />
            <div style={{ marginTop: "16px" }}>
              <IonButton expand="block" onClick={handleRegister}>
                Register
              </IonButton>
            </div>
          </div>
        </IonContent>
      </IonModal>

      <IonAlert
        animated
        isOpen={showAlert1}
        onDidDismiss={() => setShowAlert1(false)}
        header="Delete file"
        message={"Do you want to delete the " + currentKey + " file?"}
        buttons={[
          { text: "No", role: "cancel" },
          {
            text: "Yes",
            handler: () => {
              if (currentKey) {
                props.store._deleteFile(currentKey);
                loadDefault();
                setCurrentKey(null);
                renderFileList();
              }
            },
          },
        ]}
      />
      <IonAlert
        animated
        isOpen={showPasswordAlert}
        onDidDismiss={() => {
          setShowPasswordAlert(false);
          setFileRequiringPassword(null);
          setPasswordForFile("");
        }}
        header="Password Required"
        message={`Enter password to access "${fileRequiringPassword}"`}
        inputs={[
          {
            name: "password",
            type: "password",
            placeholder: "Enter password",
            value: passwordForFile,
          },
        ]}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
            handler: () => {
              setFileRequiringPassword(null);
              setPasswordForFile("");
            },
          },
          {
            text: "Open",
            handler: (alertData) => {
              if (alertData.password && fileRequiringPassword) {
                loadFileWithPassword(fileRequiringPassword, alertData.password);
                setFileRequiringPassword(null);
                setPasswordForFile("");
              } else {
                setToastMessage("Please enter a password");
                setShowToast(true);
                return false;
              }
            },
          },
        ]}
      />
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="top"
      />
    </IonPage>
  );
};

export default Files;
