const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8888"; // Use environment variable with fallback

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

class ServerFilesService {
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

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await response.json();
    this.setToken(data.token);
    return data;
  }

  async register(
    credentials: RegisterCredentials
  ): Promise<{ success: boolean; message: string; user_id: number }> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Registration failed");
    }

    return await response.json();
  }

  async getFiles(): Promise<ServerFile[]> {
    const response = await fetch(`${API_BASE_URL}/server-files`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        throw new Error("Authentication required");
      }
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch files");
    }

    const data = await response.json();
    return data.files;
  }

  async uploadFile(file: File): Promise<{
    success: boolean;
    message: string;
    file_id: number;
    filename: string;
  }> {
    const formData = new FormData();
    formData.append("file", file);

    const headers: HeadersInit = {};
    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/server-files/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        throw new Error("Authentication required");
      }
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    return await response.json();
  }

  async uploadInvoiceData(
    filename: string,
    content: string,
    billType: number
  ): Promise<{
    success: boolean;
    message: string;
    file_id: number;
    filename: string;
  }> {
    // Create a JSON file with the invoice data
    const fileData = {
      fileName: `server_${filename}`,
      content: content,
      timestamp: new Date().toISOString(),
      billType: billType,
    };

    // Create a Blob from the JSON data
    const jsonBlob = new Blob([JSON.stringify(fileData, null, 2)], {
      type: "application/json",
    });

    // Create a File object from the Blob
    const file = new File([jsonBlob], `server_${filename}.json`, {
      type: "application/json",
    });

    // Use the existing uploadFile method
    return await this.uploadFile(file);
  }

  async downloadFile(fileId: number): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/server-files/download/${fileId}`,
      {
        method: "GET",
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        throw new Error("Authentication required");
      }
      if (response.status === 404) {
        throw new Error("File not found");
      }
      const error = await response.json();
      throw new Error(error.error || "Download failed");
    }

    return await response.blob();
  }

  async deleteFile(
    fileId: number
  ): Promise<{ success: boolean; message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/server-files/delete/${fileId}`,
      {
        method: "DELETE",
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        throw new Error("Authentication required");
      }
      if (response.status === 404) {
        throw new Error("File not found");
      }
      const error = await response.json();
      throw new Error(error.error || "Delete failed");
    }

    return await response.json();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const serverFilesService = new ServerFilesService();
