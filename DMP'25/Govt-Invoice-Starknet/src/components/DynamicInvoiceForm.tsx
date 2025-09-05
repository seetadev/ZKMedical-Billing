import React, { useState, useEffect, useMemo } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonButtons,
  IonIcon,
  IonGrid,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonToast,
  IonItemDivider,
  IonTextarea,
  IonChip,
  IonAlert,
} from "@ionic/react";
import {
  close,
  save,
  trash,
  layers,
  refresh,
  add,
  remove,
} from "ionicons/icons";
import { useInvoice } from "../contexts/InvoiceContext";
import {
  addInvoiceData,
  addDynamicInvoiceData,
  clearInvoiceData,
  getDynamicInvoiceData,
} from "./socialcalc/modules/invoice.js";
import {
  DynamicFormManager,
  DynamicFormSection,
  DynamicFormField,
  ProcessedFormData,
} from "../utils/dynamicFormManager";
import "./InvoiceForm.css";

interface DynamicInvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const DynamicInvoiceForm: React.FC<DynamicInvoiceFormProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeTemplateData, currentSheetId, selectedFile } = useInvoice();
  const [formData, setFormData] = useState<ProcessedFormData>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<
    "success" | "danger" | "warning"
  >("success");
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  const [showRefreshAlert, setShowRefreshAlert] = useState(false);

  // Get current template data
  const currentTemplate = useMemo(() => {
    return activeTemplateData;
  }, [activeTemplateData]);

  // Get current sheet ID or fall back to template's current sheet
  const effectiveSheetId = useMemo(() => {
    return currentSheetId || currentTemplate?.msc?.currentid || "sheet1";
  }, [currentSheetId, currentTemplate]);

  // Generate form sections based on cellMappings and current sheet
  const formSections = useMemo(() => {
    if (!currentTemplate) return [];
    return DynamicFormManager.getFormSectionsForSheet(
      currentTemplate,
      effectiveSheetId
    );
  }, [currentTemplate, effectiveSheetId]);

  // Initialize form data when form sections change
  useEffect(() => {
    const loadFormData = async () => {
      try {
        if (formSections.length === 0) return;

        // Get all cell references from the form sections
        const cellReferences =
          DynamicFormManager.getAllCellReferences(formSections);

        if (cellReferences.length > 0) {
          console.log("Loading existing data from cells:", cellReferences);

          // Get existing data from the spreadsheet
          const existingCellData = await getDynamicInvoiceData(cellReferences);

          // Convert cell data back to form data structure
          const existingFormData =
            DynamicFormManager.convertFromSpreadsheetFormat(
              existingCellData,
              formSections
            );

          console.log("Loaded existing form data:", existingFormData);
          setFormData(existingFormData);
        } else {
          // No cell references, initialize with empty data
          const initData = DynamicFormManager.initializeFormData(formSections);
          setFormData(initData);
        }
      } catch (error) {
        console.error("Error loading existing form data:", error);
        // Fall back to empty initialization
        const initData = DynamicFormManager.initializeFormData(formSections);
        setFormData(initData);
      }
    };

    loadFormData();
  }, [formSections]);

  // Auto-refresh data when modal opens
  useEffect(() => {
    if (isOpen && formSections.length > 0) {
      const timeoutId = setTimeout(() => {
        silentRefresh();
      }, 200);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, formSections]);

  const showToastMessage = (
    message: string,
    color: "success" | "danger" | "warning" = "success"
  ) => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const handleFieldChange = (
    sectionTitle: string,
    fieldLabel: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [sectionTitle]: {
        ...prev[sectionTitle],
        [fieldLabel]: value,
      },
    }));
  };

  const handleItemChange = (
    sectionTitle: string,
    itemIndex: number,
    fieldName: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [sectionTitle]: prev[sectionTitle].map((item: any, index: number) =>
        index === itemIndex ? { ...item, [fieldName]: value } : item
      ),
    }));
  };

  const handleSave = async () => {
    try {
      // Validate form data
      const validation = DynamicFormManager.validateFormData(
        formData,
        formSections
      );
      if (!validation.isValid) {
        showToastMessage(
          `Validation errors: ${validation.errors.join(", ")}`,
          "warning"
        );
        return;
      }

      // Convert form data to spreadsheet format
      const cellData = DynamicFormManager.convertToSpreadsheetFormat(
        formData,
        formSections,
        effectiveSheetId
      );

      console.log("Cell data to be saved:", cellData);
      console.log("Effective sheet ID:", effectiveSheetId);

      // Use the new addDynamicInvoiceData function that handles cell references
      await addDynamicInvoiceData(cellData, effectiveSheetId);

      // Update last sync time to prevent immediate auto-sync
      setLastSyncTime(Date.now());

      showToastMessage("Invoice data saved successfully!", "success");

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error saving invoice data:", error);
      setToastMessage("Failed to save invoice data. Please try again.");
      setToastColor("danger");
      setShowToast(true);
    }
  };

  const saveToSheet = async () => {
    try {
      // Validate form data
      const validation = DynamicFormManager.validateFormData(
        formData,
        formSections
      );
      if (!validation.isValid) {
        console.log("Validation errors during save:", validation.errors);
        return;
      }

      // Convert form data to spreadsheet format
      const cellData = DynamicFormManager.convertToSpreadsheetFormat(
        formData,
        formSections,
        effectiveSheetId
      );

      console.log("Saving to sheet after item change:", cellData);

      // Use the new addDynamicInvoiceData function that handles cell references
      await addDynamicInvoiceData(cellData, effectiveSheetId);

      // Update last sync time to prevent immediate auto-sync
      setLastSyncTime(Date.now());
    } catch (error) {
      console.error("Error saving to sheet:", error);
    }
  };

  const handleClear = async () => {
    try {
      // Reset form data without affecting the sheet
      const initData = DynamicFormManager.initializeFormData(formSections);
      setFormData(initData);
      showToastMessage(
        "Form fields cleared! Click 'Save Data' to apply changes to sheet.",
        "success"
      );
    } catch (error) {
      console.error("Error clearing form data:", error);
      showToastMessage("Failed to clear form data", "danger");
    }
  };

  const silentRefresh = async () => {
    try {
      // Get all cell references from the form sections
      const cellReferences =
        DynamicFormManager.getAllCellReferences(formSections);

      if (cellReferences.length > 0) {
        console.log("Silently refreshing data from cells:", cellReferences);

        // Get current data from the spreadsheet
        const currentCellData = await getDynamicInvoiceData(cellReferences);

        // Convert cell data back to form data structure
        const refreshedFormData =
          DynamicFormManager.convertFromSpreadsheetFormat(
            currentCellData,
            formSections
          );

        console.log("Silent refresh - form data updated:", refreshedFormData);
        setFormData(refreshedFormData);
      }
    } catch (error) {
      console.error("Error during silent refresh:", error);
    }
  };

  const performRefresh = async () => {
    try {
      // Get all cell references from the form sections
      const cellReferences =
        DynamicFormManager.getAllCellReferences(formSections);

      if (cellReferences.length > 0) {
        console.log("Refreshing data from cells:", cellReferences);

        // Get current data from the spreadsheet
        const currentCellData = await getDynamicInvoiceData(cellReferences);

        // Convert cell data back to form data structure
        const refreshedFormData =
          DynamicFormManager.convertFromSpreadsheetFormat(
            currentCellData,
            formSections
          );

        console.log("Refreshed form data:", refreshedFormData);
        setFormData(refreshedFormData);
        showToastMessage("Form data refreshed from spreadsheet!", "success");
      } else {
        showToastMessage("No data to refresh", "warning");
      }
    } catch (error) {
      console.error("Error refreshing form data:", error);
      showToastMessage("Failed to refresh form data", "danger");
    }
  };

  const handleRefresh = () => {
    setShowRefreshAlert(true);
  };

  const handleAddItem = (sectionTitle: string) => {
    const section = formSections.find((s) => s.title === sectionTitle);
    if (!section || !section.itemsConfig) return;

    setFormData((prev) => {
      const currentItems = prev[sectionTitle] as any[];
      const maxItems =
        section.itemsConfig!.range.end - section.itemsConfig!.range.start + 1;

      if (currentItems.length >= maxItems) {
        showToastMessage(`Maximum ${maxItems} items allowed`, "warning");
        return prev;
      }

      const newItem: any = {};
      Object.keys(section.itemsConfig!.content).forEach((contentKey) => {
        newItem[contentKey] = "";
      });

      return {
        ...prev,
        [sectionTitle]: [...currentItems, newItem],
      };
    });
  };

  const handleRemoveItem = (sectionTitle: string, itemIndex: number) => {
    setFormData((prev) => {
      const currentItems = prev[sectionTitle] as any[];

      if (currentItems.length <= 1) {
        showToastMessage("At least one item is required", "warning");
        return prev;
      }

      const updatedItems = currentItems.filter(
        (_, index) => index !== itemIndex
      );
      const newFormData = {
        ...prev,
        [sectionTitle]: updatedItems,
      };

      return newFormData;
    });
  };

  const renderField = (field: DynamicFormField, sectionTitle: string) => {
    const value = formData[sectionTitle]?.[field.label] || "";

    switch (field.type) {
      case "textarea":
        return (
          <IonItem key={field.label}>
            <IonLabel position="stacked">{field.label}</IonLabel>
            <IonTextarea
              value={value}
              onIonInput={(e) =>
                handleFieldChange(sectionTitle, field.label, e.detail.value!)
              }
              placeholder={`Enter ${field.label.toLowerCase()}`}
              rows={3}
            />
          </IonItem>
        );
      case "email":
        return (
          <IonItem key={field.label}>
            <IonLabel position="stacked">{field.label}</IonLabel>
            <IonInput
              type="email"
              value={value}
              onIonInput={(e) =>
                handleFieldChange(sectionTitle, field.label, e.detail.value!)
              }
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </IonItem>
        );
      case "number":
        return (
          <IonItem key={field.label}>
            <IonLabel position="stacked">{field.label}</IonLabel>
            <IonInput
              type="number"
              value={value}
              onIonInput={(e) =>
                handleFieldChange(sectionTitle, field.label, e.detail.value!)
              }
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </IonItem>
        );
      case "decimal":
        return (
          <IonItem key={field.label}>
            <IonLabel position="stacked">{field.label}</IonLabel>
            <IonInput
              type="number"
              step="0.01"
              value={value}
              onIonInput={(e) =>
                handleFieldChange(sectionTitle, field.label, e.detail.value!)
              }
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </IonItem>
        );
      default:
        return (
          <IonItem key={field.label}>
            <IonLabel position="stacked">{field.label}</IonLabel>
            <IonInput
              value={value}
              onIonInput={(e) =>
                handleFieldChange(sectionTitle, field.label, e.detail.value!)
              }
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          </IonItem>
        );
    }
  };

  const renderItemsSection = (section: DynamicFormSection) => {
    if (!section.itemsConfig || !formData[section.title]) return null;

    const items = formData[section.title] as any[];
    const maxItems =
      section.itemsConfig.range.end - section.itemsConfig.range.start + 1;

    return (
      <IonCard key={section.title}>
        <IonCardHeader>
          <IonCardTitle>{section.title}</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {items.map((item, index) => (
            <div key={index} className="item-group">
              <IonItemDivider>
                <IonLabel>Item {index + 1}</IonLabel>
                {items.length > 1 && (
                  <IonButton
                    fill="clear"
                    color="danger"
                    size="small"
                    onClick={() => handleRemoveItem(section.title, index)}
                  >
                    <IonIcon icon={remove} />
                  </IonButton>
                )}
              </IonItemDivider>
              {Object.entries(section.itemsConfig!.content).map(
                ([fieldName, cellColumn]) => (
                  <IonItem key={`${index}-${fieldName}`}>
                    <IonLabel position="stacked">{fieldName}</IonLabel>
                    <IonInput
                      type={
                        DynamicFormManager.getFieldType(fieldName) === "decimal"
                          ? "number"
                          : "text"
                      }
                      step={
                        DynamicFormManager.getFieldType(fieldName) === "decimal"
                          ? "0.01"
                          : undefined
                      }
                      value={item[fieldName] || ""}
                      onIonInput={(e) =>
                        handleItemChange(
                          section.title,
                          index,
                          fieldName,
                          e.detail.value!
                        )
                      }
                      placeholder={`Enter ${fieldName.toLowerCase()}`}
                    />
                  </IonItem>
                )
              )}
            </div>
          ))}

          {/* Add Item Button */}
          <div style={{ padding: "10px 0", textAlign: "center" }}>
            <IonButton
              fill="outline"
              color="primary"
              onClick={() => handleAddItem(section.title)}
              disabled={items.length >= maxItems}
            >
              <IonIcon icon={add} slot="start" />
              Add Item ({items.length}/{maxItems})
            </IonButton>
          </div>
        </IonCardContent>
      </IonCard>
    );
  };

  const renderSection = (section: DynamicFormSection) => {
    if (section.isItems) {
      return renderItemsSection(section);
    }

    return (
      <IonCard key={section.title}>
        <IonCardHeader>
          <IonCardTitle>{section.title}</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonList>
            {section.fields.map((field) => renderField(field, section.title))}
          </IonList>
        </IonCardContent>
      </IonCard>
    );
  };

  if (!currentTemplate) {
    return (
      <IonModal isOpen={isOpen} onDidDismiss={onClose}>
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>Edit {selectedFile}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={onClose}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ padding: "20px", textAlign: "center" }}>
            <p>No template found for the current selection.</p>
          </div>
        </IonContent>
      </IonModal>
    );
  }

  return (
    <>
      <IonModal
        isOpen={isOpen}
        onDidDismiss={onClose}
        className="invoice-form-modal"
      >
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>Edit {selectedFile}</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleRefresh} fill="clear">
                <IonIcon icon={refresh} />
              </IonButton>
              <IonButton onClick={onClose}>
                <IonIcon icon={close} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="invoice-form-content">
          {/* Sheet Information Display */}
          {effectiveSheetId && (
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Current Sheet: {effectiveSheetId}</IonCardTitle>
              </IonCardHeader>
            </IonCard>
          )}

          {/* Dynamic Form Sections */}
          <IonGrid>
            {formSections.map((section) => renderSection(section))}
          </IonGrid>

          {/* Action Buttons */}
          <div style={{ padding: "20px", display: "flex", gap: "10px" }}>
            <IonButton onClick={handleSave} color="primary" style={{ flex: 1 }}>
              <IonIcon icon={save} slot="start" />
              Save Data
            </IonButton>
            <IonButton
              onClick={handleClear}
              color="danger"
              fill="outline"
              style={{ flex: 1 }}
            >
              <IonIcon icon={trash} slot="start" />
              Clear All
            </IonButton>
          </div>
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        color={toastColor}
      />

      <IonAlert
        isOpen={showRefreshAlert}
        onDidDismiss={() => setShowRefreshAlert(false)}
        header="Sync Sheet Data"
        message="Do you want to sync sheet data to the form? This will discard any changes you might have made."
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
            handler: () => {
              setShowRefreshAlert(false);
            },
          },
          {
            text: "Sync Data",
            role: "confirm",
            handler: () => {
              setShowRefreshAlert(false);
              performRefresh();
            },
          },
        ]}
      />
    </>
  );
};

export default DynamicInvoiceForm;
