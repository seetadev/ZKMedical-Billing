import { Preferences } from "@capacitor/preferences";
import CryptoJS from "crypto-js";

// Enhanced File class with template ID only
export class File {
  created: string;
  modified: string;
  name: string;
  content: string;
  billType: number;
  isEncrypted: boolean;
  password?: string;
  templateId: number;

  constructor(
    created: string,
    modified: string,
    content: string,
    name: string,
    billType: number,
    templateIdOrIsEncrypted?: number | boolean,
    isEncryptedOrPassword?: boolean | string,
    password?: string
  ) {
    this.created = created;
    this.modified = modified;
    this.content = content;
    this.name = name;
    this.billType = billType;

    // Handle backward compatibility
    if (typeof templateIdOrIsEncrypted === "boolean") {
      // Old constructor signature: (created, modified, content, name, billType, isEncrypted, password)
      this.isEncrypted = templateIdOrIsEncrypted;
      this.password = isEncryptedOrPassword as string;
      this.templateId = billType; // Use billType as default template ID for backward compatibility
    } else {
      // New constructor signature: (created, modified, content, name, billType, templateId, isEncrypted, password)
      this.templateId = templateIdOrIsEncrypted || billType;
      this.isEncrypted = (isEncryptedOrPassword as boolean) || false;
      this.password = password;
    }
  }
}

export class Local {
  // Encrypt content using AES
  private encryptContent = (content: string, password: string): string => {
    return CryptoJS.AES.encrypt(content, password).toString();
  };

  // Decrypt content using AES
  private decryptContent = (
    encryptedContent: string,
    password: string
  ): string => {
    const bytes = CryptoJS.AES.decrypt(encryptedContent, password);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  _saveFile = async (file: File) => {
    let data = {
      created: file.created,
      modified: file.modified,
      content: file.content,
      name: file.name,
      billType: file.billType,
      isEncrypted: file.isEncrypted,
      templateId: file.templateId,
    };

    // If file is password protected, encrypt the content
    if (file.isEncrypted && file.password) {
      data.content = this.encryptContent(file.content, file.password);
    }

    await Preferences.set({
      key: file.name,
      value: JSON.stringify(data),
    });
  };

  _getFile = async (name: string) => {
    const rawData = await Preferences.get({ key: name });
    return JSON.parse(rawData.value);
  };

  _getFileWithPassword = async (name: string, password: string) => {
    const rawData = await Preferences.get({ key: name });
    const data = JSON.parse(rawData.value);

    if (data.isEncrypted) {
      try {
        const decryptedContent = this.decryptContent(data.content, password);
        return {
          ...data,
          content: decryptedContent,
        };
      } catch (error) {
        throw new Error("Incorrect password or corrupted file");
      }
    }

    return data;
  };

  _getAllFiles = async () => {
    let arr = {};
    const { keys } = await Preferences.keys();
    for (let i = 0; i < keys.length; i++) {
      let fname = keys[i];
      const data = await this._getFile(fname);
      arr[fname] = {
        created: (data as any).created,
        modified: (data as any).modified,
        isEncrypted: (data as any).isEncrypted || false,
        templateId: (data as any).templateId || null,
      };
    }
    return arr;
  };

  _deleteFile = async (name: string) => {
    await Preferences.remove({ key: name });
  };

  _checkKey = async (key: string) => {
    const { keys } = await Preferences.keys();
    if (keys.includes(key, 0)) {
      return true;
    } else {
      return false;
    }
  };

  // Check if a file is password protected
  _isFileEncrypted = async (name: string): Promise<boolean> => {
    try {
      const data = await this._getFile(name);
      return data.isEncrypted || false;
    } catch (error) {
      return false;
    }
  };

  // Get files by template ID
  _getFilesByTemplate = async (templateId: number) => {
    const allFiles = await this._getAllFiles();
    const templateFiles = {};

    for (const [fileName, fileInfo] of Object.entries(allFiles)) {
      if ((fileInfo as any).templateId === templateId) {
        templateFiles[fileName] = fileInfo;
      }
    }

    return templateFiles;
  };

  // Get template ID for a specific file
  _getTemplateId = async (fileName: string): Promise<number | null> => {
    try {
      const data = await this._getFile(fileName);
      return data.templateId || null;
    } catch (error) {
      return null;
    }
  };

  // Update template ID for a file
  _updateTemplateId = async (fileName: string, templateId: number) => {
    try {
      const data = await this._getFile(fileName);
      data.templateId = templateId;
      data.modified = new Date().toISOString();

      await Preferences.set({
        key: fileName,
        value: JSON.stringify(data),
      });

      return true;
    } catch (error) {
      console.error("Error updating template ID:", error);
      return false;
    }
  };

  // Get unique template IDs from all files
  _getAvailableTemplates = async () => {
    const allFiles = await this._getAllFiles();
    const templateIds = new Set<number>();

    for (const fileInfo of Object.values(allFiles)) {
      const templateId = (fileInfo as any).templateId;
      if (templateId) {
        templateIds.add(templateId);
      }
    }

    return Array.from(templateIds);
  };
}
