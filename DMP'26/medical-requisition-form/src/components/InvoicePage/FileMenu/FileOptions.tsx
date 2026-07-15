import React, { useState, useRef, useEffect } from "react";
import {
  IonPopover,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonToast,
  IonAlert,
} from "@ionic/react";
import {
  addOutline,
  arrowUndo,
  arrowRedo,
  colorPaletteOutline,
  saveOutline,
  cloudUploadOutline,
} from "ionicons/icons";
import * as AppGeneral from "../socialcalc/index.js";

// import { DATA } from "../../templates.js";
import { useInvoice } from "../../../contexts/InvoiceContext.js";

import { localTemplateService } from "../../../services/local-template-service";
import { File } from "../../Storage/LocalStorage";
import { extractTotalFromCell } from "../InvoiceHelpers";


interface FileOptionsProps {
  showActionsPopover: boolean;
  setShowActionsPopover: (show: boolean) => void;
  showColorModal: boolean;
  setShowColorPicker: (show: boolean) => void;
  fileName: string;
  onSaveToIpfs?: () => void;
}

const FileOptions: React.FC<FileOptionsProps> = ({
  showActionsPopover,
  setShowActionsPopover,
  setShowColorPicker,
  fileName,
  onSaveToIpfs,
}) => {

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const actionsPopoverRef = useRef<HTMLIonPopoverElement>(null);

  const [showSaveAsAlert, setShowSaveAsAlert] = useState(false);
  const [saveAsFileName, setSaveAsFileName] = useState("");

  // Get data from context
  const {
    activeTemplateId,
    activeTemplateData,
    billType,
    store,
  } = useInvoice();



  const handleSaveAs = async (invoiceName: string): Promise<boolean> => {
    const trimmedName = invoiceName.trim();

    // Validation
    if (trimmedName === "Untitled") {
      setToastMessage("Cannot use 'Untitled' as filename.");
      setShowToast(true);
      return false;
    }
    if (trimmedName === "" || !trimmedName) {
      setToastMessage("Filename cannot be empty");
      setShowToast(true);
      return false;
    }
    if (trimmedName.length > 30) {
      setToastMessage("Filename too long");
      setShowToast(true);
      return false;
    }
    if (/^[a-zA-Z0-9- ]*$/.test(trimmedName) === false) {
      setToastMessage("Special Characters cannot be used");
      setShowToast(true);
      return false;
    }

    const filename = trimmedName.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-');

    try {
      // 1. Check duplicate filename in DB
      const exists = await localTemplateService.invoiceExists(filename);
      if (exists) {
        setToastMessage(`File "${invoiceName}" already exists. Please choose a different name.`);
        setShowToast(true);
        return false;
      }

      // 2. Check 15-file limit constraint
      const canCreate = await localTemplateService.canCreateInvoice();
      if (!canCreate) {
        setToastMessage(`File limit reached (max ${localTemplateService.maxInvoices} files). Please delete some files first.`);
        setShowToast(true);
        return false;
      }

      // 3. Get spreadsheet content from SocialCalc
      const socialCalc = (window as any).SocialCalc;
      if (!socialCalc || !socialCalc.GetCurrentWorkBookControl) {
        setToastMessage("Spreadsheet not ready. Please try again.");
        setShowToast(true);
        return false;
      }
      const control = socialCalc.GetCurrentWorkBookControl();
      const currentSheetId = control.currentSheetButton?.id || 'sheet1';
      const currentSheet = control.workbook?.sheetArr?.[currentSheetId]?.sheet;

      // Force recalculation before saving
      try {
        if (control.ExecuteWorkBookControlCommand) {
          control.ExecuteWorkBookControlCommand({ cmd: "recalc", saveundo: false }, false);
        }
      } catch (e) {
        if (import.meta.env.DEV) console.log("⚠️ handleSaveAs: Recalc failed (non-critical)", e);
      }

      const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());

      // Helper to parse currency values
      const parseCurrency = (val: string | number): number | null => {
        if (typeof val === 'number') return val;
        if (!val) return null;
        const clean = String(val).replace(/[^0-9.-]+/g, "");
        const num = parseFloat(clean);
        return isNaN(num) ? null : num;
      };

      // Extract total from mapped cell
      let totalValue: number | null = null;
      if (currentSheet && activeTemplateData?.appMapping) {
        const totalCellRef = extractTotalFromCell(activeTemplateData.appMapping, currentSheetId);
        if (totalCellRef && currentSheet.cells?.[totalCellRef]) {
          const cell = currentSheet.cells[totalCellRef];
          totalValue = parseCurrency(cell.datavalue) ?? parseCurrency(cell.displaystring);
        }
      }

      // Extract Bill To details
      let billToDetails: any = null;
      if (currentSheet && activeTemplateData?.appMapping) {
        const sheetMapping = activeTemplateData.appMapping[currentSheetId];
        if (sheetMapping?.BillTo?.formContent) {
          billToDetails = {};
          for (const [key, field] of Object.entries(sheetMapping.BillTo.formContent)) {
            const cellRef = (field as any).cell;
            if (cellRef && currentSheet.cells?.[cellRef]) {
              let val = currentSheet.cells[cellRef].datavalue;
              if (val === undefined || val === null) {
                val = currentSheet.cells[cellRef].displaystring;
              }
              billToDetails[key] = val || "";
            }
          }
        }
      }

      // Save to local storage with full metadata
      const saveSuccess = await localTemplateService.saveInvoice({
        id: filename,
        name: invoiceName,
        templateId: activeTemplateId || billType,
        content: content,
        billType: billType,
        total: totalValue || 0,
        billToDetails: billToDetails
      });

      if (!saveSuccess) {
        setToastMessage("Failed to save file.");
        setShowToast(true);
        return false;
      }

      // Save to local File store for backup/consistency
      const now = new Date().toISOString();
      const fileObj = new File(
        now,
        now,
        content,
        filename,
        billType,
        activeTemplateId || billType,
        false
      );
      await store._saveFile(fileObj);
      await store._addToRecentInvoices(filename);

      setToastMessage(`File is saved to ${invoiceName}`);
      setShowToast(true);
      return true;

    } catch (error) {
      console.error("Save As error:", error);
      setToastMessage("An error occurred while saving.");
      setShowToast(true);
      return false;
    }
  };

  const handleUndo = () => {
    AppGeneral.undo();
  };

  const handleRedo = () => {
    AppGeneral.redo();
  };

  const handleNewFileClick = async () => {
    setShowActionsPopover(false);

    try {
      // Check 8-file limit
      const canCreate = await localTemplateService.canCreateInvoice();
      if (!canCreate) {
        setToastMessage(`File limit reached (max ${localTemplateService.maxInvoices}). Please delete some files first.`);
        setShowToast(true);
        return;
      }

      let templateId = activeTemplateId;
      if (!templateId) {
        templateId = await localTemplateService.getActiveTemplateId();
      }

      if (templateId) {
        window.location.href = `/app/tabs/home/new-template-${templateId}`;
      } else {
        window.location.href = '/app/tabs/files';
      }
    } catch (e) {
      window.location.href = '/app/tabs/files';
    }
  };



  return (
    <>
      {/* Actions Popover */}
      <IonPopover
        ref={actionsPopoverRef}
        isOpen={showActionsPopover}
        onDidDismiss={() => setShowActionsPopover(false)}
        trigger="actions-trigger"
        side="bottom"
        alignment="end"
        style={{
          '--width': 'auto',
          '--min-width': '180px',
          '--max-width': '250px',
        } as React.CSSProperties}
      >
        <IonContent className="ion-padding-vertical" style={{ '--background': '#ffffff' }}>
          <IonList lines="none" style={{ padding: '0' }}>
            <IonItem button onClick={handleNewFileClick} detail={false}>
              <IonIcon icon={addOutline} slot="start" />
              <IonLabel>New</IonLabel>
            </IonItem>

            <IonItem button onClick={() => { setShowActionsPopover(false); setShowSaveAsAlert(true); }} detail={false}>
              <IonIcon icon={saveOutline} slot="start" />
              <IonLabel>Save As</IonLabel>
            </IonItem>

            {onSaveToIpfs && (
              <IonItem button onClick={() => { setShowActionsPopover(false); onSaveToIpfs(); }} detail={false}>
                <IonIcon icon={cloudUploadOutline} slot="start" style={{ color: '#10b981' }} />
                <IonLabel style={{ color: '#10b981', fontWeight: '500' }}>Save to IPFS</IonLabel>
              </IonItem>
            )}



            <IonItem button onClick={handleUndo} detail={false}>
              <IonIcon icon={arrowUndo} slot="start" />
              <IonLabel>Undo</IonLabel>
            </IonItem>

            <IonItem button onClick={handleRedo} detail={false}>
              <IonIcon icon={arrowRedo} slot="start" />
              <IonLabel>Redo</IonLabel>
            </IonItem>

            <IonItem button onClick={() => setShowColorPicker(true)} detail={false}>
              <IonIcon icon={colorPaletteOutline} slot="start" />
              <IonLabel>Sheet Colors</IonLabel>
            </IonItem>
          </IonList>
        </IonContent>
      </IonPopover>

      {/* Toast for notifications */}
      <IonToast
        isOpen={showToast}
        message={toastMessage}
        duration={3000}
        onDidDismiss={() => setShowToast(false)}
        position="bottom"
      />

      {/* Save As Alert Dialog */}
      <IonAlert
        animated
        isOpen={showSaveAsAlert}
        onDidDismiss={() => {
          setShowSaveAsAlert(false);
          setSaveAsFileName("");
        }}
        onDidPresent={() => {
          const socialCalc = (window as any).SocialCalc;
          if (socialCalc) {
            socialCalc.keyboardEnabled = false;
          }
        }}
        onWillDismiss={() => {
          const socialCalc = (window as any).SocialCalc;
          if (socialCalc) {
            socialCalc.keyboardEnabled = true;
          }
        }}
        backdropDismiss={false}
        keyboardClose={false}
        header="Save As"
        message="Enter a name for the new file:"
        inputs={[
          {
            name: "filename",
            type: "text",
            placeholder: "Enter filename...",
            value: saveAsFileName,
            attributes: {
              maxlength: 50,
              onKeyDown: (e: any) => e.stopPropagation(),
              onKeyUp: (e: any) => e.stopPropagation(),
              onKeyPress: (e: any) => e.stopPropagation(),
            },
          },
        ]}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
            handler: () => {
              setSaveAsFileName("");
            },
          },
          {
            text: "Save",
            handler: (data) => {
              const filenameInput = data.filename?.trim();
              if (filenameInput) {
                handleSaveAs(filenameInput).then((success) => {
                  if (success) {
                    setShowSaveAsAlert(false);
                  }
                });
                return false;
              } else {
                setToastMessage("Filename cannot be empty");
                setShowToast(true);
                return false;
              }
            },
          },
        ]}
      />
    </>
  );
};

export default FileOptions;
