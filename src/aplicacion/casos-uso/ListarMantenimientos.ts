import type { RegistroMantenimiento } from '../../dominio/modelo/RegistroMantenimiento'
import type { MotoGuardadaDAO, RegistroMantenimientoDAO } from '../../dominio/puertos'
import { garageDelUsuario } from './soporte-garage'

export class ListarMantenimientos {
  constructor(
    private readonly garage: MotoGuardadaDAO,
    private readonly mantenimientos: RegistroMantenimientoDAO,
  ) {}

  async ejecutar(usuarioId: string, motoGuardadaId: string): Promise<RegistroMantenimiento[]> {
    await garageDelUsuario(this.garage, motoGuardadaId, usuarioId)
    return this.mantenimientos.listarPorMotoGuardada(motoGuardadaId)
  }
}
