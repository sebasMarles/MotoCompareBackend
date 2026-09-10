export const TIPOS_MANTENIMIENTO = [
  'CAMBIO_ACEITE',
  'PASTILLAS_FRENO',
  'LLANTAS',
  'REVISION_GENERAL',
  'OTRO',
] as const

export type TipoMantenimiento = (typeof TIPOS_MANTENIMIENTO)[number]

/** Entidad del dominio: un mantenimiento hecho sobre una moto guardada. */
export interface RegistroMantenimiento {
  id: string
  tipo: TipoMantenimiento
  fecha: Date
  kilometraje: number
  costo: number
  notas: string | null
  motoGuardadaId: string
}

export type RegistroMantenimientoNuevo = Omit<RegistroMantenimiento, 'id'>

export function esTipoMantenimiento(valor: unknown): valor is TipoMantenimiento {
  return TIPOS_MANTENIMIENTO.includes(valor as TipoMantenimiento)
}
