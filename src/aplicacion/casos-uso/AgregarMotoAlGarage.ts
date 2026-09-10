import type { MotoGuardada } from '../../dominio/modelo/MotoGuardada'
import type { MotoDAO, MotoGuardadaDAO } from '../../dominio/puertos'
import { MotoNoEncontrada } from './ObtenerMotoPorId'

export interface AgregarAlGarageDTO {
  usuarioId: string
  motoId: string
  apodo?: string
}

export class AgregarMotoAlGarage {
  constructor(
    private readonly garage: MotoGuardadaDAO,
    private readonly motos: MotoDAO,
  ) {}

  async ejecutar(datos: AgregarAlGarageDTO): Promise<MotoGuardada> {
    const moto = await this.motos.porId(datos.motoId)
    if (!moto) throw new MotoNoEncontrada(datos.motoId)

    return this.garage.agregar({
      usuarioId: datos.usuarioId,
      motoId: datos.motoId,
      apodo: datos.apodo ?? null,
      kilometrajeActual: 0,
    })
  }
}
