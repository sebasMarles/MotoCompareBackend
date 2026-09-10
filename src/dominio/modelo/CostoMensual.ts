export const CATEGORIAS_COSTO = ['COMBUSTIBLE', 'SEGURO', 'REPUESTOS', 'OTRO'] as const

export type CategoriaCosto = (typeof CATEGORIAS_COSTO)[number]

/** Entidad del dominio: un gasto configurable de una moto guardada. */
export interface CostoMensual {
  id: string
  categoria: CategoriaCosto
  descripcion: string | null
  monto: number
  motoGuardadaId: string
}

export type CostoMensualNuevo = Omit<CostoMensual, 'id'>

export function esCategoriaCosto(valor: unknown): valor is CategoriaCosto {
  return CATEGORIAS_COSTO.includes(valor as CategoriaCosto)
}
