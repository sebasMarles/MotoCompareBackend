// Validaciones de la frontera HTTP — lo que entra es `unknown` hasta que se prueba lo
// contrario; el dominio nunca ve datos sin validar.

const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function correoValido(correo: string): boolean {
  return PATRON_CORREO.test(correo)
}

export function claveValida(clave: string): boolean {
  return clave.length >= 8
}

export function nombreValido(nombre: string): boolean {
  return nombre.trim().length >= 2
}
