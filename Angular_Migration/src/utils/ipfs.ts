import axios from "axios";

// IPFS configuration
const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;
const PINATA_GATEWAY =
  import.meta.env.VITE_PINATA_GATEWAY || "https://gateway.pinata.cloud";

export interface IPFSUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

/**
 * Upload file to IPFS via Pinata
 */
export async function uploadFileToIPFS(file: File): Promise<string> {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("Pinata API credentials not configured");
  }

  const formData = new FormData();
  formData.append("file", file);

  const metadata = JSON.stringify({
    name: `medical-invoice-${Date.now()}`,
    keyvalues: {
      type: "medical-invoice",
      timestamp: new Date().toISOString(),
    },
  });
  formData.append("pinataMetadata", metadata);

  const options = JSON.stringify({
    cidVersion: 0,
  });
  formData.append("pinataOptions", options);

  try {
    const response = await axios.post<IPFSUploadResponse>(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw new Error("Failed to upload file to IPFS");
  }
}

/**
 * Upload JSON data to IPFS via Pinata
 */
export async function uploadJSONToIPFS(
  data: any,
  filename?: string
): Promise<string> {
  console.log("Uploading JSON to IPFS:", data);
  console.log("Filename:", filename);
  console.log("Pinata API Key:", PINATA_API_KEY);
  console.log("Pinata Secret Key:", PINATA_SECRET_KEY);
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("Pinata API credentials not configured");
  }

  const metadata = {
    name: filename || `medical-data-${Date.now()}`,
    keyvalues: {
      type: "medical-data",
      timestamp: new Date().toISOString(),
    },
  };

  try {
    const response = await axios.post<IPFSUploadResponse>(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        pinataContent: data,
        pinataMetadata: metadata,
        pinataOptions: {
          cidVersion: 0,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_KEY,
        },
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading JSON to IPFS:", error);
    throw new Error("Failed to upload JSON to IPFS");
  }
}

/**
 * Retrieve file from IPFS
 */
export async function getFileFromIPFS(hash: string): Promise<any> {
  try {
    const response = await axios.get(`${PINATA_GATEWAY}/ipfs/${hash}`);
    return response.data;
  } catch (error) {
    console.error("Error retrieving file from IPFS:", error);
    throw new Error("Failed to retrieve file from IPFS");
  }
}

/**
 * Get IPFS file URL
 */
export function getIPFSUrl(hash: string): string {
  return `${PINATA_GATEWAY}/ipfs/${hash}`;
}

/**
 * Download file content from IPFS
 */
export async function downloadFromIPFS(hash: string): Promise<string> {
  try {
    const response = await axios.get(`${PINATA_GATEWAY}/ipfs/${hash}`, {
      responseType: "text",
    });
    return response.data;
  } catch (error) {
    console.error("Error downloading file from IPFS:", error);
    throw new Error("Failed to download file from IPFS");
  }
}

/**
 * Upload medical invoice file with metadata
 */
export async function uploadMedicalInvoice(
  file: File,
  metadata: {
    patientName?: string;
    doctorName?: string;
    date?: string;
    invoiceNumber?: string;
    description?: string;
  }
): Promise<string> {
  // First upload the file
  const fileHash = await uploadFileToIPFS(file);

  // Then upload metadata linking to the file
  const invoiceData = {
    fileHash,
    filename: file.name,
    fileSize: file.size,
    fileType: file.type,
    uploadedAt: new Date().toISOString(),
    ...metadata,
  };

  const metadataHash = await uploadJSONToIPFS(
    invoiceData,
    `invoice-metadata-${Date.now()}`
  );

  return metadataHash; // Return metadata hash to store in contract
}
