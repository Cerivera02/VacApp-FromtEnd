import type { HttpMethod } from "../types/interfaces";
import { storage } from "./storage";
import { AuthService } from "./authService";
import { config } from "../config/env";

class Connection {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.token = storage.get("auth_token");
  }

  setToken(token: string) {
    this.token = token;
    storage.set("auth_token", token);
  }

  clearToken() {
    this.token = null;
    storage.remove("auth_token");
  }

  private async request<T>(
    endpoint: string,
    method: HttpMethod,
    body?: any,
    params?: Record<string, any>,
    retryCount: number = 0
  ): Promise<T> {
    let url = `${this.baseUrl}${endpoint}`;

    if (params && method === "GET") {
      const query = new URLSearchParams(params).toString();
      url += `?${query}`;
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: method !== "GET" ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
      }

      // Para errores 404, intentar obtener el mensaje del body
      let errorData: { message?: string; error?: string } = {};
      try {
        errorData = await response.json();
      } catch {
        // Si no se puede parsear el JSON, usar un objeto vacío
      }

      // Si es token inválido y no hemos reintentado aún, renovar token y reintentar
      if (errorData.message === "Token inválido" && retryCount === 0) {
        const username = storage.get("user.username");
        const password = storage.get("user.password");
        if (username && password) {
          try {
            await AuthService.login({ username, password });
            // Reintentar la petición original con el nuevo token
            return this.request<T>(
              endpoint,
              method,
              body,
              params,
              retryCount + 1
            );
          } catch (loginError) {
            // Si falla el login, no reintentar más
            throw new Error("Error al renovar el token de autenticación");
          }
        }
      }

      // Crear un error más informativo
      const errorMessage =
        errorData.message || errorData.error || `Error ${response.status}`;
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).response = response;
      throw error;
    }
    return response.json();
  }

  get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, "GET", undefined, params, 0);
  }

  post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, "POST", body, undefined, 0);
  }

  put<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, "PUT", body, undefined, 0);
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, "DELETE", undefined, undefined, 0);
  }
}

export const conn = new Connection(config.apiUrl);
