import React, { useState, useEffect } from "react";
import {
  IonAlert,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonButtons,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonToast,
  IonSpinner,
} from "@ionic/react";
import {
  chevronForward,
  layers,
  close,
  phonePortraitOutline,
  tabletPortraitOutline,
  desktopOutline,
  filterOutline,
  cloudOutline,
  refreshOutline,
} from "ionicons/icons";
import { useTheme } from "../../contexts/ThemeContext";
import { useInvoice } from "../../contexts/InvoiceContext";
import { useHistory } from "react-router-dom";
import { DATA } from "../../templates-data";
import { tempMeta } from "../../templates-meta";
import { LocalFile } from "../Storage/LocalStorage";
import {
  getFirebaseTemplateMetadata,
  getFirebaseTemplateData,
  validateTemplateStructure,
  saveFirebaseTemplateToLocalStorage,
  FirebaseTemplateMeta,
  FirebaseTemplateData,
} from "../../firebase/templateService";

// Add CSS for spin animation
const spinKeyframes = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

// Inject CSS into the document head
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileCreated?: (fileName: string, templateId: number) => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onFileCreated,
}) => {
  const { isDarkMode } = useTheme();
  const { store, updateSelectedFile, updateBillType } = useInvoice();
  const history = useHistory();

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showFileNamePrompt, setShowFileNamePrompt] = useState(false);
  const [selectedTemplateForFile, setSelectedTemplateForFile] = useState<
    number | null
  >(null);
  const [newFileName, setNewFileName] = useState("");
  const [templateFilter, setTemplateFilter] = useState<
    "all" | "web" | "mobile" | "tablet" | "more"
  >("all");
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // Firebase templates state
  const [firebaseTemplates, setFirebaseTemplates] = useState<
    FirebaseTemplateMeta[]
  >([]);
  const [isLoadingFirebaseTemplates, setIsLoadingFirebaseTemplates] =
    useState(false);
  const [firebaseTemplatesError, setFirebaseTemplatesError] = useState<
    string | null
  >(null);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 692);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Load Firebase templates when "more" tab is selected
  useEffect(() => {
    if (templateFilter === "more" && firebaseTemplates.length === 0) {
      loadFirebaseTemplates();
    }
  }, [templateFilter]);

  const loadFirebaseTemplates = async () => {
    setIsLoadingFirebaseTemplates(true);
    setFirebaseTemplatesError(null);

    try {
      const templates = await getFirebaseTemplateMetadata();
      setFirebaseTemplates(templates);
    } catch (error) {
      console.error("Error loading Firebase templates:", error);
      setFirebaseTemplatesError(
        "Failed to load templates from Firebase. Please try again."
      );
    } finally {
      setIsLoadingFirebaseTemplates(false);
    }
  };

  const refreshFirebaseTemplates = () => {
    setFirebaseTemplates([]);
    loadFirebaseTemplates();
  };

  const getTemplateMetadata = (templateId: number) => {
    return tempMeta.find((meta) => meta.template_id === templateId);
  };

  // Categorize templates based on their metadata category
  const categorizeTemplate = (template_id: number) => {
    const metadata = getTemplateMetadata(template_id);
    if (!metadata?.category) return "web";

    const category = metadata.category.toLowerCase();
    if (category === "mobile") {
      return "mobile";
    } else if (category === "tablet") {
      return "tablet";
    } else {
      return "web";
    }
  };

  // Get categorized templates
  const getCategorizedTemplates = () => {
    const templates = tempMeta;
    const categorized = {
      web: templates.filter((t) => {
        return categorizeTemplate(t.template_id) === "web";
      }),
      mobile: templates.filter((t) => {
        return categorizeTemplate(t.template_id) === "mobile";
      }),
      tablet: templates.filter((t) => {
        return categorizeTemplate(t.template_id) === "tablet";
      }),
    };
    return categorized;
  };

  // Get filtered templates based on current filter
  const getFilteredTemplates = () => {
    if (templateFilter === "more") {
      return firebaseTemplates;
    }

    const categorized = getCategorizedTemplates();

    if (templateFilter === "all") {
      // Return in order: web, mobile, tablet
      return [...categorized.web, ...categorized.mobile, ...categorized.tablet];
    } else {
      return categorized[templateFilter] || [];
    }
  };

  const handleTemplateSelect = (
    templateId: number,
    isFirebaseTemplate = false
  ) => {
    setSelectedTemplateForFile(templateId);
    setShowFileNamePrompt(true);

    // Store whether this is a Firebase template
    if (isFirebaseTemplate) {
      (window as any).selectedTemplateIsFirebase = true;
    } else {
      (window as any).selectedTemplateIsFirebase = false;
    }
  };

  // Reset template filter when modal closes
  const handleModalClose = () => {
    setTemplateFilter("all");
    setSelectedTemplateForFile(null);
    setNewFileName("");
    setShowFileNamePrompt(false);
    setFirebaseTemplatesError(null);
    (window as any).selectedTemplateIsFirebase = false;
    onClose();
  };

  /* Utility functions */
  const _validateName = async (filename: string) => {
    filename = filename.trim();
    if (filename === "Untitled") {
      return {
        isValid: false,
        message: "cannot update Untitled file! Use Save As Button to save.",
      };
    } else if (filename === "" || !filename) {
      return {
        isValid: false,
        message: "Filename cannot be empty",
      };
    } else if (filename.length > 30) {
      return {
        isValid: false,
        message: "Filename too long",
      };
    } else if (/^[a-zA-Z0-9- ]*$/.test(filename) === false) {
      return {
        isValid: false,
        message: "Special Characters cannot be used",
      };
    } else if (await store._checkKey(filename)) {
      return {
        isValid: false,
        message: "Filename already exists",
      };
    }
    return {
      isValid: true,
      message: "",
    };
  };

  // Create new file with template
  const createNewFileWithTemplate = async (
    templateId: number,
    fileName: string
  ) => {
    try {
      // Validate filename first
      const validation = await _validateName(fileName);
      if (!validation.isValid) {
        setToastMessage(validation.message);
        setShowToast(true);
        return;
      }

      const isFirebaseTemplate = (window as any).selectedTemplateIsFirebase;
      let templateData: any;
      let templateName: string;

      if (isFirebaseTemplate) {
        // Load Firebase template
        setToastMessage("Loading template from Firebase...");
        setShowToast(true);

        try {
          const firebaseTemplate = await getFirebaseTemplateData(templateId);
          if (!firebaseTemplate) {
            setToastMessage("Firebase template not found");
            setShowToast(true);
            return;
          }

          // Validate Firebase template structure
          if (!validateTemplateStructure(firebaseTemplate)) {
            setToastMessage("Invalid Firebase template structure");
            setShowToast(true);
            return;
          }

          templateData = firebaseTemplate;
          templateName = firebaseTemplate.template;

          // Save to local storage for future offline access
          saveFirebaseTemplateToLocalStorage(templateId, firebaseTemplate);
        } catch (error) {
          console.error("Error loading Firebase template:", error);
          setToastMessage("Failed to load Firebase template");
          setShowToast(true);
          return;
        }
      } else {
        // Use local template
        templateData = DATA[templateId];
        if (!templateData) {
          setToastMessage("Template not found");
          setShowToast(true);
          return;
        }
        templateName = templateData.template;
      }

      const mscContent = templateData.msc;
      const jsonMsc = JSON.stringify(mscContent);
      if (!mscContent) {
        setToastMessage("Error creating template content");
        setShowToast(true);
        return;
      }

      // Find the active footer index, default to 1 if none found
      const activeFooter = templateData.footers?.find(
        (footer: any) => footer.isActive
      );
      const activeFooterIndex = activeFooter ? activeFooter.index : 1;

      const now = new Date().toISOString();
      const newFile = new LocalFile(
        now,
        now,
        encodeURIComponent(jsonMsc),
        fileName,
        activeFooterIndex,
        templateId,
        false
      );

      await store._saveFile(newFile);

      setToastMessage(`File "${fileName}" created with ${templateName}`);
      setShowToast(true);

      // Reset modal state
      setShowFileNamePrompt(false);
      setSelectedTemplateForFile(null);
      setNewFileName("");
      handleModalClose();

      updateSelectedFile(fileName);
      updateBillType(activeFooterIndex);

      // Call the callback if provided
      if (onFileCreated) {
        onFileCreated(fileName, templateId);
      }

      setTimeout(() => {
        const link = document.createElement("a");
        link.href = `/app/editor/${fileName}`;
        link.click();
      }, 200);
    } catch (error) {
      console.error("Error creating file:", error);
      setToastMessage("Failed to create file");
      setShowToast(true);
    }
  };

  // Helper function to render individual template items
  const renderTemplateItem = (template: any, keyPrefix?: string) => {
    const isFirebaseTemplate = keyPrefix === "firebase";
    let metadata: any;
    let templateName: string;
    let category: string;
    let footers: any[] = [];

    if (isFirebaseTemplate) {
      // Firebase template
      metadata = template;
      templateName = template.name || "Unknown Template";
      category = template.category || "unknown";
    } else {
      // Local template
      metadata = getTemplateMetadata(
        template.templateId || template.template_id
      );
      templateName =
        metadata?.name ||
        template.template ||
        template.name ||
        "Unknown Template";
      category = categorizeTemplate(
        template.templateId || template.template_id
      );

      // Get the template data from DATA to access footers
      const templateData = DATA[template.templateId || template.template_id];
      footers = templateData?.footers || [];
    }

    return (
      <div
        key={
          keyPrefix
            ? `${keyPrefix}-${template.templateId || template.template_id}`
            : template.templateId || template.template_id
        }
        onClick={() =>
          handleTemplateSelect(
            template.templateId || template.template_id,
            isFirebaseTemplate
          )
        }
        style={{
          border: `1px solid ${
            isDarkMode
              ? "var(--ion-color-step-200)"
              : "var(--ion-color-step-150)"
          }`,
          borderRadius: "8px",
          padding: "12px",
          marginBottom: "12px",
          cursor: "pointer",
          backgroundColor: isDarkMode
            ? "var(--ion-color-step-50)"
            : "var(--ion-background-color)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          transition: "all 0.2s ease",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = isDarkMode
            ? "var(--ion-color-step-100)"
            : "var(--ion-color-step-50)";
          e.currentTarget.style.borderColor = isDarkMode
            ? "var(--ion-color-step-300)"
            : "var(--ion-color-step-200)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = isDarkMode
            ? "var(--ion-color-step-50)"
            : "var(--ion-background-color)";
          e.currentTarget.style.borderColor = isDarkMode
            ? "var(--ion-color-step-200)"
            : "var(--ion-color-step-150)";
        }}
      >
        {/* Template Image */}
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "6px",
            overflow: "hidden",
            backgroundColor: isDarkMode
              ? "var(--ion-color-step-100)"
              : "var(--ion-color-step-50)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            border: `1px solid ${
              isDarkMode
                ? "var(--ion-color-step-200)"
                : "var(--ion-color-step-150)"
            }`,
          }}
        >
          {metadata?.ImageUri ? (
            <img
              src={
                metadata.ImageUri.startsWith("data:")
                  ? metadata.ImageUri
                  : `data:image/png;base64,${metadata.ImageUri}`
              }
              alt={metadata.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <IonIcon
              icon={isFirebaseTemplate ? cloudOutline : layers}
              style={{
                fontSize: "24px",
                color: isDarkMode
                  ? "var(--ion-color-step-400)"
                  : "var(--ion-color-step-500)",
              }}
            />
          )}
        </div>

        {/* Template Info */}
        <div style={{ flex: 1 }}>
          <h3
            style={{
              margin: "0 0 4px 0",
              fontSize: "15px",
              fontWeight: "600",
              color: isDarkMode
                ? "var(--ion-color-step-750)"
                : "var(--ion-color-step-650)",
              lineHeight: "1.3",
            }}
          >
            {templateName}
            {isFirebaseTemplate && (
              <IonIcon
                icon={cloudOutline}
                style={{
                  fontSize: "12px",
                  marginLeft: "6px",
                  color: isDarkMode
                    ? "var(--ion-color-primary)"
                    : "var(--ion-color-primary)",
                }}
              />
            )}
          </h3>
          <p
            style={{
              margin: "0 0 6px 0",
              fontSize: "12px",
              color: isDarkMode
                ? "var(--ion-color-step-500)"
                : "var(--ion-color-step-450)",
              fontWeight: "400",
            }}
          >
            {isFirebaseTemplate
              ? template.description || "Firebase template"
              : `${footers.length} footer${footers.length !== 1 ? "s" : ""}`}
          </p>
          {/* Category Badge */}
          <div
            style={{
              fontSize: "10px",
              padding: "2px 6px",
              borderRadius: "4px",
              display: "inline-block",
              fontWeight: "500",
              letterSpacing: "0.3px",
              backgroundColor: isDarkMode
                ? "var(--ion-color-step-150)"
                : "var(--ion-color-step-100)",
              color: isDarkMode
                ? "var(--ion-color-step-600)"
                : "var(--ion-color-step-500)",
              border: `1px solid ${
                isDarkMode
                  ? "var(--ion-color-step-200)"
                  : "var(--ion-color-step-150)"
              }`,
              textTransform: "uppercase",
            }}
          >
            {category}
          </div>
        </div>

        {/* Arrow Icon */}
        <IonIcon
          icon={chevronForward}
          style={{
            fontSize: "18px",
            color: isDarkMode
              ? "var(--ion-color-step-400)"
              : "var(--ion-color-step-350)",
            opacity: 0.7,
          }}
        />
      </div>
    );
  };

  const filteredTemplates = getFilteredTemplates();
  const categorized = getCategorizedTemplates();

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={handleModalClose}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Choose Template</IonTitle>
            <IonButtons slot="end">
              <IonButton fill="clear" onClick={handleModalClose}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          {/* Filter Segment */}
          <div
            style={{
              padding: "16px",
              background: isDarkMode
                ? "var(--ion-color-step-50)"
                : "var(--ion-color-step-50)",
              borderBottom: `1px solid ${
                isDarkMode
                  ? "var(--ion-color-step-200)"
                  : "var(--ion-color-step-150)"
              }`,
              margin: "0",
            }}
          >
            <IonSegment
              value={templateFilter}
              onIonChange={(e) =>
                setTemplateFilter(
                  e.detail.value as "all" | "web" | "mobile" | "tablet" | "more"
                )
              }
              style={{
                background: isDarkMode
                  ? "var(--ion-color-step-150)"
                  : "var(--ion-background-color)",
                borderRadius: "8px",
                padding: "3px",
                border: `1px solid ${
                  isDarkMode
                    ? "var(--ion-color-step-250)"
                    : "var(--ion-color-step-150)"
                }`,
                boxShadow: "none",
                "--background": isDarkMode
                  ? "var(--ion-color-step-150)"
                  : "var(--ion-background-color)",
                "--background-checked": isDarkMode
                  ? "var(--ion-color-primary)"
                  : "var(--ion-color-primary)",
                "--color": isDarkMode ? "#ffffff" : "#000000",
                "--color-checked": "#ffffff",
              }}
            >
              <IonSegmentButton
                value="all"
                style={{
                  minHeight: "36px",
                  "--background": isDarkMode
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.05)",
                  "--background-checked": isDarkMode
                    ? "var(--ion-color-primary)"
                    : "var(--ion-color-primary)",
                  "--color": isDarkMode ? "#ffffff" : "#000000",
                  "--color-checked": "#ffffff",
                }}
              >
                <IonIcon
                  icon={filterOutline}
                  style={{
                    fontSize: "16px",
                    color:
                      templateFilter === "all"
                        ? "#ffffff"
                        : isDarkMode
                        ? "#ffffff"
                        : "#000000",
                  }}
                />
                <IonText
                  style={{
                    fontSize: "11px",
                    fontWeight: "500",
                    marginLeft: "4px",
                    marginBottom: "15px",
                    color:
                      templateFilter === "all"
                        ? "#ffffff"
                        : isDarkMode
                        ? "#ffffff"
                        : "#000000",
                  }}
                >
                  All (
                  {categorized.web.length +
                    categorized.mobile.length +
                    categorized.tablet.length}
                  )
                </IonText>
              </IonSegmentButton>
              <IonSegmentButton
                value="web"
                style={{
                  minHeight: "36px",
                  "--background": isDarkMode
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.05)",
                  "--background-checked": isDarkMode
                    ? "var(--ion-color-primary)"
                    : "var(--ion-color-primary)",
                  "--color": isDarkMode ? "#ffffff" : "#000000",
                  "--color-checked": "#ffffff",
                }}
              >
                <IonIcon
                  icon={desktopOutline}
                  style={{
                    fontSize: "16px",
                    color:
                      templateFilter === "web"
                        ? "#ffffff"
                        : isDarkMode
                        ? "#ffffff"
                        : "#000000",
                  }}
                />
                <IonText
                  style={{
                    fontSize: "11px",
                    fontWeight: "500",
                    marginLeft: "4px",
                    marginBottom: "15px",
                    color:
                      templateFilter === "web"
                        ? "#ffffff"
                        : isDarkMode
                        ? "#ffffff"
                        : "#000000",
                  }}
                >
                  Web ({categorized.web.length})
                </IonText>
              </IonSegmentButton>
              <IonSegmentButton
                value="mobile"
                style={{
                  minHeight: "36px",
                  "--background": isDarkMode
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.05)",
                  "--background-checked": isDarkMode
                    ? "var(--ion-color-primary)"
                    : "var(--ion-color-primary)",
                  "--color": isDarkMode ? "#ffffff" : "#000000",
                  "--color-checked": "#ffffff",
                }}
              >
                <IonIcon
                  icon={phonePortraitOutline}
                  style={{
                    fontSize: "16px",
                    color:
                      templateFilter === "mobile"
                        ? "#ffffff"
                        : isDarkMode
                        ? "#ffffff"
                        : "#000000",
                  }}
                />
                <IonText
                  style={{
                    fontSize: "11px",
                    fontWeight: "500",
                    marginLeft: "4px",
                    marginBottom: "15px",
                    color:
                      templateFilter === "mobile"
                        ? "#ffffff"
                        : isDarkMode
                        ? "#ffffff"
                        : "#000000",
                  }}
                >
                  Mobile ({categorized.mobile.length})
                </IonText>
              </IonSegmentButton>
              <IonSegmentButton
                value="tablet"
                style={{
                  minHeight: "36px",
                  "--background": isDarkMode
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.05)",
                  "--background-checked": isDarkMode
                    ? "var(--ion-color-primary)"
                    : "var(--ion-color-primary)",
                  "--color": isDarkMode ? "#ffffff" : "#000000",
                  "--color-checked": "#ffffff",
                }}
              >
                <IonIcon
                  icon={tabletPortraitOutline}
                  style={{
                    fontSize: "16px",
                    color:
                      templateFilter === "tablet"
                        ? "#ffffff"
                        : isDarkMode
                        ? "#ffffff"
                        : "#000000",
                  }}
                />
                <IonText
                  style={{
                    fontSize: "11px",
                    fontWeight: "500",
                    marginLeft: "4px",
                    marginBottom: "15px",
                    color:
                      templateFilter === "tablet"
                        ? "#ffffff"
                        : isDarkMode
                        ? "#ffffff"
                        : "#000000",
                  }}
                >
                  Tablet ({categorized.tablet.length})
                </IonText>
              </IonSegmentButton>
              <IonSegmentButton
                value="more"
                style={{
                  minHeight: "36px",
                  "--background": isDarkMode
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.05)",
                  "--background-checked": isDarkMode
                    ? "var(--ion-color-primary)"
                    : "var(--ion-color-primary)",
                  "--color": isDarkMode ? "#ffffff" : "#000000",
                  "--color-checked": "#ffffff",
                }}
              >
                <IonIcon
                  icon={cloudOutline}
                  style={{
                    fontSize: "16px",
                    color:
                      templateFilter === "more"
                        ? "#ffffff"
                        : isDarkMode
                        ? "#ffffff"
                        : "#000000",
                  }}
                />
                {isLoadingFirebaseTemplates && (
                  <IonIcon
                    icon={refreshOutline}
                    style={{
                      fontSize: "12px",
                      marginLeft: "4px",
                      animation: "spin 1s linear infinite",
                      color:
                        templateFilter === "more"
                          ? "#ffffff"
                          : isDarkMode
                          ? "#ffffff"
                          : "#000000",
                    }}
                  />
                )}
                <IonText
                  style={{
                    fontSize: "11px",
                    fontWeight: "500",
                    marginLeft: "4px",
                    marginBottom: "15px",
                    color:
                      templateFilter === "more"
                        ? "#ffffff"
                        : isDarkMode
                        ? "#ffffff"
                        : "#000000",
                  }}
                >
                  More ({firebaseTemplates.length})
                </IonText>
              </IonSegmentButton>
            </IonSegment>
          </div>

          <div style={{ padding: "16px" }}>
            {templateFilter === "more" && firebaseTemplatesError && (
              <div
                style={{
                  padding: "16px",
                  backgroundColor: isDarkMode
                    ? "var(--ion-color-step-100)"
                    : "var(--ion-color-step-50)",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  border: `1px solid ${
                    isDarkMode
                      ? "var(--ion-color-danger)"
                      : "var(--ion-color-danger)"
                  }`,
                }}
              >
                <IonText color="danger">
                  <p style={{ margin: 0, fontSize: "14px" }}>
                    {firebaseTemplatesError}
                  </p>
                </IonText>
                <IonButton
                  fill="clear"
                  size="small"
                  onClick={refreshFirebaseTemplates}
                  style={{ marginTop: "8px" }}
                >
                  <IonIcon icon={refreshOutline} slot="start" />
                  Retry
                </IonButton>
              </div>
            )}

            {templateFilter === "more" && isLoadingFirebaseTemplates && (
              <div
                style={{
                  textAlign: "center",
                  padding: "32px 16px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <IonSpinner />
                <IonText color="medium">
                  <p style={{ margin: 0 }}>
                    Loading templates from Firebase...
                  </p>
                </IonText>
              </div>
            )}

            {filteredTemplates.length === 0 &&
            !isLoadingFirebaseTemplates &&
            !firebaseTemplatesError ? (
              <IonText color="medium">
                <p style={{ textAlign: "center", padding: "32px 16px" }}>
                  {templateFilter === "more"
                    ? "No templates available in Firebase."
                    : "No templates found in this category."}
                </p>
              </IonText>
            ) : (
              <div>
                {filteredTemplates.map((template) =>
                  renderTemplateItem(
                    template,
                    templateFilter === "more" ? "firebase" : "local"
                  )
                )}
              </div>
            )}
          </div>
        </IonContent>
      </IonModal>

      {/* File Name Prompt Alert */}
      {showFileNamePrompt && selectedTemplateForFile !== null && (
        <IonAlert
          animated
          isOpen={true}
          onDidDismiss={() => {
            setShowFileNamePrompt(false);
            setSelectedTemplateForFile(null);
            setNewFileName("");
            (window as any).selectedTemplateIsFirebase = false;
          }}
          header="Create New File"
          message={
            (window as any).selectedTemplateIsFirebase
              ? `Create a new file from Firebase template`
              : `Create a new ${
                  getTemplateMetadata(selectedTemplateForFile)?.name
                } file`
          }
          inputs={[
            {
              name: "filename",
              type: "text",
              value: newFileName,
              placeholder: "Enter file name",
            },
          ]}
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
              handler: () => {
                setSelectedTemplateForFile(null);
                setNewFileName("");
                (window as any).selectedTemplateIsFirebase = false;
              },
            },
            {
              text: "Create",
              handler: async (data) => {
                const fileName = data.filename?.trim();
                if (!fileName) {
                  setToastMessage("Please enter a file name");
                  setShowToast(true);
                  // Clear the filename and close the alert when validation fails
                  setNewFileName("");
                  setShowFileNamePrompt(false);
                  setSelectedTemplateForFile(null);
                  (window as any).selectedTemplateIsFirebase = false;
                  return false; // Prevent alert from closing automatically
                }

                if (selectedTemplateForFile) {
                  // Validate the filename before creating
                  const validation = await _validateName(fileName);
                  if (!validation.isValid) {
                    setToastMessage(validation.message);
                    setShowToast(true);
                    // Clear the filename and close the alert when validation fails
                    setNewFileName("");
                    setShowFileNamePrompt(false);
                    setSelectedTemplateForFile(null);
                    (window as any).selectedTemplateIsFirebase = false;
                    return false; // Prevent alert from closing automatically
                  }

                  // If validation passes, create the file
                  await createNewFileWithTemplate(
                    selectedTemplateForFile,
                    fileName
                  );
                  return true; // Allow alert to close
                }
                return false;
              },
            },
          ]}
        />
      )}

      {/* Toast for notifications */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color={toastMessage.includes("successfully") ? "success" : "warning"}
        position="top"
      />
    </>
  );
};

export default TemplateModal;
