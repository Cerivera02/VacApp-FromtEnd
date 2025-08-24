import { conn } from "./connection";
import type { LoginResponse, LoginRequest } from "../types/interfaces";
import { jwtDecode } from "jwt-decode";
import { storage } from "./storage";
import { MarcaService } from "./marcaService";

export const AuthService = {
  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    const response = await conn.post<LoginResponse>("/usuarios/login", {
      username: loginRequest.username,
      password: loginRequest.password,
    });

    if (response.token) {
      const decodedToken = jwtDecode(response.token);
      const { exp, iat, ...userData } = decodedToken as any;

      storage.set("auth_token", response.token);
      storage.set("user", userData);
      storage.set("user.username", loginRequest.username);
      storage.set("user.password", loginRequest.password);
      conn.setToken(response.token);

      try {
        const marcas = await MarcaService.getTodasLasMarcas();

        if (marcas.length > 0) {
          let marcaUsuario = marcas.find(
            (marca) => marca.usuario_id === userData.id
          );

          const userWithPropietario = {
            ...userData,
            propietario: marcaUsuario?.propietario,
            rancho_nombre: "Rancho Principal",
          };
          storage.set("user", userWithPropietario);
          const event = new CustomEvent("userDataUpdated", {
            detail: { user: userWithPropietario },
          });
          window.dispatchEvent(event);
        } else {
          storage.set("user", userData);
        }
      } catch (error) {
        storage.set("user", userData);
      }
    }
    return response;
  },

  logout() {
    conn.clearToken();
    storage.remove("auth_token");
    storage.remove("user");
  },

  getCurrentUser() {
    return storage.get("user");
  },

  isAuthenticated(): boolean {
    const token = storage.get("auth_token");
    const user = storage.get("user");
    return !!(token && user);
  },
};
