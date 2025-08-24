import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

// Tipos para los modales
export interface ModalConfig {
  id: string;
  isOpen: boolean;
  component: ReactNode;
  title?: string;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  onClose?: () => void;
}

interface ModalContextType {
  // Estado de modales
  modals: ModalConfig[];

  // Funciones para manejar modales
  openModal: (config: Omit<ModalConfig, "isOpen">) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;

  // Verificar si un modal está abierto
  isModalOpen: (id: string) => boolean;

  // Obtener un modal específico
  getModal: (id: string) => ModalConfig | undefined;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal debe usarse dentro de ModalProvider");
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modals, setModals] = useState<ModalConfig[]>([]);

  const openModal = (config: Omit<ModalConfig, "isOpen">) => {
    setModals((prev) => {
      // Si el modal ya existe, actualizarlo
      const existingIndex = prev.findIndex((modal) => modal.id === config.id);

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...config, isOpen: true };
        return updated;
      }

      // Si no existe, agregarlo
      return [...prev, { ...config, isOpen: true }];
    });
  };

  const closeModal = (id: string) => {
    setModals((prev) => {
      const updated = prev.map((modal) =>
        modal.id === id ? { ...modal, isOpen: false } : modal
      );

      // Ejecutar onClose si existe
      const modalToClose = prev.find((modal) => modal.id === id);
      if (modalToClose?.onClose) {
        modalToClose.onClose();
      }

      return updated;
    });
  };

  const closeAllModals = () => {
    setModals((prev) => {
      // Ejecutar onClose para todos los modales abiertos
      prev.forEach((modal) => {
        if (modal.isOpen && modal.onClose) {
          modal.onClose();
        }
      });

      return prev.map((modal) => ({ ...modal, isOpen: false }));
    });
  };

  const isModalOpen = (id: string) => {
    return modals.some((modal) => modal.id === id && modal.isOpen);
  };

  const getModal = (id: string) => {
    return modals.find((modal) => modal.id === id);
  };

  const value: ModalContextType = {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    isModalOpen,
    getModal,
  };

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};
