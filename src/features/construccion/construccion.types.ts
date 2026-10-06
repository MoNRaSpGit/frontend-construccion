export const CARGOS = ["Capataz", "Oficial", "Medio oficial", "Peon", "Ayudante"] as const;
export type Cargo = (typeof CARGOS)[number];

export const ASISTENCIA_ESTADOS = ["presente", "media", "ausente"] as const;
export type AsistenciaEstado = (typeof ASISTENCIA_ESTADOS)[number];

export const SEGURIDAD_ITEMS = ["casco", "chaleco", "botines", "guantes", "lentes", "arnes"] as const;
export type SeguridadItem = (typeof SEGURIDAD_ITEMS)[number];

export const SEGURIDAD_ITEM_LABELS: Record<SeguridadItem, string> = {
  casco: "Casco",
  chaleco: "Chaleco reflectante",
  botines: "Botines de seguridad",
  guantes: "Guantes",
  lentes: "Lentes de proteccion",
  arnes: "Arnes"
};

export type Obra = {
  id: number;
  nombre: string;
  direccion: string;
  activa: boolean;
  createdAt: string;
};

export type Personal = {
  id: number;
  nombre: string;
  cargo: string;
  telefono: string;
  obraId: number | null;
  jornal: number;
  fechaIngreso: string;
  activo: boolean;
  createdAt: string;
};

export type Asistencia = {
  id: number;
  personalId: number;
  fecha: string;
  estado: AsistenciaEstado;
};

export type Seguridad = {
  id: number;
  personalId: number;
  fecha: string;
  cumple: boolean;
  itemsFaltantes: SeguridadItem[];
};

export type Anticipo = {
  id: number;
  personalId: number;
  fecha: string;
  monto: number;
  nota: string;
  createdAt: string;
};

export type LiquidacionItem = {
  personalId: number;
  nombre: string;
  cargo: string;
  obraId: number | null;
  jornal: number;
  diasPresentes: number;
  diasMedios: number;
  diasAusentes: number;
  totalJornales: number;
  totalAnticipos: number;
  totalAPagar: number;
};
