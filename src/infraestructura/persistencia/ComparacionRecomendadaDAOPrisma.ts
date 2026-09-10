import type { PrismaClient } from './generado/client'
import type { ComparacionRecomendadaModel as FilaComparacion } from './generado/models'
import type { ComparacionRecomendada } from '../../dominio/modelo/ComparacionRecomendada'
import type { ComparacionRecomendadaDAO } from '../../dominio/puertos'

const aDominio = (fila: FilaComparacion): ComparacionRecomendada => ({
  id: fila.id,
  titulo: fila.titulo,
  destacada: fila.destacada,
  motoAId: fila.motoAId,
  motoBId: fila.motoBId,
})

export class ComparacionRecomendadaDAOPrisma implements ComparacionRecomendadaDAO {
  constructor(private readonly prisma: PrismaClient) {}

  async listar(): Promise<ComparacionRecomendada[]> {
    const filas = await this.prisma.comparacionRecomendada.findMany({ where: { destacada: true } })
    return filas.map(aDominio)
  }
}
