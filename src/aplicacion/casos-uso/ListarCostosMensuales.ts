import type { CostoMensual } from '../../dominio/modelo/CostoMensual'
import type { CostoMensualDAO, MotoGuardadaDAO } from '../../dominio/puertos'
import { garageDelUsuario } from './soporte-garage'

/** Resumen de costes de una moto guardada: el detalle, el total mensual, y el salario
 * ideal según el criterio del producto (la moto no debe representar más del 30% del salario). */
export interface ResumenCostosDTO {
  costos: CostoMensual[]
  totalMensual: number
  salarioIdeal: number
}

export class ListarCostosMensuales {
  constructor(
    private readonly garage: MotoGuardadaDAO,
    private readonly costos: CostoMensualDAO,
  ) {}

  async ejecutar(usuarioId: string, motoGuardadaId: string): Promise<ResumenCostosDTO> {
    await garageDelUsuario(this.garage, motoGuardadaId, usuarioId)
    const costos = await this.costos.listarPorMotoGuardada(motoGuardadaId)
    const totalMensual = costos.reduce((suma, costo) => suma + costo.monto, 0)

    return { costos, totalMensual, salarioIdeal: Math.round(totalMensual / 0.3) }
  }
}
