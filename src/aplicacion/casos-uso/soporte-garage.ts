import type { MotoGuardada } from '../../dominio/modelo/MotoGuardada'
import type { MotoGuardadaDAO } from '../../dominio/puertos'

/** Compartido por los casos de uso que operan sobre una MotoGuardada de un usuario específico
 * (Garage, Mantenimiento, Costes) — no es una entidad ni un puerto, por eso vive aquí y no en
 * dominio/, junto a los casos de uso que lo usan. */
export class GarageNoEncontrado extends Error {
  constructor(id: string) {
    super(`No existe una moto guardada con id ${id} para este usuario`)
  }
}

/** Trae la moto guardada solo si pertenece al usuario autenticado; si no, se trata como
 * inexistente (no como "prohibida") para no filtrarle a nadie que el registro de otro
 * usuario existe. */
export async function garageDelUsuario(
  garage: MotoGuardadaDAO,
  id: string,
  usuarioId: string,
): Promise<MotoGuardada> {
  const guardada = await garage.porId(id)
  if (!guardada || guardada.usuarioId !== usuarioId) throw new GarageNoEncontrado(id)
  return guardada
}
