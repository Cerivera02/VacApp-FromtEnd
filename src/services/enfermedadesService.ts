import { conn } from "./connection";
import type { Enfermedad, EnfermedadMaestra } from "../types/interfaces";

export const EnfermedadesService = {
  async getEnfermedades(vacaId: number): Promise<Enfermedad[]> {
    try {
      const response = await conn.get<Enfermedad[]>(
        `/vacasEnfermedades/${vacaId}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getAllEnfermedades(): Promise<EnfermedadMaestra[]> {
    try {
      const response = await conn.get<EnfermedadMaestra[]>("/enfermedades");
      return response;
    } catch (error) {
      throw error;
    }
  },

  async createEnfermedad(data: { nombre: string }): Promise<EnfermedadMaestra> {
    try {
      const response = await conn.post<EnfermedadMaestra>(
        "/enfermedades",
        data
      );
      return response;
    } catch (error) {
      throw error;
    }
  },

  async addEnfermedadToVaca(
    vacaId: number,
    data: { enfermedad_id: number }
  ): Promise<void> {
    try {
      await conn.post(`/vacasEnfermedades/${vacaId}`, data);
    } catch (error) {
      throw error;
    }
  },

  async deleteEnfermedades(enfermedadIds: number[]): Promise<void> {
    try {
      if (enfermedadIds.length === 0) return;

      // ✅ Hacer todas las llamadas en PARALELO (no secuencial)
      const deletePromises = enfermedadIds.map((id) =>
        conn.delete(`/vacasEnfermedades/${id}`)
      );

      await Promise.all(deletePromises);
    } catch (error) {
      throw error;
    }
  },

  async updateEnfermedad(
    enfermedadId: number,
    data: Enfermedad
  ): Promise<void> {
    try {
      await conn.put(`/vacasEnfermedades/${enfermedadId}`, data);
    } catch (error) {
      throw error;
    }
  },
};
