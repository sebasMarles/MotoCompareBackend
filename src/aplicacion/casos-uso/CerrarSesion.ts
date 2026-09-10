import type { SesionesDAO } from '../../dominio/puertos'

// Cerrar sesión con JWT no es "olvidar el token en el cliente": el token sigue siendo
// válido hasta su expiración natural a menos que quede registrado como revocado aquí.
export class CerrarSesion {
  constructor(private readonly sesiones: SesionesDAO) {}

  async ejecutar(jti: string, expiraEn: Date): Promise<void> {
    await this.sesiones.revocar(jti, expiraEn)
  }
}
