/** Entidad del dominio. Sin sufijo: no es un dato en tránsito ni un acceso a datos. */
export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  claveHash: string;
  activo: boolean;
  creadoEn: Date;
}

/** Un usuario que todavía no existe: el DAO asigna el id y la fecha al guardarlo. */
export type UsuarioNuevo = Omit<Usuario, "id" | "creadoEn">;

/** Lo que sale hacia el exterior: el mismo usuario, nunca el hash de la clave. */
export interface UsuarioDTO {
  id: string;
  nombre: string;
  correo: string;
  creadoEn: Date;
}

export function aUsuarioDTO({
  id,
  nombre,
  correo,
  creadoEn,
}: Usuario): UsuarioDTO {
  return { id, nombre, correo, creadoEn };
}
