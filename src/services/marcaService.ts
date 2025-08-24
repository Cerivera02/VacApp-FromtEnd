import { conn } from "./connection";
import type { Marca } from "../types/interfaces";

export const MarcaService = {
  async getTodasLasMarcas(): Promise<Marca[]> {
    try {
      const response = await conn.get<Marca[]>("/marca");
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getMarcaPorId(id: number): Promise<Marca> {
    try {
      const response = await conn.get<Marca>(`/marca/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
