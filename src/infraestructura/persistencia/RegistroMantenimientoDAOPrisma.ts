import type { PrismaClient } from './generado/client'
import type { RegistroMantenimientoModel as FilaMantenimiento } from './generado/models'
import type {
  RegistroMantenimiento,
  RegistroMantenimientoNuevo,
  TipoMantenimiento,
} from '../../dominio/modelo/RegistroMantenimiento'
import type { RegistroMantenimientoDAO } from '../../dominio/puertos'

const aDominio = (fila: FilaMantenimiento): RegistroMantenimiento => ({
  id: fila.id,
  tipo: fila.tipo as TipoMantenimiento,
  fecha: fila.fecha,
  kilometraje: fila.kilometraje,
  costo: fila.costo,
  notas: fila.notas,
  motoGuardadaId: fila.motoGuardadaId,
})

export class RegistroMantenimientoDAOPrisma implements RegistroMantenimientoDAO {
  constructor(private readonly prisma: PrismaClient) {}

  async registrar(registro: RegistroMantenimientoNuevo): Promise<RegistroMantenimiento> {
    return aDominio(await this.prisma.registroMantenimiento.create({ data: registro }))
  }

  async listarPorMotoGuardada(motoGuardadaId: string): Promise<RegistroMantenimiento[]> {
    const filas = await this.prisma.registroMantenimiento.findMany({
      where: { motoGuardadaId },
      orderBy: { fecha: 'desc' },
    })
    return filas.map(aDominio)
  }
}
