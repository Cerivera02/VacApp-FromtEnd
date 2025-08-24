import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { Vaca, Enfermedad, Vacuna, Marca } from "../types/interfaces";
import { storage } from "../services/storage";

interface VacaData {
  vaca: Vaca;
  enfermedades: Enfermedad[];
  propietario: string;
  vacunas: Vacuna[];
  apiTimestamp?: number;
}

interface VacaDataContextType {
  vacaDataMap: Map<number, VacaData>;
  setVacaData: (
    vaca: Vaca,
    enfermedades: Enfermedad[],
    propietario: string,
    vacunas: Vacuna[],
    apiTimestamp?: number
  ) => void;
  getVacaData: (id: number) => VacaData | null;
  clearVacaData: (id: number) => void;
  hasData: (id: number) => boolean;
  removeEnfermedades: (vacaId: number, enfermedadIds: number[]) => void;
  removeVacunas: (vacaId: number, vacunaIds: number[]) => void;
  // Nuevas funciones para el cache de marcas
  setMarcaData: (marca: Marca) => void;
  getMarcaData: (id: number) => Marca | null;
  hasMarcaData: (id: number) => boolean;
  clearMarcaData: (id: number) => void;
  clearAllMarcaData: () => void;
  getAllMarcaData: () => Marca[];
}

const VacaDataContext = createContext<VacaDataContextType | undefined>(
  undefined
);

export const useVacaData = () => {
  const context = useContext(VacaDataContext);
  if (!context) {
    throw new Error("useVacaData debe ser usado dentro de VacaDataProvider");
  }
  return context;
};

interface VacaDataProviderProps {
  children: ReactNode;
}

export const VacaDataProvider = ({ children }: VacaDataProviderProps) => {
  const [vacaDataMap] = useState<Map<number, VacaData>>(new Map());
  const [marcaDataMap] = useState<Map<number, Marca>>(new Map());

  // Cargar datos del storage al inicializar
  React.useEffect(() => {
    const storedVacas = storage.getAllVacasData();
    Object.entries(storedVacas).forEach(([vacaId, data]) => {
      vacaDataMap.set(parseInt(vacaId), data);
    });

    // También cargar las marcas del storage
    const storedMarcas = storage.getAllMarcasData();
    Object.entries(storedMarcas).forEach(([marcaId, marca]) => {
      marcaDataMap.set(parseInt(marcaId), marca as Marca);
    });
  }, []);

  const setVacaData = (
    vaca: Vaca,
    enfermedades: Enfermedad[],
    propietario: string,
    vacunas: Vacuna[],
    apiTimestamp?: number
  ) => {
    const data = { vaca, enfermedades, propietario, vacunas, apiTimestamp };
    vacaDataMap.set(vaca.id, data);
    storage.saveVacaData(vaca.id, data);
  };

  const getVacaData = (id: number) => {
    // Primero buscar en el mapa en memoria
    let data = vacaDataMap.get(id);

    // Si no está en memoria, buscar en storage
    if (!data) {
      data = storage.getVacaData(id);
      // Si se encuentra en storage, cargarlo también en memoria
      if (data) {
        vacaDataMap.set(id, data);
      }
    }

    return data || null;
  };

  const clearVacaData = (id: number) => {
    vacaDataMap.delete(id);
    storage.clearVacaData(id);
  };

  const hasData = (id: number): boolean => {
    return vacaDataMap.has(id);
  };

  const removeEnfermedades = (vacaId: number, enfermedadIds: number[]) => {
    const data = vacaDataMap.get(vacaId);
    if (data) {
      const enfermedadesFiltradas = data.enfermedades.filter(
        (enfermedad) => !enfermedadIds.includes(enfermedad.id || 0)
      );
      const newData = { ...data, enfermedades: enfermedadesFiltradas };
      vacaDataMap.set(vacaId, newData);
      storage.saveVacaData(vacaId, newData);
    }
  };

  const removeVacunas = (vacaId: number, vacunaIds: number[]) => {
    const data = vacaDataMap.get(vacaId);
    if (data) {
      const vacunasFiltradas = data.vacunas.filter(
        (vacuna) => !vacunaIds.includes(vacuna.id)
      );
      const newData = { ...data, vacunas: vacunasFiltradas };
      vacaDataMap.set(vacaId, newData);
      storage.saveVacaData(vacaId, newData);
    }
  };

  // Nuevas funciones para el cache de marcas
  const setMarcaData = (marca: Marca) => {
    marcaDataMap.set(marca.id, marca);
    storage.saveMarcaData(marca.id, marca);
  };

  const getMarcaData = (id: number): Marca | null => {
    return marcaDataMap.get(id) || null;
  };

  const hasMarcaData = (id: number): boolean => {
    return marcaDataMap.has(id);
  };

  const clearMarcaData = (id: number) => {
    marcaDataMap.delete(id);
    storage.clearMarcaData(id);
  };

  const clearAllMarcaData = () => {
    marcaDataMap.clear();
    storage.clearAllMarcasData();
  };

  const getAllMarcaData = () => {
    return Array.from(marcaDataMap.values());
  };

  const value: VacaDataContextType = {
    vacaDataMap,
    setVacaData,
    getVacaData,
    clearVacaData,
    hasData,
    removeEnfermedades,
    removeVacunas,
    setMarcaData,
    getMarcaData,
    hasMarcaData,
    clearMarcaData,
    clearAllMarcaData,
    getAllMarcaData,
  };

  return (
    <VacaDataContext.Provider value={value}>
      {children}
    </VacaDataContext.Provider>
  );
};
