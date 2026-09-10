import type { MotoGuardada } from '../../dominio/modelo/MotoGuardada'
import type { MotoGuardadaDAO } from '../../dominio/puertos'
import { garageDelUsuario } from './soporte-garage'

export class ActualizarKilometraje {
  constructor(private readonly garage: MotoGuardadaDAO) {}

  async ejecutar(usuarioId: string, motoGuardadaId: string, kilometrajeActual: number): Promise<MotoGuardada> {
    await garageDelUsuario(this.garage, motoGuardadaId, usuarioId)
    return this.garage.actualizarKilometraje(motoGuardadaId, kilometrajeActual)
  }
}
