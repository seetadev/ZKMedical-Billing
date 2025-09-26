import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./config";

// Interface for invoice document
export interface InvoiceDocument {
  invoiceId: number;
  templateId: number;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  status: "draft" | "finalized" | "sent";
  customerName?: string;
  amount?: number;
  metadata?: any;
}

// Get the next available invoice ID
export const getNextInvoiceId = async (): Promise<number> => {
  try {
    const q = query(
      collection(db, "invoices"),
      orderBy("invoiceId", "desc"),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return 70001; // Start from 70001 if no invoices exist
    }

    const lastInvoice = querySnapshot.docs[0].data() as InvoiceDocument;
    return (lastInvoice.invoiceId || 70000) + 1;
  } catch (error) {
    console.error("Error getting next invoice ID:", error);
    return 70001; // Default fallback
  }
};

// Create a new invoice document
export const createInvoice = async (
  templateId: number,
  userId?: string,
  metadata?: any
): Promise<string> => {
  try {
    const invoiceId = await getNextInvoiceId();

    const invoiceDoc: InvoiceDocument = {
      invoiceId,
      templateId,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId,
      status: "draft",
      metadata,
    };

    const docRef = await addDoc(collection(db, "invoices"), invoiceDoc);
    return docRef.id;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};

// Update invoice
export const updateInvoice = async (
  invoiceDocId: string,
  updates: Partial<InvoiceDocument>
): Promise<void> => {
  try {
    const invoiceRef = doc(db, "invoices", invoiceDocId);
    await updateDoc(invoiceRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
};

// Get all invoices (for admin/user dashboard)
export const getAllInvoices = async (
  userId?: string
): Promise<Array<InvoiceDocument & { id: string }>> => {
  try {
    let q;
    if (userId) {
      q = query(collection(db, "invoices"), orderBy("createdAt", "desc"));
      // Note: For user filtering, you might want to add a where clause
      // but it requires a composite index in Firestore
    } else {
      q = query(collection(db, "invoices"), orderBy("createdAt", "desc"));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as InvoiceDocument),
    })) as Array<InvoiceDocument & { id: string }>;
  } catch (error) {
    console.error("Error getting invoices:", error);
    throw error;
  }
};
