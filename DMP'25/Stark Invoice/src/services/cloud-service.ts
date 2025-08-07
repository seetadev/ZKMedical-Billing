import { Capacitor } from "@capacitor/core";

// Function to get the appropriate API base URL based on platform
const getApiBaseUrl = (): string => {
  // Check if we have an environment variable set
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // For Capacitor native apps, we need to use the computer's IP address
  if (Capacitor.isNativePlatform()) {
    // TODO: Replace with your actual computer's IP address
    // You can find your IP with: ifconfig (Linux/Mac) or ipconfig (Windows)
    return "http://192.168.110.61:8080"; // Replace with your actual IP
  }

  // For web development, use proxy to avoid CORS issues
  if (import.meta.env.DEV) {
    return "/api"; // This will use the Vite proxy
  }

  // For production web, use direct server URL
  return "http://localhost:8080";
};

const API_BASE_URL = getApiBaseUrl();

export interface ServerFile {
  id: number;
  filename: string;
  s3_key: string;
  created_at: string;
  file_size: number;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface Logo {
  id: number;
  filename: string;
  s3_key: string;
  logo_url: string;
  file_size: number;
  content_type: string;
  created_at: string;
}

export interface LogoResponse {
  success: boolean;
  logos: Logo[];
}

export interface UploadLogoResponse {
  success: boolean;
  logo_id: number;
  filename: string;
  logo_url: string;
  file_size: number;
  message: string;
}

export interface PDFGenerationRequest {
  html_content?: string;
  url?: string;
  filename?: string;
  options?: {
    "page-size"?: string;
    "margin-top"?: string;
    "margin-right"?: string;
    "margin-bottom"?: string;
    "margin-left"?: string;
    orientation?: string;
    [key: string]: any;
  };
  user_id: string;
}

export interface PDFGenerationResponse {
  success: boolean;
  file_id: number;
  filename: string;
  s3_key: string;
  source_type: string;
  size: number;
  message: string;
}

export interface UserPDF {
  id: number;
  filename: string;
  created_at: string;
  source_type: string;
  original_url?: string;
}

export interface PDFListResponse {
  success: boolean;
  count: number;
  pdfs: UserPDF[];
}

class CloudService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("server_auth_token", token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem("server_auth_token");
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("server_auth_token");
    localStorage.removeItem("user_info"); // Clear user info as well
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // ----------------------- Authentication Functions -------------------------------
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: credentials.email,
          password: credentials.password,
          react_app: "true",
        }),
      });

      // Handle successful JSON response
      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          // Login successful - use JWT token from server
          const userData = {
            success: true,
            token: data.token, // Use actual JWT token from server
            user: {
              id: Date.now(), // You might want to get this from server response
              name: data.user.split("@")[0], // Extract name from email
              email: data.user,
            },
          };

          this.setToken(userData.token);
          localStorage.setItem("user_info", JSON.stringify(userData.user));
          return userData;
        } else {
          // Server returned success: false
          throw new Error(
            data.message ||
              "Authentication failed. Please check your credentials."
          );
        }
      }

      // Handle error responses
      if (response.status === 401) {
        const errorData = await response.json();
        if (errorData.error === "INVALID_CREDENTIALS") {
          throw new Error(
            "Invalid email or password. Please check your credentials."
          );
        }
        throw new Error(
          errorData.message ||
            "Authentication failed. Please check your credentials."
        );
      }

      // Handle other error status codes
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Login failed with status ${response.status}`
      );
    } catch (error) {
      console.log(error);
      if (error instanceof TypeError && error.message.includes("CORS")) {
        throw new Error(
          "Server connection failed. Please check if the server is running and CORS is configured."
        );
      }
      if (error instanceof SyntaxError) {
        throw new Error(
          "Invalid response from server. Please check server configuration."
        );
      }
      throw error;
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: credentials.email,
          password: credentials.password,
          react_app: "true",
        }),
      });

      // Handle successful JSON response
      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          // Registration successful - return success without token (no auto-login)
          return {
            success: true,
            token: "", // No token for registration - user needs to login separately
            user: {
              id: Date.now(),
              name: credentials.name,
              email: credentials.email,
            },
          };
        } else {
          // Server returned success: false
          throw new Error(
            data.message || "Registration failed. Please try again."
          );
        }
      }

      // Handle error responses
      if (response.status === 409) {
        const errorData = await response.json();
        if (errorData.error === "USER_EXISTS") {
          throw new Error(
            "User already exists. Please try logging in instead."
          );
        }
        throw new Error(
          errorData.message ||
            "User already exists. Please try logging in instead."
        );
      }

      // Handle other error status codes
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Registration failed with status ${response.status}`
      );
    } catch (error) {
      console.log(error);
      if (error instanceof TypeError && error.message.includes("CORS")) {
        throw new Error(
          "Server connection failed. Please check if the server is running and CORS is configured."
        );
      }
      if (error instanceof SyntaxError) {
        throw new Error(
          "Invalid response from server. Please check server configuration."
        );
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    // Clear local authentication data
    this.clearToken();
  }

  // ------------file operations - save,retrieve, download, delete--------------------
  async uploadFile(file: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const headers: HeadersInit = {};

      // Add JWT token to headers if available
      const token = this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/fileops`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("User not authenticated. Please login first.");
        }
        if (response.status === 409) {
          throw new Error(
            "File already exists. Please choose a different name."
          );
        }
        throw new Error(`Failed to upload file: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  async getFiles(): Promise<{ files: ServerFile[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/fileops`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("User not authenticated. Please login first.");
        }
        throw new Error(`Failed to fetch files: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching files:", error);
      throw error;
    }
  }

  async downloadFileByName(filename: string): Promise<Blob> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/fileops?filename=${encodeURIComponent(filename)}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("User not authenticated. Please login first.");
        }
        if (response.status === 404) {
          throw new Error("File not found.");
        }
        throw new Error(`Failed to download file: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  }

  async deleteFileByName(filename: string): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/fileops?filename=${encodeURIComponent(filename)}`,
        {
          method: "DELETE",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("User not authenticated. Please login first.");
        }
        if (response.status === 404) {
          throw new Error("File not found.");
        }
        throw new Error(`Failed to delete file: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  // -------------------------------Pdf to Html on Server-------------------------------
  async convertHTMLToPDF(htmlContent: string, options: any): Promise<Blob> {
    try {
      const payload = {
        html_content: htmlContent,
        filename: options.filename || "document.pdf",
        pdfOptions: options.pdfOptions || {},
        user_id: this.getCurrentUserId() || "unknown",
      };

      const response = await fetch(`${API_BASE_URL}/directhtmltopdf`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to convert HTML to PDF: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error("Error converting HTML to PDF:", error);
      throw error;
    }
  }

  // Helper method to get user ID (you may need to adjust this based on your auth implementation)
  getCurrentUserId(): string | null {
    // This is a placeholder - you'll need to implement this based on how you store user info
    // You might get this from the JWT token or store it separately after login
    const userInfo = localStorage.getItem("user_info");
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        return parsed.id?.toString() || parsed.user?.id?.toString();
      } catch (error) {
        console.error("Error parsing user info:", error);
      }
    }
    return null;
  }

  getCurrentUserInfo(): { id: number; name: string; email: string } | null {
    const userInfo = localStorage.getItem("user_info");
    if (userInfo) {
      try {
        return JSON.parse(userInfo);
      } catch (error) {
        console.error("Error parsing user info:", error);
      }
    }
    return null;
  }

  // ------------------------- Logo API Functions --------------------------

  /**
   * Upload a logo image for the authenticated user
   */
  async uploadLogo(logoFile: File): Promise<UploadLogoResponse> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error("User not authenticated. Please login first.");
      }

      if (!logoFile) {
        throw new Error("No file provided for upload.");
      }

      // Validate file type
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/gif",
        "image/webp",
        "image/svg+xml",
      ];

      if (!allowedTypes.includes(logoFile.type)) {
        throw new Error(
          "Invalid file type. Only images are allowed (PNG, JPG, JPEG, GIF, WebP, SVG)"
        );
      }

      // Validate file size (max 5MB)
      if (logoFile.size > 5 * 1024 * 1024) {
        throw new Error("File size too large. Maximum 5MB allowed");
      }

      // Validate file name
      if (logoFile.name.length > 255) {
        throw new Error("File name too long. Maximum 255 characters allowed");
      }

      const formData = new FormData();
      formData.append("logo", logoFile);

      const headers: HeadersInit = {};
      const token = this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/logos`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("User not authenticated. Please login first.");
        }
        if (response.status === 409) {
          throw new Error(
            "A logo with this name already exists. Please choose a different file name."
          );
        }
        if (response.status === 400) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Invalid file or missing data.");
        }
        if (response.status === 413) {
          throw new Error("File too large. Maximum 5MB allowed.");
        }
        if (response.status === 415) {
          throw new Error(
            "Unsupported file type. Please use PNG, JPG, JPEG, GIF, WebP, or SVG."
          );
        }
        throw new Error(`Failed to upload logo: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to upload logo");
      }

      return result;
    } catch (error) {
      console.error("Error uploading logo:", error);
      throw error;
    }
  }

  /**
   * Get all logos for the authenticated user
   */
  async getLogos(): Promise<Logo[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/logos`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("User not authenticated. Please login first.");
        }
        throw new Error(`Failed to fetch logos: ${response.status}`);
      }

      const result = await response.json();
      return result.logos || [];
    } catch (error) {
      console.error("Error fetching logos:", error);
      throw error;
    }
  }

  /**
   * Delete a specific logo by filename
   */
  async deleteLogo(logoId: number): Promise<void> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error("User not authenticated. Please login first.");
      }

      // First get the logo to find its filename
      const logos = await this.getLogos();
      const logoToDelete = logos.find((logo) => logo.id === logoId);

      if (!logoToDelete) {
        throw new Error("Logo not found");
      }

      // Extract filename from the logo_url
      const filename = logoToDelete.logo_url.split("/").pop();
      if (!filename) {
        throw new Error("Invalid logo filename");
      }

      const response = await fetch(
        `${API_BASE_URL}/logos?filename=${encodeURIComponent(filename)}`,
        {
          method: "DELETE",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("User not authenticated. Please login first.");
        }
        if (response.status === 404) {
          throw new Error("Logo not found or already deleted.");
        }
        if (response.status === 403) {
          throw new Error("You don't have permission to delete this logo.");
        }
        throw new Error(`Failed to delete logo: ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to delete logo");
      }
    } catch (error) {
      console.error("Error deleting logo:", error);
      throw error;
    }
  }

  /**
   * Get logo file data directly
   */
  async getLogoFile(logoUrl: string): Promise<Blob> {
    try {
      const response = await fetch(`${API_BASE_URL}${logoUrl}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("User not authenticated. Please login first.");
        }
        if (response.status === 404) {
          throw new Error("Logo not found.");
        }
        throw new Error(`Failed to fetch logo: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error("Error fetching logo file:", error);
      throw error;
    }
  }

  /**
   * Convert logo URL to base64 data URL for embedding in spreadsheet
   */
  async convertUrlToBase64(logoUrl: string): Promise<{ data_url: string }> {
    try {
      if (!logoUrl) {
        throw new Error("No logo URL provided");
      }

      if (!this.isAuthenticated()) {
        throw new Error("User not authenticated. Please login first.");
      }

      // Get the logo file as blob
      const blob = await this.getLogoFile(logoUrl);

      if (!blob || blob.size === 0) {
        throw new Error("Logo file is empty or corrupted");
      }

      // Check if blob is a valid image type
      if (!blob.type.startsWith("image/")) {
        throw new Error("File is not a valid image");
      }

      // Convert blob to base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          const result = reader.result as string;
          if (!result || !result.startsWith("data:")) {
            reject(new Error("Failed to generate valid base64 data URL"));
            return;
          }
          resolve({ data_url: result });
        };

        reader.onerror = () => {
          reject(new Error("Failed to read logo file"));
        };

        reader.onabort = () => {
          reject(new Error("Logo file read was aborted"));
        };

        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting logo URL to base64:", error);
      throw error;
    }
  }
}

export const cloudService = new CloudService();
