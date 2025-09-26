import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "./config";
import { LocalFile } from "../components/Storage/LocalStorage";

export interface CloudFile {
  id: string;
  name: string;
  content: string;
  created: string;
  modified: string;
  billType: number;
  templateId: number;
  isEncrypted: boolean;
  userId: string;
  createdAt: Timestamp;
  modifiedAt: Timestamp;
}

export class CloudStorage {
  private getUserId(): string | null {
    return auth.currentUser?.uid || null;
  }

  private isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  // Save file to cloud
  saveFileToCloud = async (file: LocalFile): Promise<boolean> => {
    if (!this.isAuthenticated()) {
      throw new Error("User must be authenticated to save files to cloud");
    }

    const userId = this.getUserId();
    if (!userId) {
      throw new Error("Unable to get user ID");
    }

    try {
      const cloudFile: Omit<CloudFile, "id"> = {
        name: file.name,
        content: file.content,
        created: file.created,
        modified: file.modified,
        billType: file.billType,
        templateId: file.templateId,
        isEncrypted: file.isEncrypted,
        userId: userId,
        createdAt: serverTimestamp() as Timestamp,
        modifiedAt: serverTimestamp() as Timestamp,
      };

      // Use the file name as the document ID to prevent duplicates
      const docRef = doc(db, "files", `${userId}_${file.name}`);
      await setDoc(docRef, cloudFile);

      return true;
    } catch (error) {
      console.error("Error saving file to cloud:", error);
      throw error;
    }
  };

  // Get all user's cloud files
  getCloudFiles = async (): Promise<CloudFile[]> => {
    if (!this.isAuthenticated()) {
      return [];
    }

    const userId = this.getUserId();
    if (!userId) {
      return [];
    }

    try {
      const q = query(
        collection(db, "files"),
        where("userId", "==", userId),
        orderBy("modifiedAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const files: CloudFile[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        files.push({
          id: doc.id,
          ...data,
        } as CloudFile);
      });

      return files;
    } catch (error) {
      console.error("Error getting cloud files:", error);
      throw error;
    }
  };

  // Get a specific cloud file
  getCloudFile = async (fileName: string): Promise<CloudFile | null> => {
    if (!this.isAuthenticated()) {
      return null;
    }

    const userId = this.getUserId();
    if (!userId) {
      return null;
    }

    try {
      const docRef = doc(db, "files", `${userId}_${fileName}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as CloudFile;
      }

      return null;
    } catch (error) {
      console.error("Error getting cloud file:", error);
      throw error;
    }
  };

  // Delete file from cloud
  deleteCloudFile = async (fileName: string): Promise<boolean> => {
    if (!this.isAuthenticated()) {
      throw new Error("User must be authenticated to delete files from cloud");
    }

    const userId = this.getUserId();
    if (!userId) {
      throw new Error("Unable to get user ID");
    }

    try {
      const docRef = doc(db, "files", `${userId}_${fileName}`);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error("Error deleting cloud file:", error);
      throw error;
    }
  };

  // Convert CloudFile to LocalFile for local storage
  cloudFileToLocalFile = (cloudFile: CloudFile): LocalFile => {
    return new LocalFile(
      cloudFile.created,
      cloudFile.modified,
      cloudFile.content,
      cloudFile.name,
      cloudFile.billType,
      cloudFile.templateId,
      cloudFile.isEncrypted
    );
  };

  // Check if file exists in cloud
  fileExistsInCloud = async (fileName: string): Promise<boolean> => {
    const file = await this.getCloudFile(fileName);
    return !!file;
  };
}

export const cloudStorage = new CloudStorage();
