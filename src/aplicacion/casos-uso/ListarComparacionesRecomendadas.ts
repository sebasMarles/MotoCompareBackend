import type { ComparacionRecomendadaDTO } from '../../dominio/modelo/ComparacionRecomendada'
import type { ComparacionRecomendadaDAO, MotoDAO } from '../../dominio/puertos'

export class ListarComparacionesRecomendadas {
  constructor(
    private readonly comparaciones: ComparacionRecomendadaDAO,
    private readonly motos: MotoDAO,
  ) {}

  async ejecutar(): Promise<ComparacionRecomendadaDTO[]> {
    const lista = await this.comparaciones.listar()

    return Promise.all(
      lista.map(async (comparacion) => {
        const [motoA, motoB] = await Promise.all([
          this.motos.porId(comparacion.motoAId),
          this.motos.porId(comparacion.motoBId),
        ])
        if (!motoA || !motoB) throw new Error(`Comparación ${comparacion.id} referencia una moto inexistente`)
        return { id: comparacion.id, titulo: comparacion.titulo, motoA, motoB }
      }),
    )
  }
}
