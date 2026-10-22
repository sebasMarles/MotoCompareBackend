import type { PrismaClient } from './generado/client'
import type { SesionesDAO } from '../../dominio/puertos'

export class SesionesDAOPrisma implements SesionesDAO {
  constructor(private readonly prisma: PrismaClient) {}

  async revocar(jti: string, expiraEn: Date): Promise<void> {
    await this.prisma.sesionRevocada.upsert({
      where: { jti },
      create: { jti, expiraEn },
      update: {},
    })
  }

  async estaRevocada(jti: string): Promise<boolean> {
    return (await this.prisma.sesionRevocada.findUnique({ where: { jti } })) !== null
  }

  async cerrarTodasDelUsuario(usuarioId: string, desde: Date): Promise<void> {
    await this.prisma.cierreGlobalSesion.upsert({
      where: { usuarioId },
      create: { usuarioId, desde },
      update: { desde },
    })
  }

  async cierreGlobalDe(usuarioId: string): Promise<Date | null> {
    const cierre = await this.prisma.cierreGlobalSesion.findUnique({ where: { usuarioId } })
    return cierre?.desde ?? null
  }
}
