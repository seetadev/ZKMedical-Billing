import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Local } from "../components/Storage/LocalStorage";
import { TemplateData, DATA } from "../templates";

interface InvoiceContextType {
  selectedFile: string;
  billType: number;
  store: Local;
  activeTemplateData: TemplateData | null;
  currentSheetId: string | null;
  updateSelectedFile: (fileName: string) => void;
  updateBillType: (type: number) => void;
  updateActiveTemplateData: (templateData: TemplateData | null) => void;
  updateCurrentSheetId: (sheetId: string) => void;
  resetToDefaults: () => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const useInvoice = () => {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error("useInvoice must be used within an InvoiceProvider");
  }
  return context;
};

interface InvoiceProviderProps {
  children: ReactNode;
}

export const InvoiceProvider: React.FC<InvoiceProviderProps> = ({
  children,
}) => {
  const [selectedFile, setSelectedFile] = useState<string>("file_not_found");
  const [billType, setBillType] = useState<number>(1);
  const [activeTemplateData, setActiveTemplateData] =
    useState<TemplateData | null>(null);
  const [currentSheetId, setCurrentSheetId] = useState<string | null>(null);
  const [store] = useState(() => new Local());

  // Load persisted state from localStorage on mount
  useEffect(() => {
    try {
      const savedFile = localStorage.getItem("stark-invoice-selected-file");
      const savedBillType = localStorage.getItem("stark-invoice-bill-type");
      const savedActiveTemplateId = localStorage.getItem(
        "stark-invoice-active-template-id"
      );
      const savedCurrentSheetId = localStorage.getItem(
        "stark-invoice-current-sheet-id"
      );

      if (savedFile) {
        setSelectedFile(savedFile);
      }

      if (savedBillType) {
        setBillType(parseInt(savedBillType, 10));
      }

      if (savedActiveTemplateId) {
        const templateId = parseInt(savedActiveTemplateId, 10);
        const templateData = DATA[templateId];
        if (templateData) {
          setActiveTemplateData(templateData);
          // Set current sheet ID from template data if not saved separately
          if (!savedCurrentSheetId && templateData.msc.currentid) {
            setCurrentSheetId(templateData.msc.currentid);
          }
        }
      }

      if (savedCurrentSheetId) {
        setCurrentSheetId(savedCurrentSheetId);
      }
    } catch (error) {
      // Failed to load invoice state from localStorage
    }
  }, []);

  // Persist state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("stark-invoice-selected-file", selectedFile);
    } catch (error) {
      // Failed to save selected file to localStorage
    }
  }, [selectedFile]);

  useEffect(() => {
    try {
      localStorage.setItem("stark-invoice-bill-type", billType.toString());
    } catch (error) {
      // Failed to save bill type to localStorage
    }
  }, [billType]);

  useEffect(() => {
    try {
      if (activeTemplateData) {
        localStorage.setItem(
          "stark-invoice-active-template-id",
          activeTemplateData.templateId.toString()
        );
      } else {
        localStorage.removeItem("stark-invoice-active-template-id");
      }
    } catch (error) {
      // Failed to save active template id to localStorage
    }
  }, [activeTemplateData]);

  useEffect(() => {
    try {
      if (currentSheetId) {
        localStorage.setItem("stark-invoice-current-sheet-id", currentSheetId);
      } else {
        localStorage.removeItem("stark-invoice-current-sheet-id");
      }
    } catch (error) {
      // Failed to save current sheet id to localStorage
    }
  }, [currentSheetId]);

  const updateSelectedFile = (fileName: string) => {
    setSelectedFile(fileName);
  };

  const updateBillType = (type: number) => {
    setBillType(type);
  };

  const updateActiveTemplateData = (templateData: TemplateData | null) => {
    setActiveTemplateData(templateData);
    // Automatically update current sheet ID when template changes
    if (templateData && templateData.msc.currentid) {
      setCurrentSheetId(templateData.msc.currentid);
    }
  };

  const updateCurrentSheetId = (sheetId: string) => {
    setCurrentSheetId(sheetId);
  };

  const resetToDefaults = () => {
    setSelectedFile("File_Not_found");
    setBillType(1);
    setActiveTemplateData(null);
    setCurrentSheetId(null);
  };

  const value: InvoiceContextType = {
    selectedFile,
    billType,
    store,
    activeTemplateData,
    currentSheetId,
    updateSelectedFile,
    updateBillType,
    updateActiveTemplateData,
    updateCurrentSheetId,
    resetToDefaults,
  };

  return (
    <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>
  );
};
