import { useCallback } from "react";
import { useVacaData } from "../contexts/VacaDataContext";
import { MarcaService } from "../services/marcaService";
import type { Marca } from "../types/interfaces";

export const useMarcas = () => {
  const { getMarcaData, hasMarcaData, setMarcaData } = useVacaData();

  const getMarca = useCallback(
    async (id: number): Promise<Marca | null> => {
      // Primero verificar si está en cache
      if (hasMarcaData(id)) {
        return getMarcaData(id);
      }

      // Si no está en cache, cargar desde API
      try {
        const marca = await MarcaService.getMarcaPorId(id);
        // Guardar en cache para futuras consultas
        setMarcaData(marca);
        return marca;
      } catch (error) {
        console.error(`Error obteniendo marca ${id}:`, error);
        return null;
      }
    },
    [getMarcaData, hasMarcaData, setMarcaData]
  );

  const getMarcaPropietario = useCallback(
    async (id: number): Promise<string> => {
      const marca = await getMarca(id);
      return marca?.propietario || "Propietario no disponible";
    },
    [getMarca]
  );

  return {
    getMarca,
    getMarcaPropietario,
    hasMarcaData,
    getMarcaData,
  };
};
