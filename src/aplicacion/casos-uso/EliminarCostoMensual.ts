import type { CostoMensualDAO, MotoGuardadaDAO } from '../../dominio/puertos'
import { garageDelUsuario } from './soporte-garage'

export class CostoNoEncontrado extends Error {
  constructor(id: string) {
    super(`No existe un costo mensual con id ${id} para esta moto guardada`)
  }
}

export class EliminarCostoMensual {
  constructor(
    private readonly garage: MotoGuardadaDAO,
    private readonly costos: CostoMensualDAO,
  ) {}

  async ejecutar(usuarioId: string, motoGuardadaId: string, costoId: string): Promise<void> {
    await garageDelUsuario(this.garage, motoGuardadaId, usuarioId)
    const costos = await this.costos.listarPorMotoGuardada(motoGuardadaId)
    if (!costos.some((c) => c.id === costoId)) throw new CostoNoEncontrado(costoId)
    await this.costos.eliminar(costoId)
  }
}
