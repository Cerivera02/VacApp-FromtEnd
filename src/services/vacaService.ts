import { conn } from "./connection";
import type { Vaca } from "../types/interfaces";

export const VacaService = {
  async getVaca(): Promise<Vaca[]> {
    const response = await conn.get<Vaca[]>(`/vacas/`);
    return response;
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
