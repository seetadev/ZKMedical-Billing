import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Local } from "../components/Storage/LocalStorage";

interface InvoiceContextType {
  selectedFile: string;
  billType: number;
  store: Local;
  updateSelectedFile: (fileName: string) => void;
  updateBillType: (type: number) => void;
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
  const [selectedFile, setSelectedFile] = useState<string>("default");
  const [billType, setBillType] = useState<number>(1);
  const [store] = useState(() => new Local());

  // Load persisted state from localStorage on mount
  useEffect(() => {
    try {
      const savedFile = localStorage.getItem("stark-invoice-selected-file");
      const savedBillType = localStorage.getItem("stark-invoice-bill-type");

      if (savedFile) {
        setSelectedFile(savedFile);
      }

      if (savedBillType) {
        setBillType(parseInt(savedBillType, 10));
      }
    } catch (error) {
      console.warn("Failed to load invoice state from localStorage:", error);
    }
  }, []);

  // Persist state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("stark-invoice-selected-file", selectedFile);
    } catch (error) {
      console.warn("Failed to save selected file to localStorage:", error);
    }
  }, [selectedFile]);

  useEffect(() => {
    try {
      localStorage.setItem("stark-invoice-bill-type", billType.toString());
    } catch (error) {
      console.warn("Failed to save bill type to localStorage:", error);
    }
  }, [billType]);

  const updateSelectedFile = (fileName: string) => {
    setSelectedFile(fileName);
  };

  const updateBillType = (type: number) => {
    setBillType(type);
  };

  const resetToDefaults = () => {
    setSelectedFile("default");
    setBillType(1);
  };

  const value: InvoiceContextType = {
    selectedFile,
    billType,
    store,
    updateSelectedFile,
    updateBillType,
    resetToDefaults,
  };

  return (
    <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>
  );
};
