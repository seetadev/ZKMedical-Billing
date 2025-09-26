import { db } from "./config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { TemplateData, MSCData } from "../templates-data";

// Firebase template metadata interface
export interface FirebaseTemplateMeta {
  name: string;
  category: string;
  template_id: number;
  ImageUri?: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Firebase template data interface
export interface FirebaseTemplateData extends TemplateData {
  isFirebaseTemplate: boolean;
}

// Fetch all template metadata from Firebase
export const getFirebaseTemplateMetadata = async (): Promise<
  FirebaseTemplateMeta[]
> => {
  try {
    const templatesMetaRef = collection(db, "templatesMetaData");
    const q = query(templatesMetaRef, orderBy("name"), limit(50));
    const querySnapshot = await getDocs(q);

    const templates: FirebaseTemplateMeta[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as FirebaseTemplateMeta;
      templates.push({
        ...data,
        template_id: parseInt(doc.id), // Use document ID as template_id
      });
    });

    return templates;
  } catch (error) {
    console.error("Error fetching Firebase template metadata:", error);
    throw new Error("Failed to fetch templates from Firebase");
  }
};

// Fetch specific template data from Firebase
export const getFirebaseTemplateData = async (
  templateId: number
): Promise<FirebaseTemplateData | null> => {
  try {
    const templateRef = doc(db, "templatesData", templateId.toString());
    const templateSnap = await getDoc(templateRef);

    if (templateSnap.exists()) {
      const data = templateSnap.data() as TemplateData;
      return {
        ...data,
        isFirebaseTemplate: true,
      };
    } else {
      throw new Error(`Template with ID ${templateId} not found`);
    }
  } catch (error) {
    console.error("Error fetching Firebase template data:", error);
    throw error;
  }
};

// Validate template structure
export const validateTemplateStructure = (template: any): boolean => {
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
    if (!(field in template)) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }

  // Validate footers array
  if (!Array.isArray(template.footers) || template.footers.length === 0) {
    console.error("Invalid footers array");
    return false;
  }

  // Validate msc structure
  if (typeof template.msc !== "object") {
    console.error("Invalid msc structure");
    return false;
  }

  return true;
};

// Helper function to check if MSC data has required properties
export const isMSCDataValid = (msc: any): msc is MSCData => {
  return (
    msc &&
    typeof msc === "object" &&
    "currentid" in msc &&
    "currentname" in msc &&
    "numsheets" in msc &&
    "sheetArr" in msc
  );
};

// Local storage key for Firebase templates
const FIREBASE_TEMPLATES_STORAGE_KEY = "firebaseTemplates";

// Save Firebase template to local storage
export const saveFirebaseTemplateToLocalStorage = (
  templateId: number,
  templateData: FirebaseTemplateData
): void => {
  try {
    const existingTemplates = getFirebaseTemplatesFromLocalStorage();
    existingTemplates[templateId] = templateData;
    localStorage.setItem(
      FIREBASE_TEMPLATES_STORAGE_KEY,
      JSON.stringify(existingTemplates)
    );
  } catch (error) {
    console.error("Error saving Firebase template to local storage:", error);
  }
};

// Get Firebase templates from local storage
export const getFirebaseTemplatesFromLocalStorage = (): {
  [key: number]: FirebaseTemplateData;
} => {
  try {
    const stored = localStorage.getItem(FIREBASE_TEMPLATES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error(
      "Error reading Firebase templates from local storage:",
      error
    );
    return {};
  }
};

// Get specific Firebase template from local storage
export const getFirebaseTemplateFromLocalStorage = (
  templateId: number
): FirebaseTemplateData | null => {
  const templates = getFirebaseTemplatesFromLocalStorage();
  return templates[templateId] || null;
};

// Clear all Firebase templates from local storage
export const clearFirebaseTemplatesFromLocalStorage = (): void => {
  try {
    localStorage.removeItem(FIREBASE_TEMPLATES_STORAGE_KEY);
  } catch (error) {
    console.error(
      "Error clearing Firebase templates from local storage:",
      error
    );
  }
};
