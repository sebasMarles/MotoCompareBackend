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
}
