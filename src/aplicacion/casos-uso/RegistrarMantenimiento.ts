import type { RegistroMantenimiento, TipoMantenimiento } from '../../dominio/modelo/RegistroMantenimiento'
import type { MotoGuardadaDAO, RegistroMantenimientoDAO } from '../../dominio/puertos'
import { garageDelUsuario } from './soporte-garage'

export interface RegistrarMantenimientoDTO {
  motoGuardadaId: string
  tipo: TipoMantenimiento
  fecha: Date
  kilometraje: number
  costo: number
  notas?: string
}

export class RegistrarMantenimiento {
  constructor(
    private readonly garage: MotoGuardadaDAO,
    private readonly mantenimientos: RegistroMantenimientoDAO,
  ) {}

  async ejecutar(usuarioId: string, datos: RegistrarMantenimientoDTO): Promise<RegistroMantenimiento> {
    await garageDelUsuario(this.garage, datos.motoGuardadaId, usuarioId)
    return this.mantenimientos.registrar({
      motoGuardadaId: datos.motoGuardadaId,
      tipo: datos.tipo,
      fecha: datos.fecha,
      kilometraje: datos.kilometraje,
      costo: datos.costo,
      notas: datos.notas ?? null,
    })
  }
}
