import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../contexts/NotificationContext";
import { useUserData } from "../contexts/UserDataContext";
import { AuthService } from "../services/authService";

export const useAuth = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotification();
  const { clearUser, refreshUser } = useUserData();

  const login = useCallback(
    async (username: string, password: string) => {
      try {
        const response = await AuthService.login({ username, password });

        if (response.token) {
          refreshUser();

          navigate("/dashboard");
          return true;
        }
        return false;
      } catch (err: any) {
        showError(err.message || "Error al iniciar sesión");
        return false;
      }
    },
    [navigate, refreshUser, showError]
  );

  const logout = useCallback(() => {
    AuthService.logout();
    clearUser();
    showSuccess("Sesión cerrada exitosamente");
    navigate("/login");
  }, [clearUser, navigate, showSuccess]);

  const isAuthenticated = useCallback(() => {
    return AuthService.isAuthenticated();
  }, []);

  return {
    login,
    logout,
    isAuthenticated,
  };
};
