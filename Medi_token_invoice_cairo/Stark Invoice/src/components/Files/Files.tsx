import React, { useState, useEffect } from "react";
import "./Files.css";
import * as AppGeneral from "../socialcalc/index.js";
import { DATA } from "../../app-data.js";
import { Local, File } from "../Storage/LocalStorage";
import {
  IonIcon,
  IonModal,
  IonItem,
  IonButton,
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
  IonInput,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
} from "@ionic/react";
import {
  fileTrayFull,
  trash,
  create,
  cloud,
  download,
  cloudDownload,
  key,
  documentText,
  folder,
  cloudOutline,
} from "ionicons/icons";
import { useAccount } from "@starknet-react/core";
import { useGetUserFiles } from "../../hooks/useContractRead";
import { downloadFromIPFS } from "../../utils/ipfs";
import { create as createClient } from "@web3-storage/w3up-client";

type DID = `did:${string}:${string}`;

const Files: React.FC<{
  store: Local;
  file: string;
  updateSelectedFile: Function;
  updateBillType: Function;
}> = (props) => {
  const { address, account } = useAccount();
  const {
    files: blockchainFiles,
    isLoading: filesLoading,
    refetchFiles,
  } = useGetUserFiles({
    accountAddress: address as `0x${string}` | undefined,
  });

  const [modal, setModal] = useState(null);
  const [listFiles, setListFiles] = useState(false);
  const [showAlert1, setShowAlert1] = useState(false);
  const [currentKey, setCurrentKey] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [loadingFile, setLoadingFile] = useState<string | null>(null);

  // File source selection
  const [fileSource, setFileSource] = useState<"local" | "blockchain" | "ipfs">(
    "local"
  );
  const [ipfsFiles, setIpfsFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // IPFS account management
  const [userEmail, setUserEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [ipfsClient, setIpfsClient] = useState(null);
  const [userSpace, setUserSpace] = useState(null);
  const [showSpaceSetup, setShowSpaceSetup] = useState(false);
  const [spaceDid, setSpaceDid] = useState("");
  const [isSpaceCreating, setIsSpaceCreating] = useState(false);
  const [showMoveAlert, setShowMoveAlert] = useState(false);
  const [fileToMove, setFileToMove] = useState(null);

  const loadFromBlockchain = async (file: any) => {
    if (!file.ipfs_cid) {
      setToastMessage("No IPFS hash found for this file");
      setShowToast(true);
      return;
    }

    setLoadingFile(file.file_name);
    try {
      // Download JSON data from IPFS
      const jsonString = await downloadFromIPFS(file.ipfs_cid);

      if (!jsonString) {
        throw new Error("Failed to download file from IPFS");
      }

      const jsonData = JSON.parse(jsonString);

      if (!jsonData || typeof jsonData !== "object" || !jsonData.content) {
        throw new Error("Invalid file data from IPFS");
      }

      // Load the spreadsheet content
      AppGeneral.viewFile(file.file_name, jsonData.content);
      props.updateSelectedFile(file.file_name);

      if (jsonData.billType) {
        props.updateBillType(jsonData.billType);
      }

      setToastMessage(`File "${file.file_name}" loaded from blockchain`);
      setShowToast(true);
      setListFiles(false);
    } catch (error) {
      console.error("Error loading file from blockchain:", error);
      setToastMessage("Failed to load file from blockchain");
      setShowToast(true);
    } finally {
      setLoadingFile(null);
    }
  };

  // Initialize IPFS client with email and space

  const initializeIpfsClient = async (email, space) => {
    try {
      console.log(
        "Initializing IPFS client with email:",
        email,
        "and space:",
        space
      );
      setLoading(true);
      const client = await createClient();
      console.log("Client created:", client);

      const account = await client.login(email);
      console.log("Account logged in:", account);
      const knownSpaces = await client.spaces();
      console.log("Known spaces:", knownSpaces);
      for (const knownSpace of knownSpaces) {
        console.log("Known space:", knownSpace.did());
      }
      console.log("Setting current space:", space);
      const currSpace = await client.setCurrentSpace(space);
      console.log("Current space set:", currSpace);

      setUserSpace(space);

      // Store client in state
      setIpfsClient(client);

      localStorage.setItem("ipfsUserEmail", email);
      localStorage.setItem("ipfsUserSpace", userSpace);
      // } else {
      //   // Show space setup UI
      //   setShowSpaceSetup(true);
      // }

      return client;
    } catch (error) {
      console.error("Error initializing IPFS client:", error);
      // alert("Failed to initialize IPFS client. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new space for the user
  const createUserSpace = async () => {
    if (!ipfsClient) return;

    try {
      setIsSpaceCreating(true);

      // Create a new space
      const space = await ipfsClient.createSpace(`${userEmail}'s Space`);

      // Store the space DID
      const spaceDid = space.did();
      setSpaceDid(spaceDid);

      // Set as current space
      await ipfsClient.setCurrentSpace(spaceDid);
      setUserSpace(spaceDid);

      // Save to localStorage for persistence
      localStorage.setItem("ipfsUserSpace", spaceDid);

      setShowSpaceSetup(false);
      setToastMessage("Your IPFS space has been created successfully!");
      setShowToast(true);

      return space;
    } catch (error) {
      console.error("Error creating space:", error);
      setToastMessage("Failed to create IPFS space. Please try again.");
      setShowToast(true);
      return null;
    } finally {
      setIsSpaceCreating(false);
    }
  };

  // Fetch all files from user's IPFS space
  const fetchIPFSFiles = async () => {
    if (!ipfsClient || !userSpace) {
      setToastMessage("Please set up your IPFS account first");
      setShowToast(true);
      setShowEmailInput(true);
      return;
    }

    setLoading(true);
    try {
      const uploads = await ipfsClient.capability.upload.list();
      console.log("IPFS uploads:", uploads.results);

      const filesPromises = uploads.results.map(async (upload) => {
        try {
          const url = `https://${upload.root.toString()}.ipfs.w3s.link`;

          const response = await fetch(url);
          if (!response.ok) {
            console.warn(
              `Failed to fetch directory for ${upload.root.toString()}`
            );
            return null;
          }

          const directoryListing = await response.text();

          // Extract file names from the directory listing
          const fileLinks = directoryListing.match(/<a href="([^"]+)"/g) || [];

          // Process each file in the directory
          const files = await Promise.all(
            fileLinks.map(async (link) => {
              const fileName = link
                .match(/<a href="([^"]+)"/)[1]
                .split("/")
                .pop();
              if (fileName && fileName.endsWith(".json")) {
                const fileUrl = `${url}/${fileName}`;
                try {
                  const fileResponse = await fetch(fileUrl);
                  if (fileResponse.ok) {
                    const fileData = await fileResponse.json();
                    return {
                      name: fileData.name || fileName.replace(".json", ""),
                      created: fileData.created,
                      modified: fileData.modified,
                      cid: upload.root.toString(),
                      path: fileName,
                    };
                  }
                } catch (e) {
                  console.error(`Error fetching file ${fileName}:`, e);
                }
              }
              return null;
            })
          );

          return files.filter((f) => f !== null);
        } catch (e) {
          console.error(
            `Error processing upload ${upload.root.toString()}:`,
            e
          );
          return null;
        }
      });

      const allFiles = (await Promise.all(filesPromises))
        .filter((f) => f !== null)
        .flat();

      setIpfsFiles(allFiles);
    } catch (error) {
      console.error("Error fetching IPFS files:", error);
      setToastMessage("Failed to fetch IPFS files");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Retrieve file from IPFS
  const retrieveFromIPFS = async (cid: string, path: string) => {
    if (!ipfsClient) {
      setToastMessage("Please set up your IPFS account first");
      setShowToast(true);
      return null;
    }

    try {
      const url = `https://${cid}.ipfs.w3s.link/${path}`;
      console.log("Fetching from IPFS URL:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const fileData = await response.json();
      return fileData;
    } catch (error) {
      console.error("IPFS Retrieval Error:", error);
      throw error;
    }
  };

  // Move IPFS file to local storage
  const moveToLocalStorage = async (file: any) => {
    try {
      const fileData = await retrieveFromIPFS(file.cid, file.path);

      if (!fileData) return false;

      // Create a File object for local storage
      const localFile = new File(
        fileData.created || new Date().toString(),
        fileData.modified || new Date().toString(),
        encodeURIComponent(fileData.content),
        fileData.name,
        fileData.billType || 1
      );

      await props.store._saveFile(localFile);
      props.updateSelectedFile(fileData.name);

      return true;
    } catch (error) {
      console.error("Error moving file to localStorage:", error);
      return false;
    }
  };

  // Load IPFS file directly into editor
  const loadFromIPFS = async (file: any) => {
    try {
      setLoadingFile(file.name);
      const fileData = await retrieveFromIPFS(file.cid, file.path);

      if (!fileData) {
        throw new Error("Failed to retrieve file data");
      }

      // Load the spreadsheet content
      AppGeneral.viewFile(file.name, fileData.content);
      props.updateSelectedFile(file.name);

      if (fileData.billType) {
        props.updateBillType(fileData.billType);
      }

      setToastMessage(`File "${file.name}" loaded from IPFS`);
      setShowToast(true);
      setListFiles(false);
    } catch (error) {
      console.error("Error loading file from IPFS:", error);
      setToastMessage("Failed to load file from IPFS");
      setShowToast(true);
    } finally {
      setLoadingFile(null);
    }
  };

  // useEffect hooks
  useEffect(() => {
    const savedEmail = localStorage.getItem("ipfsUserEmail");
    const savedSpace = localStorage.getItem("ipfsUserSpace");

    if (savedEmail && savedSpace) {
      setUserEmail(savedEmail);
      setUserSpace(savedSpace);
      // Initialize client with saved credentials
      initializeIpfsClient(savedEmail, savedSpace);
    }
  }, []);

  useEffect(() => {
    if (
      fileSource === "ipfs" &&
      ipfsClient &&
      userSpace &&
      ipfsFiles.length === 0
    ) {
      fetchIPFSFiles();
    }
  }, [fileSource, ipfsClient, userSpace]);

  useEffect(() => {
    if (listFiles) {
      renderFileList();
    }
  }, [
    listFiles,
    fileSource,
    ipfsFiles,
    ipfsClient,
    userSpace,
    showEmailInput,
    showSpaceSetup,
  ]);

  // Handle email submission for IPFS setup
  const handleEmailSubmit = async () => {
    if (!userEmail || !userEmail.includes("@")) {
      setToastMessage("Please enter a valid email address");
      setShowToast(true);
      return;
    }

    if (!userSpace) {
      setToastMessage("Please enter your Space DID key");
      setShowToast(true);
      return;
    }

    await initializeIpfsClient(userEmail, userSpace);
    setShowEmailInput(false);
  };

  const editFile = (key) => {
    props.store._getFile(key).then((data: any) => {
      AppGeneral.viewFile(key, decodeURIComponent(data.content));
      props.updateSelectedFile(key);
      props.updateBillType(data.billType);

      // Show feedback toast similar to blockchain loading
      setToastMessage(`File "${key}" loaded successfully`);
      setShowToast(true);
    });
  };

  const deleteFile = (key) => {
    setShowAlert1(true);
    setCurrentKey(key);
  };

  const loadDefault = () => {
    const msc = DATA["home"][AppGeneral.getDeviceType()]["msc"];
    AppGeneral.viewFile("default", JSON.stringify(msc));
    props.updateSelectedFile("default");
  };

  const _formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  // Helper function to get date header
  const getDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset hours for accurate comparison
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return "Today";
    } else if (date.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  // Helper function to group files by date
  const groupFilesByDate = (files) => {
    const groups = {};
    files.forEach((file) => {
      const dateHeader = getDateHeader(file.date);
      if (!groups[dateHeader]) {
        groups[dateHeader] = [];
      }
      groups[dateHeader].push(file);
    });

    // Sort groups by date (most recent first)
    const sortedGroups = {};
    const sortedHeaders = Object.keys(groups).sort((a, b) => {
      if (a === "Today") return -1;
      if (b === "Today") return 1;
      if (a === "Yesterday") return -1;
      if (b === "Yesterday") return 1;
      return new Date(b).getTime() - new Date(a).getTime();
    });

    sortedHeaders.forEach((header) => {
      sortedGroups[header] = groups[header].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });

    return sortedGroups;
  };

  const renderFileList = async () => {
    let content;

    if (fileSource === "local") {
      const localFiles = await props.store._getAllFiles();
      const filesArray = Object.keys(localFiles).map((key) => ({
        key,
        name: key,
        date: localFiles[key],
        type: "local",
      }));

      if (filesArray.length === 0) {
        content = (
          <IonList>
            <IonItem>
              <IonLabel>No local files found</IonLabel>
            </IonItem>
          </IonList>
        );
      } else {
        const groupedFiles = groupFilesByDate(filesArray);

        content = (
          <IonList>
            {Object.entries(groupedFiles).map(([dateHeader, files]) => (
              <div key={`local-group-${dateHeader}`}>
                {/* Date Header */}
                <IonItem color="light">
                  <IonLabel>
                    <h2
                      style={{
                        fontWeight: "bold",
                        color: "var(--ion-color-primary)",
                      }}
                    >
                      {dateHeader}
                    </h2>
                  </IonLabel>
                </IonItem>

                {/* Files under this date */}
                {(files as any[]).map((file) => (
                  <IonItemGroup key={`local-${file.key}`}>
                    <IonItem>
                      <IonIcon
                        icon={documentText}
                        slot="start"
                        className="file-icon document-icon"
                      />
                      <IonLabel>
                        <h3>{file.name}</h3>
                        <p>Local file • {_formatDate(file.date)}</p>
                      </IonLabel>
                      <IonBadge color="secondary" slot="end">
                        LOCAL
                      </IonBadge>

                      <IonIcon
                        icon={create}
                        color="warning"
                        slot="end"
                        size="large"
                        onClick={() => {
                          setListFiles(false);
                          editFile(file.key);
                        }}
                      />

                      <IonIcon
                        icon={trash}
                        color="danger"
                        slot="end"
                        size="large"
                        onClick={() => {
                          setListFiles(false);
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
      // Create blockchain files list with date grouping
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

        const groupedFiles = groupFilesByDate(filesArray);

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
                  {/* Date Header */}
                  <IonItem color="light">
                    <IonLabel>
                      <h2
                        style={{
                          fontWeight: "bold",
                          color: "var(--ion-color-primary)",
                        }}
                      >
                        {dateHeader}
                      </h2>
                    </IonLabel>
                  </IonItem>

                  {/* Files under this date */}
                  {(files as any[]).map((file) => {
                    const isLoading = loadingFile === file.file_name;
                    return (
                      <IonItemGroup key={`blockchain-${file.index}`}>
                        <IonItem>
                          <IonIcon
                            icon={cloudOutline}
                            slot="start"
                            className="file-icon blockchain-icon"
                          />
                          <IonLabel>
                            <h3>{file.file_name}</h3>
                            <p>
                              Blockchain file •{" "}
                              {new Date(
                                Number(file.timestamp) * 1000
                              ).toLocaleString()}
                            </p>
                            <p>IPFS: {file.ipfs_cid.substring(0, 10)}...</p>
                          </IonLabel>
                          <IonBadge color="primary" slot="end">
                            BLOCKCHAIN
                          </IonBadge>

                          {isLoading ? (
                            <IonSpinner name="circular" slot="end" />
                          ) : (
                            <IonIcon
                              icon={download}
                              color="primary"
                              slot="end"
                              size="large"
                              onClick={() => loadFromBlockchain(file)}
                            />
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
    } else {
      // IPFS files section
      if (showEmailInput) {
        content = (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Set Up Your IPFS Account</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>Enter your email to create or access your IPFS space</p>
              <IonInput
                type="email"
                placeholder="Your email address"
                value={userEmail}
                onIonChange={(e) => setUserEmail(e.detail.value!)}
              />
              <IonInput
                type="text"
                placeholder="Your Space DID KEY"
                value={userSpace}
                onIonChange={(e) => setUserSpace(e.detail.value!)}
              />
              <IonButton
                expand="block"
                onClick={handleEmailSubmit}
                disabled={loading}
              >
                {loading ? <IonSpinner name="dots" /> : "Continue"}
              </IonButton>
            </IonCardContent>
          </IonCard>
        );
      } else if (showSpaceSetup) {
        content = (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Create Your IPFS Space</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>
                You don't have any IPFS spaces yet. Create one to start storing
                your files.
              </p>
              <IonButton
                expand="block"
                onClick={createUserSpace}
                disabled={isSpaceCreating}
              >
                {isSpaceCreating ? <IonSpinner name="dots" /> : "Create Space"}
              </IonButton>
            </IonCardContent>
          </IonCard>
        );
      } else if (!ipfsClient || !userSpace) {
        content = (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>IPFS Setup Required</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>Please set up your IPFS account to access your files.</p>
              <IonButton expand="block" onClick={() => setShowEmailInput(true)}>
                Set Up IPFS Account
              </IonButton>
            </IonCardContent>
          </IonCard>
        );
      } else {
        // Show IPFS files with date grouping
        if (ipfsFiles.length === 0) {
          content = (
            <>
              <IonCard>
                <IonCardContent>
                  <p>
                    <strong>Your IPFS Space:</strong>{" "}
                    {userSpace ? userSpace.substring(0, 20) + "..." : "Not set"}
                  </p>
                  <IonButton
                    expand="block"
                    onClick={fetchIPFSFiles}
                    disabled={loading}
                  >
                    {loading ? (
                      <IonSpinner name="dots" />
                    ) : (
                      "Refresh IPFS Files"
                    )}
                  </IonButton>
                </IonCardContent>
              </IonCard>

              <IonList>
                {loading ? (
                  <IonItem>
                    <IonSpinner name="circular" slot="start" />
                    <IonLabel>Loading files from IPFS...</IonLabel>
                  </IonItem>
                ) : (
                  <IonItem>
                    <IonLabel>No IPFS files found</IonLabel>
                  </IonItem>
                )}
              </IonList>
            </>
          );
        } else {
          const filesArray = ipfsFiles.map((file, index) => ({
            ...file,
            date: file.modified,
            type: "ipfs",
            index,
          }));

          const groupedFiles = groupFilesByDate(filesArray);

          content = (
            <>
              <IonCard>
                <IonCardContent>
                  <p>
                    <strong>Your IPFS Space:</strong>{" "}
                    {userSpace ? userSpace.substring(0, 20) + "..." : "Not set"}
                  </p>
                  <IonButton
                    expand="block"
                    onClick={fetchIPFSFiles}
                    disabled={loading}
                  >
                    {loading ? (
                      <IonSpinner name="dots" />
                    ) : (
                      "Refresh IPFS Files"
                    )}
                  </IonButton>
                </IonCardContent>
              </IonCard>

              <IonList>
                {loading ? (
                  <IonItem>
                    <IonSpinner name="circular" slot="start" />
                    <IonLabel>Loading files from IPFS...</IonLabel>
                  </IonItem>
                ) : (
                  Object.entries(groupedFiles).map(([dateHeader, files]) => (
                    <div key={`ipfs-group-${dateHeader}`}>
                      {/* Date Header */}
                      <IonItem color="light">
                        <IonLabel>
                          <h2
                            style={{
                              fontWeight: "bold",
                              color: "var(--ion-color-primary)",
                            }}
                          >
                            {dateHeader}
                          </h2>
                        </IonLabel>
                      </IonItem>

                      {/* Files under this date */}
                      {(files as any[]).map((file) => (
                        <IonItemGroup key={`ipfs-${file.cid}-${file.index}`}>
                          <IonItem>
                            <IonIcon
                              icon={cloud}
                              slot="start"
                              className="file-icon cloud-icon"
                            />
                            <IonLabel>
                              <h3>{file.name}</h3>
                              <p>IPFS file • {_formatDate(file.modified)}</p>
                              <p>CID: {file.cid.substring(0, 10)}...</p>
                            </IonLabel>
                            <IonBadge color="tertiary" slot="end">
                              IPFS
                            </IonBadge>

                            {loadingFile === file.name ? (
                              <IonSpinner name="circular" slot="end" />
                            ) : (
                              <>
                                <IonIcon
                                  icon={create}
                                  color="warning"
                                  slot="end"
                                  size="large"
                                  onClick={() => loadFromIPFS(file)}
                                />

                                <IonIcon
                                  icon={cloudDownload}
                                  color="primary"
                                  slot="end"
                                  size="large"
                                  onClick={() => {
                                    setFileToMove(file);
                                    setShowMoveAlert(true);
                                  }}
                                />
                              </>
                            )}
                          </IonItem>
                        </IonItemGroup>
                      ))}
                    </div>
                  ))
                )}
              </IonList>
            </>
          );
        }
      }
    }

    const ourModal = (
      <IonModal
        isOpen={listFiles}
        onDidDismiss={() => {
          setListFiles(false);
          setModal(null);
        }}
      >
        <IonHeader className="files-modal-header">
          <IonToolbar color="primary">
            <IonTitle className="files-modal-title">📁 File Manager</IonTitle>
            <IonButtons slot="end">
              <IonButton
                className="files-close-button"
                fill="solid"
                color="danger"
                size="small"
                onClick={() => {
                  setListFiles(false);
                  setModal(null);
                }}
              >
                ✕ Close
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent>
          <div className="files-modal-content">
            <IonSegment
              value={fileSource}
              onIonChange={(e) =>
                setFileSource(e.detail.value as "local" | "blockchain" | "ipfs")
              }
            >
              <IonSegmentButton value="local">
                <IonLabel>Local Files</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="blockchain">
                <IonLabel>Blockchain Files</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="ipfs">
                <IonLabel>IPFS Files</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </div>

          <div className="files-scrollable-container">{content}</div>
        </IonContent>
      </IonModal>
    );
    setModal(ourModal);
  };

  useEffect(() => {
    renderFileList();
  }, [listFiles]);

  return (
    <React.Fragment>
      <IonIcon
        icon={folder}
        className="ion-padding-end files-icon"
        slot="end"
        size="large"
        data-testid="files-btn"
        onClick={() => {
          setListFiles(true);
        }}
        title="Open File Manager"
      />
      {modal}
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
              props.store._deleteFile(currentKey);
              loadDefault();
              setCurrentKey(null);
            },
          },
        ]}
      />
      <IonAlert
        animated
        isOpen={showMoveAlert}
        onDidDismiss={() => setShowMoveAlert(false)}
        header="Move to Local Storage"
        message={`Do you want to move "${fileToMove?.name}" to your local storage?`}
        buttons={[
          { text: "Cancel", role: "cancel" },
          {
            text: "Move",
            handler: async () => {
              const success = await moveToLocalStorage(fileToMove);
              if (success) {
                setToastMessage(
                  `File "${fileToMove.name}" has been moved to local storage.`
                );
                setShowToast(true);
              } else {
                setToastMessage(
                  `Failed to move file "${fileToMove.name}" to local storage.`
                );
                setShowToast(true);
              }
              setFileToMove(null);
            },
          },
        ]}
      />
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position="bottom"
      />
    </React.Fragment>
  );
};

export default Files;
