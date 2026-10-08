import type { MotoGuardada } from '../../dominio/modelo/MotoGuardada'
import type { MotoGuardadaDAO } from '../../dominio/puertos'
import { garageDelUsuario } from './soporte-garage'

export class KilometrajeInvalido extends Error {
  constructor() {
    super('El kilometraje no puede ser menor al que ya está registrado')
  }
}

export class ActualizarKilometraje {
  constructor(private readonly garage: MotoGuardadaDAO) {}

  async ejecutar(usuarioId: string, motoGuardadaId: string, kilometrajeActual: number): Promise<MotoGuardada> {
    const guardada = await garageDelUsuario(this.garage, motoGuardadaId, usuarioId)
    if (kilometrajeActual < guardada.kilometrajeActual) throw new KilometrajeInvalido()
    return this.garage.actualizarKilometraje(motoGuardadaId, kilometrajeActual)
  }
}
