import type { SesionesDAO } from '../../dominio/puertos'

// Revoca todas las sesiones abiertas del usuario (celular, otro computador, etc.),
// incluida la que hace la petición, sin tener que conocer el jti de cada una.
export class CerrarSesionEnTodosLosDispositivos {
  constructor(private readonly sesiones: SesionesDAO) {}

  async ejecutar(usuarioId: string): Promise<void> {
    await this.sesiones.cerrarTodasDelUsuario(usuarioId, new Date())
  }
}
