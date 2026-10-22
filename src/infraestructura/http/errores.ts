import type { ErrorRequestHandler, RequestHandler } from 'express'
import { MotoNoEncontrada } from '../../aplicacion/casos-uso/ObtenerMotoPorId'
import { GarageNoEncontrado } from '../../aplicacion/casos-uso/soporte-garage'
import { KilometrajeInvalido } from '../../aplicacion/casos-uso/ActualizarKilometraje'
import { CostoNoEncontrado } from '../../aplicacion/casos-uso/EliminarCostoMensual'
import { CredencialesInvalidas } from '../../aplicacion/casos-uso/IniciarSesion'
import { CorreoYaRegistrado } from '../../aplicacion/casos-uso/RegistrarUsuario'

// Único lugar que traduce los errores de la aplicación a respuestas HTTP.
// Las rutas ya no atrapan errores: Express 5 reenvía aquí cualquier promesa
// rechazada dentro de un handler, así que basta con dejar que el error suba.

type ClaseDeError = new (...args: never[]) => Error

const ESTADO_POR_ERROR: ReadonlyArray<readonly [ClaseDeError, number]> = [
  [MotoNoEncontrada, 404],
  [GarageNoEncontrado, 404],
  [CostoNoEncontrado, 404],
  [KilometrajeInvalido, 400],
  [CredencialesInvalidas, 401],
  [CorreoYaRegistrado, 409],
]

function estadoDeErrorConocido(error: unknown): number | undefined {
  return ESTADO_POR_ERROR.find(([clase]) => error instanceof clase)?.[1]
}

// express.json() lanza un error con `type: 'entity.parse.failed'` cuando el cuerpo
// no es un JSON válido; sin esto, un JSON mal formado terminaba en un 500.
function esCuerpoInvalido(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { type?: unknown }).type === 'entity.parse.failed'
}

export const rutaNoEncontrada: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
}

export const manejarErrores: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error)
    return
  }

  const estado = estadoDeErrorConocido(error)
  if (estado !== undefined) {
    res.status(estado).json({ error: (error as Error).message })
    return
  }

  if (esCuerpoInvalido(error)) {
    res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' })
    return
  }

  console.error(error)
  res.status(500).json({ error: 'Error interno' })
}
