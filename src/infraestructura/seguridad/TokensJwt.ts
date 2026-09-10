import jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'
import type { CredencialDTO, ServicioTokens } from '../../dominio/puertos'

export class TokensJwt implements ServicioTokens {
  constructor(
    private readonly secreto: string,
    private readonly duracion: NonNullable<SignOptions['expiresIn']> = '8h',
  ) {}

  emitir({ id }: CredencialDTO): string {
    return jwt.sign({}, this.secreto, { subject: id, expiresIn: this.duracion })
  }

  verificar(token: string): CredencialDTO | null {
    try {
      const carga = jwt.verify(token, this.secreto)
      if (typeof carga === 'string' || !carga.sub) return null
      return { id: carga.sub }
    } catch {
      return null
    }
  }
}
