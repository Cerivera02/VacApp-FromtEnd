import { conn } from "./connection";
import type { Vaca } from "../types/interfaces";

export const VacaService = {
  async getVaca(): Promise<Vaca[]> {
    try {
      const response = await conn.get<Vaca[]>(`/vacas/`);
      return response;
    } catch (error: any) {
      // Si el error es 404 (no se encontraron vacas), retornar array vacío
      if (
        error.message?.includes("404") ||
        error.message?.includes("No se encontraron vacas")
      ) {
        return [];
      }
      throw error;
    }
  },

  async getVacaById(id: number): Promise<Vaca> {
    const response = await conn.get<Vaca>(`/vacas/${id}`);
    return response;
  },

  async createVaca(vaca: Vaca): Promise<Vaca> {
    const response = await conn.post<Vaca>("/vacas", vaca);
    return response;
  },

  async updateVaca(id: number, vaca: Partial<Vaca>): Promise<Vaca> {
    const response = await conn.put<Vaca>(`/vacas/${id}`, vaca);
    return response;
  },
};
