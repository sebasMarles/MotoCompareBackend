import jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'
import { randomUUID } from 'node:crypto'
import type { CredencialDTO, ServicioTokens } from '../../dominio/puertos'

export class TokensJwt implements ServicioTokens {
  constructor(
    private readonly secreto: string,
    private readonly duracion: NonNullable<SignOptions['expiresIn']> = '8h',
  ) {}

  emitir(id: string): string {
    return jwt.sign({ jti: randomUUID() }, this.secreto, { subject: id, expiresIn: this.duracion })
  }

  verificar(token: string): CredencialDTO | null {
    try {
      const carga = jwt.verify(token, this.secreto)
      if (typeof carga === 'string' || !carga.sub || typeof carga['jti'] !== 'string' || !carga.exp) return null
      return { id: carga.sub, jti: carga['jti'], exp: new Date(carga.exp * 1000) }
    } catch {
      return null
    }
  }
}
