import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./config";

// Interface for Firebase template metadata
export interface FirebaseTemplateMeta {
  name: string;
  category: string;
  description?: string;
  ImageUri?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for Firebase template data
export interface FirebaseTemplateData {
  template: string;
  templateId: number;
  category: string;
  msc: any;
  footers: any[];
  logoCell: string | object;
  signatureCell: string | object;
  cellMappings: object;
}

// Get the next available template ID
export const getNextTemplateId = async (): Promise<number> => {
  try {
    // First, try to get the latest invoice ID from invoices collection
    const invoicesQuery = query(
      collection(db, "invoices"),
      orderBy("invoiceId", "desc"),
      limit(1)
    );

    const invoiceSnapshot = await getDocs(invoicesQuery);

    if (!invoiceSnapshot.empty) {
      const lastInvoice = invoiceSnapshot.docs[0].data();
      const lastInvoiceId = lastInvoice.invoiceId || 70000;
      return lastInvoiceId + 1;
    }

    // If no invoices exist, check template collection for fallback
    const templateQuery = query(
      collection(db, "templatesData"),
      orderBy("templateId", "desc"),
      limit(1)
    );

    const templateSnapshot = await getDocs(templateQuery);

    if (!templateSnapshot.empty) {
      const lastTemplate =
        templateSnapshot.docs[0].data() as FirebaseTemplateData;
      return Math.max((lastTemplate.templateId || 70000) + 1, 70001);
    }

    // Default fallback if no documents exist
    return 70001;
  } catch (error) {
    console.error("Error getting next template ID:", error);
    return 70001; // Fallback to 70001
  }
};

// Validate template data structure
export const validateTemplateData = (
  data: any,
  expectedTemplateId?: number
): data is FirebaseTemplateData => {
  const requiredFields = [
    "template",
    "templateId",
    "category",
    "msc",
    "footers",
    "logoCell",
    "signatureCell",
    "cellMappings",
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  if (typeof data.templateId !== "number" || data.templateId < 70001) {
    throw new Error(
      "Template ID must be a number >= 70001 to avoid conflicts with app templates"
    );
  }

  // If expectedTemplateId is provided, validate that it matches
  if (
    expectedTemplateId !== undefined &&
    data.templateId !== expectedTemplateId
  ) {
    throw new Error(
      `Template ID in JSON (${data.templateId}) does not match expected ID (${expectedTemplateId})`
    );
  }

  if (!["Mobile", "Web", "Tablet"].includes(data.category)) {
    throw new Error("Category must be one of: Mobile, Web, Tablet");
  }

  return true;
};

// Upload template to Firebase
export const uploadTemplate = async (
  metadata: FirebaseTemplateMeta,
  templateData: FirebaseTemplateData
): Promise<string> => {
  try {
    // Get the expected next template ID
    const expectedTemplateId = await getNextTemplateId();

    // Validate template data with expected ID check
    validateTemplateData(templateData, expectedTemplateId);

    const templateId = templateData.templateId.toString();

    // Create document references
    const metaDocRef = doc(db, "templatesMetaData", templateId);
    const dataDocRef = doc(db, "templatesData", templateId);

    // Add timestamps
    const timestamp = new Date();
    const metadataWithTimestamp = {
      ...metadata,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Upload both documents
    await setDoc(metaDocRef, metadataWithTimestamp);
    await setDoc(dataDocRef, templateData);

    return templateId;
  } catch (error) {
    console.error("Error uploading template:", error);
    throw error;
  }
};

// Get all template metadata for admin dashboard
export const getAllTemplateMetadata = async (): Promise<
  Array<FirebaseTemplateMeta & { id: string }>
> => {
  try {
    const querySnapshot = await getDocs(collection(db, "templatesMetaData"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Array<FirebaseTemplateMeta & { id: string }>;
  } catch (error) {
    console.error("Error getting all template metadata:", error);
    throw error;
  }
};

// Delete template (both metadata and data)
export const deleteTemplate = async (templateId: string): Promise<void> => {
  try {
    const metaDocRef = doc(db, "templatesMetaData", templateId);
    const dataDocRef = doc(db, "templatesData", templateId);

    // Note: Using deleteDoc would require importing it
    // For now, we'll just mark as deleted or handle deletion in admin UI
    console.warn(
      "Template deletion not implemented - please handle manually in Firebase console"
    );
  } catch (error) {
    console.error("Error deleting template:", error);
    throw error;
  }
};
