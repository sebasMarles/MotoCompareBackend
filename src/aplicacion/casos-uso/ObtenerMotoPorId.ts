import type { Moto } from '../../dominio/modelo/Moto'
import type { MotoDAO } from '../../dominio/puertos'

export class MotoNoEncontrada extends Error {
  constructor(id: string) {
    super(`No existe una moto con id ${id}`)
  }
}

export class ObtenerMotoPorId {
  constructor(private readonly motos: MotoDAO) {}

  async ejecutar(id: string): Promise<Moto> {
    const moto = await this.motos.porId(id)
    if (!moto) throw new MotoNoEncontrada(id)
    return moto
  }
}
