import type { PrismaClient } from './generado/client'
import type { CostoMensualModel as FilaCosto } from './generado/models'
import type { CategoriaCosto, CostoMensual, CostoMensualNuevo } from '../../dominio/modelo/CostoMensual'
import type { CostoMensualDAO } from '../../dominio/puertos'

const aDominio = (fila: FilaCosto): CostoMensual => ({
  id: fila.id,
  categoria: fila.categoria as CategoriaCosto,
  descripcion: fila.descripcion,
  monto: fila.monto,
  motoGuardadaId: fila.motoGuardadaId,
})

export class CostoMensualDAOPrisma implements CostoMensualDAO {
  constructor(private readonly prisma: PrismaClient) {}

  async configurar(costo: CostoMensualNuevo): Promise<CostoMensual> {
    return aDominio(await this.prisma.costoMensual.create({ data: costo }))
  }

  async listarPorMotoGuardada(motoGuardadaId: string): Promise<CostoMensual[]> {
    const filas = await this.prisma.costoMensual.findMany({ where: { motoGuardadaId } })
    return filas.map(aDominio)
  }

  async eliminar(id: string): Promise<void> {
    await this.prisma.costoMensual.delete({ where: { id } })
  }
}
