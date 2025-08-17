import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Input, 
  Textarea, 
  Select, 
  SelectItem, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  useDisclosure,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from "@nextui-org/react";
import { IonIcon } from "@ionic/react";
import { 
  addCircleOutline, 
  documentOutline, 
  gridOutline,
  saveOutline,
  downloadOutline,
  calculatorOutline
} from "ionicons/icons";

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
  category?: string;
  description?: string;
}

interface InvoiceSheet {
  id: string;
  name: string;
  items: InvoiceItem[];
  total: number;
}

interface MultiSheetInvoiceFormProps {
  onSave: (sheets: InvoiceSheet[]) => void;
  initialSheets?: InvoiceSheet[];
}

const defaultItem: InvoiceItem = {
  name: "",
  quantity: 0,
  price: 0.0,
  total: 0.0,
  category: "medical",
  description: ""
};

const defaultSheet: InvoiceSheet = {
  id: "sheet1",
  name: "Medical Services",
  items: [{ ...defaultItem }],
  total: 0
};

const categories = [
  { key: "medical", label: "Medical Services" },
  { key: "consultation", label: "Consultation" },
  { key: "medication", label: "Medication" },
  { key: "equipment", label: "Medical Equipment" },
  { key: "lab", label: "Laboratory Tests" },
  { key: "imaging", label: "Medical Imaging" },
  { key: "therapy", label: "Therapy Services" },
  { key: "other", label: "Other" }
];

