import { API_BASE_URL } from "../../shared/config/api";
import type {
  Anticipo,
  Asistencia,
  AsistenciaEstado,
  LiquidacionItem,
  Obra,
  Personal,
  Seguridad,
  SeguridadItem
} from "./construccion.types";

function buildUrl(path: string) {
  return `${API_BASE_URL}/api/v1${path}`;
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error("No se pudo guardar.");
  return readJson<T>(response);
}

async function patchJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error("No se pudo guardar.");
  return readJson<T>(response);
}

export async function fetchCargos(): Promise<string[]> {
  const response = await fetch(buildUrl("/construccion/cargos"));
  if (!response.ok) throw new Error("No se pudieron cargar los cargos.");
  return readJson<string[]>(response);
}

export async function fetchObras(): Promise<Obra[]> {
  const response = await fetch(buildUrl("/construccion/obras"));
  if (!response.ok) throw new Error("No se pudieron cargar las obras.");
  return readJson<Obra[]>(response);
}

export function createObra(input: { nombre: string; direccion?: string }): Promise<Obra> {
  return postJson<Obra>("/construccion/obras", input);
}

export function updateObra(id: number, input: Partial<{ nombre: string; direccion: string; activa: boolean }>): Promise<Obra> {
  return patchJson<Obra>(`/construccion/obras/${id}`, input);
}

export async function fetchPersonal(obraId?: number): Promise<Personal[]> {
  const query = obraId ? `?obraId=${obraId}` : "";
  const response = await fetch(buildUrl(`/construccion/personal${query}`));
  if (!response.ok) throw new Error("No se pudo cargar el personal.");
  return readJson<Personal[]>(response);
}

export function createPersonal(input: {
  nombre: string;
  cargo: string;
  telefono?: string;
  obraId?: number;
  jornal: number;
  fechaIngreso: string;
}): Promise<Personal> {
  return postJson<Personal>("/construccion/personal", input);
}

export function updatePersonal(
  id: number,
  input: Partial<{
    nombre: string;
    cargo: string;
    telefono: string;
    obraId: number | null;
    jornal: number;
    fechaIngreso: string;
    activo: boolean;
  }>
): Promise<Personal> {
  return patchJson<Personal>(`/construccion/personal/${id}`, input);
}

export async function fetchAsistencias(fecha: string): Promise<Asistencia[]> {
  const response = await fetch(buildUrl(`/construccion/asistencias?fecha=${fecha}`));
  if (!response.ok) throw new Error("No se pudo cargar la asistencia.");
  return readJson<Asistencia[]>(response);
}

export function saveAsistencias(fecha: string, items: { personalId: number; estado: AsistenciaEstado }[]): Promise<Asistencia[]> {
  return postJson<Asistencia[]>("/construccion/asistencias", { fecha, items });
}

export async function fetchSeguridadItems(): Promise<SeguridadItem[]> {
  const response = await fetch(buildUrl("/construccion/seguridad-items"));
  if (!response.ok) throw new Error("No se pudieron cargar los items de seguridad.");
  return readJson<SeguridadItem[]>(response);
}

export async function fetchSeguridad(fecha: string): Promise<Seguridad[]> {
  const response = await fetch(buildUrl(`/construccion/seguridad?fecha=${fecha}`));
  if (!response.ok) throw new Error("No se pudo cargar el control de seguridad.");
  return readJson<Seguridad[]>(response);
}

export function saveSeguridad(
  fecha: string,
  items: { personalId: number; cumple: boolean; itemsFaltantes: SeguridadItem[] }[]
): Promise<Seguridad[]> {
  return postJson<Seguridad[]>("/construccion/seguridad", { fecha, items });
}

export async function fetchAnticipos(personalId?: number): Promise<Anticipo[]> {
  const query = personalId ? `?personalId=${personalId}` : "";
  const response = await fetch(buildUrl(`/construccion/anticipos${query}`));
  if (!response.ok) throw new Error("No se pudieron cargar los anticipos.");
  return readJson<Anticipo[]>(response);
}

export function createAnticipo(input: { personalId: number; fecha: string; monto: number; nota?: string }): Promise<Anticipo> {
  return postJson<Anticipo>("/construccion/anticipos", input);
}

export async function fetchLiquidacion(mes: string): Promise<LiquidacionItem[]> {
  const response = await fetch(buildUrl(`/construccion/liquidacion?mes=${mes}`));
  if (!response.ok) throw new Error("No se pudo calcular la liquidacion.");
  return readJson<LiquidacionItem[]>(response);
}
