import React, { useState, useRef, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonAlert,
  IonToast,
  IonBackButton,
  IonButtons,
  IonProgressBar,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import { cloudUpload, checkmark, warning } from "ionicons/icons";
import { useAuth } from "../contexts/AuthContext";
import {
  getNextTemplateId,
  uploadTemplate,
  FirebaseTemplateMeta,
  FirebaseTemplateData,
} from "../firebase/adminService";
import "./AdminPage.css";

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Template Meta Form
  const [templateName, setTemplateName] = useState("");
  const [templateCategory, setTemplateCategory] = useState<string>("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateImage, setTemplateImage] = useState("");

  // Template Data Form
  const [templateDataJson, setTemplateDataJson] = useState("");
  const [nextTemplateId, setNextTemplateId] = useState(70001);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user is authorized (Firebase owner)
  useEffect(() => {
    const loadNextTemplateId = async () => {
      try {
        const nextId = await getNextTemplateId();
        setNextTemplateId(nextId);
      } catch (error) {
        console.error("Error loading next template ID:", error);
      }
    };

    if (user?.email) {
      // Add your Firebase owner email here
      const authorizedEmails = [
        "anisharmasocial@gmail.com", // Primary owner email
        "ani.sharma.7371@gmail.com", // Additional authorized email
        "admin@yourdomain.com", // Add more authorized emails as needed
      ];
      setIsAuthorized(authorizedEmails.includes(user.email));

      if (authorizedEmails.includes(user.email)) {
        loadNextTemplateId();
      }
    }
  }, [user]);

  // Handle image file selection
  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  // Convert image to base64
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        // 1MB limit
        setErrorMessage("Image size must be less than 1MB");
        setShowErrorAlert(true);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setTemplateImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload template to Firebase
  const handleUpload = async () => {
    if (!templateName.trim() || !templateCategory || !templateDataJson.trim()) {
      setErrorMessage("Please fill in all required fields");
      setShowErrorAlert(true);
      return;
    }

    setUploading(true);

    try {
      // Validate that template data is not empty
      if (!templateDataJson.trim()) {
        throw new Error("Template data cannot be empty");
      }

      // Parse and validate template data
      let templateData: FirebaseTemplateData;
      try {
        templateData = JSON.parse(templateDataJson);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        throw new Error(
          `Invalid JSON format in template data. Please ensure your JSON is properly formatted. Error: ${parseError}`
        );
      }

      // Basic structure validation before setting values
      if (!templateData || typeof templateData !== "object") {
        throw new Error("Template data must be a valid JSON object");
      }

      // Set the template ID and category to match form values
      templateData.templateId = nextTemplateId;
      templateData.category = templateCategory;

      // Create template metadata
      const templateMeta: FirebaseTemplateMeta = {
        name: templateName.trim(),
        category: templateCategory,
        description: templateDescription.trim() || undefined,
        ImageUri: templateImage || undefined,
      };

      // Upload using the admin service
      await uploadTemplate(templateMeta, templateData);

      // Reset form
      setTemplateName("");
      setTemplateCategory("");
      setTemplateDescription("");
      setTemplateImage("");
      setTemplateDataJson("");
      setNextTemplateId((prev) => prev + 1);

      setShowSuccessToast(true);
    } catch (error: any) {
      console.error("Upload error:", error);
      setErrorMessage(error.message || "Failed to upload template");
      setShowErrorAlert(true);
    } finally {
      setUploading(false);
    }
  };

  // Sample template data for reference
  const getSampleTemplateData = () => {
    return JSON.stringify(
      {
        template: "Sample-Custom-Template",
        templateId: nextTemplateId,
        category: templateCategory || "Mobile",
        footers: [{ name: "Invoice", index: 1, isActive: true }],
        logoCell: {
          sheet1: "F5",
        },
        signatureCell: {
          sheet1: "D38",
        },
        cellMappings: {
          sheet1: {
            Heading: "B2",
            Date: "D20",
            InvoiceNumber: "C18",
            From: {
              Name: "C12",
              StreetAddress: "C13",
              CityStateZip: "C14",
              Phone: "C15",
              Email: "C16",
            },
            BillTo: {
              Name: "C5",
              StreetAddress: "C6",
              CityStateZip: "C7",
              Phone: "C8",
              Email: "C9",
            },
            Items: {
              Name: "Items",
              Rows: {
                start: 23,
                end: 35,
              },
              Columns: {
                Description: "C",
                Amount: "F",
              },
            },
          },
        },
        msc: {
          numsheets: 1,
          currentid: "sheet1",
          currentname: "inv1",
          sheetArr: {
            sheet1: {
              sheetstr: {
                savestr:
                  "version:1.5\\ncell:B2:t:INVOICE:f:13:cf:1:colspan:6\\ncell:C5:t:[Customer Name]:f:9:cf:2\\ncell:C18:t:INVOICE #\\ncell:D20:vtf:nd:45898:TODAY():f:9:cf:2:ntvf:3\\nsheet:c:7:r:42:h:12.75",
              },
              name: "inv1",
              hidden: "0",
            },
          },
          EditableCells: {
            allow: true,
            cells: {
              "inv1!B2": true,
              "inv1!C5": true,
              "inv1!C18": true,
              "inv1!D20": true,
            },
          },
        },
      },
      null,
      2
    );
  };

  if (!user) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/app/files" />
            </IonButtons>
            <IonTitle>Admin - Template Library</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonCard>
            <IonCardContent>
              <p>Please sign in to access the admin panel.</p>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    );
  }

  if (!isAuthorized) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/app/files" />
            </IonButtons>
            <IonTitle>Admin - Template Library</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonCard>
            <IonCardContent>
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <IonIcon icon={warning} size="large" color="warning" />
                <h2>Access Denied</h2>
                <p>You don't have permission to access this admin panel.</p>
                <p>Signed in as: {user.email}</p>
              </div>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/files" />
          </IonButtons>
          <IonTitle>Admin - Template Library</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="admin-content">
        {uploading && <IonProgressBar type="indeterminate" />}

        <div className="admin-container">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Upload New Template</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>
                Upload a new template to the Firebase library. Templates will be
                available to all users in the "More" tab.
              </p>
              <p>
                <strong>Current Template ID:</strong> {nextTemplateId}
              </p>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Template Metadata</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol size="12" sizeMd="6">
                    <IonItem>
                      <IonLabel position="stacked">Template Name *</IonLabel>
                      <IonInput
                        value={templateName}
                        onIonInput={(e) => setTemplateName(e.detail.value!)}
                        placeholder="e.g., Professional Invoice Template"
                      />
                    </IonItem>
                  </IonCol>
                  <IonCol size="12" sizeMd="6">
                    <IonItem>
                      <IonLabel position="stacked">Category *</IonLabel>
                      <IonSelect
                        value={templateCategory}
                        onIonChange={(e) => setTemplateCategory(e.detail.value)}
                        placeholder="Select category"
                      >
                        <IonSelectOption value="Mobile">Mobile</IonSelectOption>
                        <IonSelectOption value="Web">Web</IonSelectOption>
                        <IonSelectOption value="Tablet">Tablet</IonSelectOption>
                      </IonSelect>
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol size="12">
                    <IonItem>
                      <IonLabel position="stacked">Description</IonLabel>
                      <IonTextarea
                        value={templateDescription}
                        onIonInput={(e) =>
                          setTemplateDescription(e.detail.value!)
                        }
                        placeholder="Brief description of the template"
                        rows={3}
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol size="12">
                    <IonItem button onClick={handleImageSelect}>
                      <IonLabel>
                        <h3>Template Preview Image</h3>
                        <p>
                          {templateImage
                            ? "Image selected"
                            : "Click to select image (max 1MB)"}
                        </p>
                      </IonLabel>
                      <IonIcon icon={cloudUpload} slot="end" />
                    </IonItem>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageChange}
                    />
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Template Data</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonLabel position="stacked">Template JSON Data *</IonLabel>
                <IonTextarea
                  value={templateDataJson}
                  onIonInput={(e) => setTemplateDataJson(e.detail.value!)}
                  placeholder="Paste your template JSON data here..."
                  rows={15}
                  style={{ fontFamily: "monospace", fontSize: "0.9rem" }}
                />
              </IonItem>

              <div style={{ marginTop: "1rem" }}>
                <IonButton
                  fill="outline"
                  size="small"
                  onClick={() => setTemplateDataJson(getSampleTemplateData())}
                >
                  Load Sample Data
                </IonButton>
              </div>

              <div
                style={{
                  marginTop: "1rem",
                  fontSize: "0.9rem",
                  color: "var(--ion-color-medium)",
                }}
              >
                <strong>Required fields:</strong>
                <ul>
                  <li>template: SocialCalc template string</li>
                  <li>templateId: Unique ID (auto-set to {nextTemplateId})</li>
                  <li>category: Mobile, Web, or Tablet (auto-set from form)</li>
                  <li>msc: MSC object (can be empty {})</li>
                  <li>footers: Array of footer data</li>
                  <li>logoCell: Cell reference for logo</li>
                  <li>signatureCell: Cell reference for signature</li>
                  <li>
                    cellMappings: Object mapping field names to cell references
                  </li>
                </ul>
              </div>
            </IonCardContent>
          </IonCard>

          <div style={{ padding: "1rem", textAlign: "center" }}>
            <IonButton
              expand="block"
              onClick={handleUpload}
              disabled={
                uploading ||
                !templateName.trim() ||
                !templateCategory ||
                !templateDataJson.trim()
              }
            >
              <IonIcon icon={cloudUpload} slot="start" />
              {uploading ? "Uploading..." : "Upload Template"}
            </IonButton>
          </div>
        </div>

        <IonToast
          isOpen={showSuccessToast}
          onDidDismiss={() => setShowSuccessToast(false)}
          message="Template uploaded successfully!"
          duration={3000}
          icon={checkmark}
          color="success"
        />

        <IonAlert
          isOpen={showErrorAlert}
          onDidDismiss={() => setShowErrorAlert(false)}
          header="Upload Error"
          message={errorMessage}
          buttons={["OK"]}
        />
      </IonContent>
    </IonPage>
  );
};

export default AdminPage;
