export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface User {
  id: number;
  nombre_usuario: string;
  password?: string;
  rol: string;
  rancho_id: number;
  propietario?: string;
}

export interface Vaca {
  id: number;
  marca_herrar_id: number;
  rancho_id: number;
  no_arete: number;
  nombre?: string;
  fecha_nacimiento?: Date;
  color?: string;
  pariciones?: number;
  ultima_paricion?: Date;
  descripcion?: string;
}

export interface Enfermedad {
  id?: number;
  vaca_id: number;
  enfermedad_id: number | number[];
  nombre_enfermedad: string | string[];
  estado: string | string[];
  fecha_diagnostico?: Date;
  observaciones?: string;
}

export interface EnfermedadMaestra {
  id: number;
  nombre: string;
}

export interface Marca {
  id: number;
  propietario: string;
  usuario_id?: number;
  rancho_id?: number;
}

export interface Vacuna {
  id: number;
  vaca_id: number;
  vacuna_id: number;
  fecha_aplicacion: string;
  fecha_vencimiento?: Date;
  observaciones?: string;
  nombre_vacuna: string;
}

export interface VacunaMaestra {
  id: number;
  nombre: string;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
