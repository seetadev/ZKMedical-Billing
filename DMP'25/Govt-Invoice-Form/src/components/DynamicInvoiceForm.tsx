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
  IonDatetime,
  IonPopover,
} from "@ionic/react";
import { close, save, trash, refresh, add, remove } from "ionicons/icons";
import { useInvoice } from "../contexts/InvoiceContext";
import {
  addDynamicInvoiceData,
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
  setAutosaveCount: React.Dispatch<React.SetStateAction<number>>;
}

const DynamicInvoiceForm: React.FC<DynamicInvoiceFormProps> = ({
  isOpen,
  onClose,
  setAutosaveCount,
}) => {
  const { activeTemplateData, currentSheetId, selectedFile } = useInvoice();
  const [formData, setFormData] = useState<ProcessedFormData>({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<
    "success" | "danger" | "warning"
  >("success");
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
          // Get existing data from the spreadsheet
          const existingCellData = await getDynamicInvoiceData(cellReferences);

          // Convert cell data back to form data structure
          const existingFormData =
            DynamicFormManager.convertFromSpreadsheetFormat(
              existingCellData,
              formSections
            );

          setFormData(existingFormData);
        } else {
          // No cell references, initialize with empty data
          const initData = DynamicFormManager.initializeFormData(formSections);
          setFormData(initData);
        }
      } catch (error) {
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

      // Use the new addDynamicInvoiceData function that handles cell references
      await addDynamicInvoiceData(cellData, effectiveSheetId);

      showToastMessage("Invoice data saved successfully!", "success");
      setAutosaveCount((prev) => prev + 1); // Increment autosave count
      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      setToastMessage("Failed to save invoice data. Please try again.");
      setToastColor("danger");
      setShowToast(true);
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
      showToastMessage("Failed to clear form data", "danger");
    }
  };

  const silentRefresh = async () => {
    try {
      // Get all cell references from the form sections
      const cellReferences =
        DynamicFormManager.getAllCellReferences(formSections);

      if (cellReferences.length > 0) {
        // Get current data from the spreadsheet
        const currentCellData = await getDynamicInvoiceData(cellReferences);

        // Convert cell data back to form data structure
        const refreshedFormData =
          DynamicFormManager.convertFromSpreadsheetFormat(
            currentCellData,
            formSections
          );

        setFormData(refreshedFormData);
      }
    } catch (error) {}
  };

  const performRefresh = async () => {
    try {
      // Get all cell references from the form sections
      const cellReferences =
        DynamicFormManager.getAllCellReferences(formSections);

      if (cellReferences.length > 0) {
        // Get current data from the spreadsheet
        const currentCellData = await getDynamicInvoiceData(cellReferences);

        // Convert cell data back to form data structure
        const refreshedFormData =
          DynamicFormManager.convertFromSpreadsheetFormat(
            currentCellData,
            formSections
          );

        setFormData(refreshedFormData);
        showToastMessage("Form data refreshed from spreadsheet!", "success");
      } else {
        showToastMessage("No data to refresh", "warning");
      }
    } catch (error) {
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
        showToastMessage(
          `Maximum ${maxItems} ${section.itemsConfig.name.toLowerCase()}s allowed`,
          "warning"
        );
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
    const section = formSections.find((s) => s.title === sectionTitle);
    if (!section || !section.itemsConfig) return;

    setFormData((prev) => {
      const currentItems = prev[sectionTitle] as any[];

      if (currentItems.length <= 1) {
        showToastMessage(
          `At least one ${section.itemsConfig.name.toLowerCase()} is required`,
          "warning"
        );
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
      case "date":
        return (
          <IonItem
            key={field.label}
            button={true}
            id={`date-trigger-${field.label.replace(/\s+/g, "-")}`}
          >
            <IonLabel position="stacked">{field.label}</IonLabel>
            <IonInput
              value={value ? new Date(value).toLocaleDateString() : ""}
              readonly={true}
              placeholder="Select date"
            />
            <IonPopover
              trigger={`date-trigger-${field.label.replace(/\s+/g, "-")}`}
              showBackdrop={false}
            >
              <IonDatetime
                value={value || new Date().toISOString()}
                onIonChange={(e) => {
                  const selectedDate = e.detail.value as string;
                  if (selectedDate) {
                    // Format date as YYYY-MM-DD for storage
                    const formattedDate = selectedDate.split("T")[0];
                    handleFieldChange(sectionTitle, field.label, formattedDate);
                  }
                }}
                presentation="date"
                preferWheel={true}
              />
            </IonPopover>
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
                <IonLabel>
                  {section.itemsConfig.name} {index + 1}
                </IonLabel>
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
                ([fieldName, cellColumn]) => {
                  const fieldType = DynamicFormManager.getFieldType(fieldName);
                  const itemValue = item[fieldName] || "";

                  if (fieldType === "date") {
                    return (
                      <IonItem
                        key={`${index}-${fieldName}`}
                        button={true}
                        id={`item-date-trigger-${index}-${fieldName.replace(
                          /\s+/g,
                          "-"
                        )}`}
                      >
                        <IonLabel position="stacked">{fieldName}</IonLabel>
                        <IonInput
                          value={
                            itemValue
                              ? new Date(itemValue).toLocaleDateString()
                              : ""
                          }
                          readonly={true}
                          placeholder="Select date"
                        />
                        <IonPopover
                          trigger={`item-date-trigger-${index}-${fieldName.replace(
                            /\s+/g,
                            "-"
                          )}`}
                          showBackdrop={false}
                        >
                          <IonDatetime
                            value={itemValue || new Date().toISOString()}
                            onIonChange={(e) => {
                              const selectedDate = e.detail.value as string;
                              if (selectedDate) {
                                // Format date as YYYY-MM-DD for storage
                                const formattedDate =
                                  selectedDate.split("T")[0];
                                handleItemChange(
                                  section.title,
                                  index,
                                  fieldName,
                                  formattedDate
                                );
                              }
                            }}
                            presentation="date"
                            preferWheel={true}
                          />
                        </IonPopover>
                      </IonItem>
                    );
                  }

                  return (
                    <IonItem key={`${index}-${fieldName}`}>
                      <IonLabel position="stacked">{fieldName}</IonLabel>
                      <IonInput
                        type={fieldType === "decimal" ? "number" : "text"}
                        step={fieldType === "decimal" ? "0.01" : undefined}
                        value={itemValue}
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
                  );
                }
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
              Add {section.itemsConfig.name} ({items.length}/{maxItems})
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
              <IonButton onClick={handleSave} fill="clear" color="light">
                <IonIcon icon={save} />
              </IonButton>
              <IonButton onClick={handleClear} fill="clear" color="light">
                <IonIcon icon={trash} />
              </IonButton>
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
