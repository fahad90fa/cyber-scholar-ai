import { SecurityUtils, RequestSecurity } from '@/lib/security';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_V1_PREFIX = "/api/v1";
const API_PREFIX = "/api";
const SUPABASE_FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL || "https://nixiiarwumhbivyqysws.supabase.co"}/functions/v1`;

export interface ApiError {
  detail: string;
}

class ApiClient {
  private baseURL: string;
  private apiPrefix: string;
  private token: string | null = null;

  constructor(baseURL: string, apiPrefix: string = API_V1_PREFIX) {
    this.baseURL = baseURL;
    this.apiPrefix = apiPrefix;
    this.token = localStorage.getItem("auth_token");
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  getToken() {
    return this.token || localStorage.getItem("auth_token");
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  private getHeaders(includeAuth = true, includeAdminAuth = false): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    };

    if (includeAdminAuth) {
      const adminToken = this.getAdminToken();
      if (adminToken) {
        headers["Authorization"] = `Bearer ${adminToken}`;
      }
    } else if (includeAuth) {
      const token = this.getToken();
      if (token) {
        if (this.isTokenExpired(token)) {
          console.warn("Token is expired, clearing and rethrowing");
          this.clearToken();
          throw new Error("Token expired - please login again");
        }
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return RequestSecurity.addSecurityHeaders(headers as Record<string, string>) as HeadersInit;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return true;

      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) return false;

      const expTime = payload.exp * 1000;
      const now = Date.now();
      const isExpired = now > expTime;

      if (isExpired) {
        console.warn(`Token expired at ${new Date(expTime).toISOString()}, now is ${new Date(now).toISOString()}`);
      }

      return isExpired;
    } catch (error) {
      console.warn("Error checking token expiration:", error);
      return true;
    }
  }

  private getAdminToken(): string | null {
    return localStorage.getItem("admin_token");
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    if (!RequestSecurity.validateURL(`${this.baseURL}${endpoint}`)) {
      throw new Error('Invalid URL endpoint');
    }

    let url = endpoint;
    if (params) {
      const sanitizedParams = RequestSecurity.sanitizeURLParams(params);
      const queryParams = new URLSearchParams();
      Object.entries(sanitizedParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    return url;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includePrefix = true,
    params?: Record<string, string | number | boolean>
  ): Promise<T> {
    const isAdminRoute = endpoint.startsWith("/admin");
    const prefix = includePrefix ? this.apiPrefix : "";
    const builtEndpoint = this.buildUrl(endpoint, params);
    
    const url = `${this.baseURL}${prefix}${builtEndpoint}`;
    
    try {
      const headers: Record<string, string> = {
        ...this.getHeaders(!isAdminRoute, isAdminRoute),
        ...options.headers,
      } as Record<string, string>;
      
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
        mode: "cors",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          detail: "An error occurred",
        }));
        
        if (response.status === 401) {
          this.clearToken();
          const err = new Error(`Authentication failed: ${error.detail || "Invalid or expired token. Please login again."}`) as any;
          err.status = 401;
          throw err;
        }
        
        const err = new Error(error.detail || error.message || `HTTP ${response.status}`) as any;
        err.status = response.status;
        throw err;
      }

      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof Error && error.message.includes("Token expired")) {
        throw error;
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, includePrefix = true, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" }, includePrefix, params);
  }

  async post<T>(endpoint: string, data?: any, includePrefix = true, params?: Record<string, any>): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      },
      includePrefix,
      params
    );
  }

  async put<T>(endpoint: string, data?: any, includePrefix = true, params?: Record<string, any>): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      },
      includePrefix,
      params
    );
  }

  async delete<T>(endpoint: string, includePrefix = true, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" }, includePrefix, params);
  }
}

const apiClient = new ApiClient(API_BASE_URL);

export const authAPI = {
  register: (email: string, username: string, password: string) =>
    apiClient.post("/auth/register", { email, username, password }),

  login: (email: string, password: string) =>
    apiClient.post("/auth/login", { email, password }),

  getCurrentUser: () => apiClient.get("/auth/me"),
};

export const chatAPI = {
  sendMessage: (message: string, sessionId?: string) =>
    apiClient.post("/chat/message", { message, session_id: sessionId }),

  getSessions: () => apiClient.get("/chat/sessions"),

  getSession: (sessionId: string) => apiClient.get(`/chat/session/${sessionId}`),

  deleteSession: (sessionId: string) =>
    apiClient.delete(`/chat/session/${sessionId}`),
};

export const trainingAPI = {
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const url = `${baseURL}/api/v1/training/upload`;
    const token = apiClient.getToken();
    const headers: HeadersInit = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
      mode: "cors",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: "Upload failed",
      }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  },

  uploadDocumentWithChecksum: async (file: File, clientChecksum: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("client_checksum", clientChecksum);

    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const url = `${baseURL}/api/v1/training/upload-with-verify`;
    const token = apiClient.getToken();
    const headers: HeadersInit = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
      mode: "cors",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: "Upload failed",
      }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  },

  getDocuments: () => apiClient.get("/training/documents"),

  deleteDocument: (sourceName: string) =>
    apiClient.delete(`/training/documents/${sourceName}`),

  verifyDocumentIntegrity: (sourceName: string) =>
    apiClient.get(`/training/documents/${sourceName}/verify`),

  verifyTwoWayIntegrity: (sourceName: string) =>
    apiClient.get(`/training/documents/${sourceName}/verify-two-way`),

  testRetrieval: (query: string) =>
    apiClient.get(`/training/test-retrieval?query=${encodeURIComponent(query)}`),
};

export const trainingChatAPI = {
  sendTrainingMessage: (message: string) =>
    apiClient.post("/training/chat", { message }),

  getTrainingDocuments: () => apiClient.get("/training/documents"),

  getTrainingChatHistory: () => apiClient.get("/training/chat-history"),

  clearTrainingChatHistory: () => apiClient.delete("/training/chat-history"),
};

export const modulesAPI = {
  getModules: () => apiClient.get("/modules"),

  getModule: (moduleId: string) => apiClient.get(`/modules/${moduleId}`),
};

export const smartTaskAPI = {
  generateTasks: async (input: {
    topic: string;
    description?: string;
    difficulty?: "beginner" | "intermediate" | "advanced";
    learningStyle?: string;
  }) => {
    const url = `${SUPABASE_FUNCTIONS_URL}/smart-task`;
    const token = apiClient.getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(input),
      credentials: "include",
      mode: "cors",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: "Failed to generate tasks",
      }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  },

  analyzeChallenges: async (challenges: {
    title: string;
    description: string;
    category?: string;
  }[]) => {
    const url = `${SUPABASE_FUNCTIONS_URL}/smart-task`;
    const token = apiClient.getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        action: "analyze",
        challenges,
      }),
      credentials: "include",
      mode: "cors",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: "Failed to analyze challenges",
      }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  },

  breakdownConcept: async (concept: string, depth?: "overview" | "detailed" | "expert") => {
    const url = `${SUPABASE_FUNCTIONS_URL}/smart-task`;
    const token = apiClient.getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        action: "breakdown",
        concept,
        depth: depth || "detailed",
      }),
      credentials: "include",
      mode: "cors",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: "Failed to breakdown concept",
      }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  },
};

export { apiClient };
