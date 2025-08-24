import { conn } from "./connection";
import type { Vacuna, VacunaMaestra } from "../types/interfaces";

export const VacunasService = {
  async getVacunas(id: number): Promise<Vacuna[]> {
    try {
      const response = await conn.get<Vacuna[]>(`/vacasVacunas/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getAllVacunas(): Promise<VacunaMaestra[]> {
    try {
      const response = await conn.get<VacunaMaestra[]>("/vacunas");
      return response;
    } catch (error) {
      throw error;
    }
  },

  async createVacuna(data: { nombre: string }): Promise<VacunaMaestra> {
    try {
      const response = await conn.post<VacunaMaestra>("/vacunas", data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async addVacunaToVaca(
    vacaId: number,
    data: {
      vacuna_id: number;
      fecha_aplicacion: string;
      fecha_vencimiento: string;
    }
  ): Promise<void> {
    try {
      await conn.post(`/vacasVacunas/${vacaId}`, data);
    } catch (error) {
      throw error;
    }
  },

  async deleteVacunas(vacunaIds: number[]): Promise<void> {
    try {
      if (vacunaIds.length === 0) return;

      // ✅ Hacer todas las llamadas en PARALELO (no secuencial)
      const deletePromises = vacunaIds.map((id) =>
        conn.delete(`/vacasVacunas/${id}`)
      );

      await Promise.all(deletePromises);
    } catch (error) {
      throw error;
    }
  },

  async updateVacuna(vacunaId: number, data: Vacuna): Promise<void> {
    try {
      console.log("data", data);
      await conn.put(`/vacasVacunas/${vacunaId}`, data);
    } catch (error) {
      throw error;
    }
  },
};
