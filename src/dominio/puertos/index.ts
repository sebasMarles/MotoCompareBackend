// Puertos: lo que el dominio necesita del exterior, en su propio vocabulario.
//
// - `...DAO`  → acceso a datos: quien sepa guardar y recuperar entidades.
// - `...DTO`  → estructura de datos que cruza una frontera.
// - Sin sufijo → contratos de comportamiento, que no son ni datos ni persistencia.

import type { Usuario, UsuarioNuevo } from '../modelo/Usuario'
import type { Moto } from '../modelo/Moto'
import type { MotoGuardada, MotoGuardadaNueva } from '../modelo/MotoGuardada'
import type { RegistroMantenimiento, RegistroMantenimientoNuevo } from '../modelo/RegistroMantenimiento'
import type { CostoMensual, CostoMensualNuevo } from '../modelo/CostoMensual'
import type { ComparacionRecomendada } from '../modelo/ComparacionRecomendada'

export interface UsuarioDAO {
  guardar(usuario: UsuarioNuevo): Promise<Usuario>
  porCorreo(correo: string): Promise<Usuario | null>
  porId(id: string): Promise<Usuario | null>
}

export interface FiltrosMoto {
  marca?: string
  categoria?: string
}

export interface MotoDAO {
  listar(filtros?: FiltrosMoto): Promise<Moto[]>
  porId(id: string): Promise<Moto | null>
}

export interface MotoGuardadaDAO {
  agregar(garage: MotoGuardadaNueva): Promise<MotoGuardada>
  listarPorUsuario(usuarioId: string): Promise<MotoGuardada[]>
  porId(id: string): Promise<MotoGuardada | null>
  actualizarKilometraje(id: string, kilometrajeActual: number): Promise<MotoGuardada>
  eliminar(id: string): Promise<void>
}

export interface RegistroMantenimientoDAO {
  registrar(registro: RegistroMantenimientoNuevo): Promise<RegistroMantenimiento>
  listarPorMotoGuardada(motoGuardadaId: string): Promise<RegistroMantenimiento[]>
}

export interface CostoMensualDAO {
  configurar(costo: CostoMensualNuevo): Promise<CostoMensual>
  listarPorMotoGuardada(motoGuardadaId: string): Promise<CostoMensual[]>
  eliminar(id: string): Promise<void>
}

export interface ComparacionRecomendadaDAO {
  listar(): Promise<ComparacionRecomendada[]>
}

export interface ServicioClaves {
  cifrar(clave: string): Promise<string>
  coincide(clave: string, hash: string): Promise<boolean>
}

/** Contenido útil del token: viaja entre el cliente y el servidor en cada petición. */
export interface CredencialDTO {
  id: string
}

export interface ServicioTokens {
  emitir(credencial: CredencialDTO): string
  verificar(token: string): CredencialDTO | null
}
