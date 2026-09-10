import type { MotoGuardadaDAO } from '../../dominio/puertos'
import { garageDelUsuario } from './soporte-garage'

export class EliminarMotoDelGarage {
  constructor(private readonly garage: MotoGuardadaDAO) {}

  async ejecutar(usuarioId: string, motoGuardadaId: string): Promise<void> {
    await garageDelUsuario(this.garage, motoGuardadaId, usuarioId)
    await this.garage.eliminar(motoGuardadaId)
  }
}
