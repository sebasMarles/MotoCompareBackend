import type { PrismaClient } from './generado/client'
import type { MotoGuardadaModel as FilaMotoGuardada } from './generado/models'
import type { MotoGuardada, MotoGuardadaNueva } from '../../dominio/modelo/MotoGuardada'
import type { MotoGuardadaDAO } from '../../dominio/puertos'

const aDominio = (fila: FilaMotoGuardada): MotoGuardada => ({
  id: fila.id,
  apodo: fila.apodo,
  kilometrajeActual: fila.kilometrajeActual,
  agregadaEn: fila.agregadaEn,
  usuarioId: fila.usuarioId,
  motoId: fila.motoId,
})

export class MotoGuardadaDAOPrisma implements MotoGuardadaDAO {
  constructor(private readonly prisma: PrismaClient) {}

  async agregar(garage: MotoGuardadaNueva): Promise<MotoGuardada> {
    return aDominio(await this.prisma.motoGuardada.create({ data: garage }))
  }

  async listarPorUsuario(usuarioId: string): Promise<MotoGuardada[]> {
    const filas = await this.prisma.motoGuardada.findMany({ where: { usuarioId } })
    return filas.map(aDominio)
  }

  async porId(id: string): Promise<MotoGuardada | null> {
    const fila = await this.prisma.motoGuardada.findUnique({ where: { id } })
    return fila && aDominio(fila)
  }

  async actualizarKilometraje(id: string, kilometrajeActual: number): Promise<MotoGuardada> {
    return aDominio(
      await this.prisma.motoGuardada.update({ where: { id }, data: { kilometrajeActual } }),
    )
  }

  async eliminar(id: string): Promise<void> {
    await this.prisma.motoGuardada.delete({ where: { id } })
  }
}
