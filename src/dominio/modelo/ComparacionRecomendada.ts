import type { Moto } from './Moto'

/** Entidad del dominio: una comparación destacada del catálogo. */
export interface ComparacionRecomendada {
  id: string
  titulo: string
  destacada: boolean
  motoAId: string
  motoBId: string
}

/** Lo que sale hacia el exterior: con las dos motos completas, no solo sus ids. */
export interface ComparacionRecomendadaDTO {
  id: string
  titulo: string
  motoA: Moto
  motoB: Moto
}
