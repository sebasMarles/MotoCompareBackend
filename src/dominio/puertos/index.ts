// Puertos: lo que el dominio necesita del exterior, en su propio vocabulario.
//
// - `...DAO`  → acceso a datos: quien sepa guardar y recuperar entidades.
// - `...DTO`  → estructura de datos que cruza una frontera.
// - Sin sufijo → contratos de comportamiento, que no son ni datos ni persistencia.

import type { Usuario, UsuarioNuevo } from "../modelo/Usuario";
import type { Moto } from "../modelo/Moto";

export interface UsuarioDAO {
  guardar(usuario: UsuarioNuevo): Promise<Usuario>;
  porCorreo(correo: string): Promise<Usuario | null>;
  porId(id: string): Promise<Usuario | null>;
}

export interface FiltrosMoto {
  marca?: string;
  categoria?: string;
}

export interface MotoDAO {
  listar(filtros?: FiltrosMoto): Promise<Moto[]>;
  porId(id: string): Promise<Moto | null>;
}
