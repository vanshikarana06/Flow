/**
 * FLOW Centralized API Client
 * Manages HTTP communication with FastAPI backend (http://localhost:4000/api/v1)
 * Handles automatic JWT attachment, response unnesting, and structured error propagation.
 */

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers: customHeaders, ...customOptions } = options;

  let url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  // Attach persisted JWT if available in client environment
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("flow_access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  if (customHeaders) {
    Object.assign(headers, customHeaders);
  }

  const response = await fetch(url, {
    headers,
    ...customOptions,
  });

  // Handle No Content
  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage = data?.detail || data?.message || `HTTP ${response.status}: Request failed`;
    throw new ApiError(errorMessage, response.status, data);
  }

  // Backend wraps payload in StandardResponse: { success: true, data: T }
  if (data && typeof data === "object" && "data" in data) {
    return data.data as T;
  }

  return data as T;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, { method: "GET", ...options }),

  post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, { 
      method: "POST", 
      body: body ? JSON.stringify(body) : undefined, 
      ...options 
    }),

  patch: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, { 
      method: "PATCH", 
      body: body ? JSON.stringify(body) : undefined, 
      ...options 
    }),

  put: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, { 
      method: "PUT", 
      body: body ? JSON.stringify(body) : undefined, 
      ...options 
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: "DELETE", ...options }),
};
