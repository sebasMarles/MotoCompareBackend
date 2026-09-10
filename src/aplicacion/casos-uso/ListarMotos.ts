import type { Moto } from '../../dominio/modelo/Moto'
import type { FiltrosMoto, MotoDAO } from '../../dominio/puertos'

export class ListarMotos {
  constructor(private readonly motos: MotoDAO) {}

  ejecutar(filtros?: FiltrosMoto): Promise<Moto[]> {
    return this.motos.listar(filtros)
  }
}