export default function MultiSheetInvoiceForm({ onSave, initialSheets = [defaultSheet] }: MultiSheetInvoiceFormProps) {
  const [sheets, setSheets] = useState<InvoiceSheet[]>(initialSheets);
  const [activeSheetId, setActiveSheetId] = useState<string>(initialSheets[0]?.id || "sheet1");
  const [newSheetName, setNewSheetName] = useState("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [grandTotal, setGrandTotal] = useState(0);

  const activeSheet = sheets.find(sheet => sheet.id === activeSheetId) || sheets[0];

  // Calculate totals when sheets change
  useEffect(() => {
    const updatedSheets = sheets.map(sheet => {
      const sheetTotal = sheet.items.reduce((sum, item) => sum + (item.total || 0), 0);
      return { ...sheet, total: sheetTotal };
    });
    
    const newGrandTotal = updatedSheets.reduce((sum, sheet) => sum + sheet.total, 0);
    setGrandTotal(newGrandTotal);
    
    if (JSON.stringify(updatedSheets) !== JSON.stringify(sheets)) {
      setSheets(updatedSheets);
    }
  }, [sheets]);

  const addNewSheet = () => {
    if (!newSheetName.trim()) return;
    
    const newSheet: InvoiceSheet = {
      id: `sheet${Date.now()}`,
      name: newSheetName,
      items: [{ ...defaultItem }],
      total: 0
    };
    
    setSheets(prev => [...prev, newSheet]);
    setActiveSheetId(newSheet.id);
    setNewSheetName("");
    onOpenChange();
  };

  const deleteSheet = (sheetId: string) => {
    if (sheets.length <= 1) return; // Don't delete the last sheet
    
    const updatedSheets = sheets.filter(sheet => sheet.id !== sheetId);
    setSheets(updatedSheets);
    
    if (activeSheetId === sheetId) {
      setActiveSheetId(updatedSheets[0].id);
    }
  };

  const updateItem = (sheetId: string, itemIndex: number, field: keyof InvoiceItem, value: any) => {
    setSheets(prevSheets => {
      return prevSheets.map(sheet => {
        if (sheet.id !== sheetId) return sheet;
        
        const updatedItems = sheet.items.map((item, index) => {
          if (index !== itemIndex) return item;
          
          const updatedItem = { ...item, [field]: value };
          
          // Auto-calculate total when quantity or price changes
          if (field === 'quantity' || field === 'price') {
            updatedItem.total = (updatedItem.quantity || 0) * (updatedItem.price || 0);
          }
          
          return updatedItem;
        });
        
        return { ...sheet, items: updatedItems };
      });
    });
  };

  const addItem = (sheetId: string) => {
    setSheets(prevSheets => {
      return prevSheets.map(sheet => {
        if (sheet.id !== sheetId) return sheet;
        return { ...sheet, items: [...sheet.items, { ...defaultItem }] };
      });
    });
  };

  const removeItem = (sheetId: string, itemIndex: number) => {
    setSheets(prevSheets => {
      return prevSheets.map(sheet => {
        if (sheet.id !== sheetId) return sheet;
        if (sheet.items.length <= 1) return sheet; // Don't remove the last item
        
        const updatedItems = sheet.items.filter((_, index) => index !== itemIndex);
        return { ...sheet, items: updatedItems };
      });
    });
  };

  const exportToSpreadsheet = () => {
    // This function would integrate with SocialCalc to export the multi-sheet data
    console.log('Exporting to spreadsheet...', sheets);
    // TODO: Integrate with SocialCalc component
  };

  const handleSave = () => {
    onSave(sheets);
  };

  return (
    <div className="w-full space-y-6">
      {/* Sheet Tabs */}
      <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
        <div className="flex gap-2 flex-wrap">
          {sheets.map((sheet) => (
            <div key={sheet.id} className="flex items-center gap-2">
              <Chip
                size="lg"
                color={activeSheetId === sheet.id ? "primary" : "default"}
                className="cursor-pointer"
                onClick={() => setActiveSheetId(sheet.id)}
              >
                <div className="flex items-center gap-2">
                  <IonIcon icon={documentOutline} />
                  <span>{sheet.name}</span>
                  <span className="text-xs opacity-70">(${sheet.total.toFixed(2)})</span>
                </div>
              </Chip>
              {sheets.length > 1 && (
                <Button
                  size="sm"
                  color="danger"
                  variant="light"
                  onClick={() => deleteSheet(sheet.id)}
                >
                  ×
                </Button>
              )}
            </div>
          ))}
        </div>
        
        <Button
          color="primary"
          variant="flat"
          startContent={<IonIcon icon={addCircleOutline} />}
          onClick={onOpen}
        >
          Add Sheet
        </Button>
        
        <Button
          color="secondary"
          variant="flat"
          startContent={<IonIcon icon={gridOutline} />}
          onClick={exportToSpreadsheet}
        >
          Export to Spreadsheet
        </Button>
      </div>

      {/* Active Sheet Content */}
      <Card>
        <CardHeader className="flex justify-between">
          <h3 className="text-xl font-semibold">{activeSheet.name}</h3>
          <div className="flex items-center gap-2">
            <IonIcon icon={calculatorOutline} />
            <span>Sheet Total: ${activeSheet.total.toFixed(2)}</span>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {activeSheet.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="col-span-1 flex items-center justify-center">
                  <span className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                    {index + 1}
                  </span>
                </div>
                
                <div className="col-span-3">
                  <Input
                    label="Item Name"
                    value={item.name}
                    onChange={(e) => updateItem(activeSheetId, index, 'name', e.target.value)}
                    placeholder="Enter item name"
                  />
                </div>
                
                <div className="col-span-2">
                  <Select
                    label="Category"
                    selectedKeys={item.category ? [item.category] : []}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0] as string;
                      updateItem(activeSheetId, index, 'category', selectedKey);
                    }}
                  >
                    {categories.map((category) => (
                      <SelectItem key={category.key} value={category.key}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                
                <div className="col-span-2">
                  <Input
                    label="Quantity"
                    type="number"
                    value={item.quantity.toString()}
                    onChange={(e) => updateItem(activeSheetId, index, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="col-span-2">
                  <Input
                    label="Price ($)"
                    type="number"
                    step="0.01"
                    value={item.price.toString()}
                    onChange={(e) => updateItem(activeSheetId, index, 'price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="col-span-1">
                  <Input
                    label="Total"
                    value={`$${item.total.toFixed(2)}`}
                    readOnly
                    className="text-right"
                  />
                </div>
                
                <div className="col-span-1">
                  <Button
                    color="danger"
                    variant="light"
                    size="sm"
                    onClick={() => removeItem(activeSheetId, index)}
                    disabled={activeSheet.items.length <= 1}
                  >
                    ×
                  </Button>
                </div>
                
                <div className="col-span-12">
                  <Textarea
                    label="Description (Optional)"
                    value={item.description || ""}
                    onChange={(e) => updateItem(activeSheetId, index, 'description', e.target.value)}
                    placeholder="Additional item details..."
                    minRows={1}
                    maxRows={3}
                  />
                </div>
              </div>
            ))}
            
            <Button
              color="primary"
              variant="flat"
              startContent={<IonIcon icon={addCircleOutline} />}
              onClick={() => addItem(activeSheetId)}
              className="w-full"
            >
              Add Item to {activeSheet.name}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Summary and Actions */}
      <Card>
        <CardBody>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold">Grand Total: ${grandTotal.toFixed(2)}</h3>
              <p className="text-gray-600">Across {sheets.length} sheet(s)</p>
            </div>
            
            <div className="flex gap-4">
              <Button
                color="secondary"
                variant="flat"
                startContent={<IonIcon icon={downloadOutline} />}
              >
                Export
              </Button>
              <Button
                color="primary"
                startContent={<IonIcon icon={saveOutline} />}
                onClick={handleSave}
              >
                Save Invoice
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Add Sheet Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add New Sheet</ModalHeader>
              <ModalBody>
                <Input
                  label="Sheet Name"
                  value={newSheetName}
                  onChange={(e) => setNewSheetName(e.target.value)}
                  placeholder="e.g., Laboratory Tests, Medications"
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={addNewSheet}>
                  Add Sheet
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}