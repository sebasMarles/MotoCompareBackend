import type { CategoriaCosto, CostoMensual } from '../../dominio/modelo/CostoMensual'
import type { CostoMensualDAO, MotoGuardadaDAO } from '../../dominio/puertos'
import { garageDelUsuario } from './soporte-garage'

export interface ConfigurarCostoDTO {
  motoGuardadaId: string
  categoria: CategoriaCosto
  monto: number
  descripcion?: string
}

export class ConfigurarCostoMensual {
  constructor(
    private readonly garage: MotoGuardadaDAO,
    private readonly costos: CostoMensualDAO,
  ) {}

  async ejecutar(usuarioId: string, datos: ConfigurarCostoDTO): Promise<CostoMensual> {
    await garageDelUsuario(this.garage, datos.motoGuardadaId, usuarioId)
    return this.costos.configurar({
      motoGuardadaId: datos.motoGuardadaId,
      categoria: datos.categoria,
      monto: datos.monto,
      descripcion: datos.descripcion ?? null,
    })
  }
}
