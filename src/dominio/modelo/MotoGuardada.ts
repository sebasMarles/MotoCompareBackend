import type { Moto } from './Moto'

/** Entidad del dominio: una moto que un usuario agregó a su garage. */
export interface MotoGuardada {
  id: string
  apodo: string | null
  kilometrajeActual: number
  agregadaEn: Date
  usuarioId: string
  motoId: string
}

/** Una moto guardada que todavía no existe: el DAO asigna el id y la fecha al guardarla. */
export type MotoGuardadaNueva = Omit<MotoGuardada, 'id' | 'agregadaEn'>

/** Lo que sale hacia el exterior: la moto guardada con los datos de la moto ya incluidos,
 * para que el frontend no tenga que pedirlos aparte. */
export interface MotoGuardadaDTO {
  id: string
  apodo: string | null
  kilometrajeActual: number
  agregadaEn: Date
  moto: Moto
}
