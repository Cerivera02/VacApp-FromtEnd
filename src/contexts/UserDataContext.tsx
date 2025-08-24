import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { storage } from "../services/storage";

interface User {
  id: number;
  username: string;
  rol: string;
  rancho_nombre: string;
  propietario?: string;
}

interface UserDataContextType {
  user: User | null;
  isAdmin: boolean;
  isGanadero: boolean;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  updateUser: (userData: User) => void;
  clearUser: () => void;
  refreshUser: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined
);

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error("useUserData debe usarse dentro de UserDataProvider");
  }
  return context;
};

interface UserDataProviderProps {
  children: ReactNode;
}

export const UserDataProvider = ({ children }: UserDataProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserFromStorage = () => {
    setIsLoading(true);
    try {
      const userData = storage.get("user");
      if (userData) {
        const normalizedUser = {
          id: userData.id,
          username:
            userData.username || (userData as any).nombre_usuario || "Usuario",
          rol: userData.rol,
          rancho_nombre: userData.rancho_nombre || "Rancho",
          propietario: userData.propietario,
        };
        setUser(normalizedUser);
      }
    } catch (error) {
      console.error("Error al cargar datos del usuario:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (userData: User) => {
    const normalizedUser = {
      id: userData.id,
      username:
        userData.username || (userData as any).nombre_usuario || "Usuario",
      rol: userData.rol,
      rancho_nombre: userData.rancho_nombre || "Rancho",
      propietario: userData.propietario,
    };
    setUser(normalizedUser);
    storage.set("user", normalizedUser);
  };

  const clearUser = () => {
    setUser(null);
    storage.remove("user");
  };

  const refreshUser = () => {
    loadUserFromStorage();
  };

  useEffect(() => {
    loadUserFromStorage();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "app_data") {
        loadUserFromStorage();
      }
    };

    const handleUserDataUpdated = (e: CustomEvent) => {
      if (e.detail && e.detail.user) {
        setUser(e.detail.user);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "userDataUpdated",
      handleUserDataUpdated as EventListener
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "userDataUpdated",
        handleUserDataUpdated as EventListener
      );
    };
  }, []);

  const isAdmin = user?.rol === "administrador";
  const isGanadero = user?.rol === "ganadero";

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    switch (permission) {
      case "edit_enfermedades_status":
        return isAdmin;
      case "edit_vacunas_status":
        return isAdmin;
      case "edit_vaca":
        return isAdmin;
      case "edit_enfermedades":
        return isAdmin || isGanadero;
      case "delete_vacunas":
        return isAdmin;
      case "delete_enfermedades":
        return isAdmin;
      case "edit_vacunas":
        return isAdmin || isGanadero;
      case "view_all":
        return true;
      default:
        return false;
    }
  };

  return (
    <UserDataContext.Provider
      value={{
        user,
        isAdmin,
        isGanadero,
        isLoading,
        hasPermission,
        updateUser,
        clearUser,
        refreshUser,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};
