import { randomUUID } from 'node:crypto'
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

// En producción nunca se devuelve el mensaje interno de un error inesperado
// (puede revelar consultas, rutas de archivos o detalles de la base de datos).
function enProduccion(): boolean {
  return process.env['NODE_ENV'] === 'production'
}

// Errores que lanza express.json() (cuerpo mal formado, demasiado grande, etc.).
// Traen un `status` 4xx y un `type`; su mensaje original se descarta porque puede
// incluir fragmentos del cuerpo recibido o detalles del parser.
interface ErrorDeCuerpo {
  status: number
  type: string
}

function esErrorDeCuerpo(error: unknown): error is ErrorDeCuerpo {
  if (typeof error !== 'object' || error === null) return false
  const { status, type } = error as { status?: unknown; type?: unknown }
  return typeof status === 'number' && status >= 400 && status < 500 && typeof type === 'string'
}

const MENSAJE_POR_TIPO_DE_CUERPO: Readonly<Record<string, string>> = {
  'entity.parse.failed': 'El cuerpo de la petición no es un JSON válido',
  'entity.too.large': 'El cuerpo de la petición es demasiado grande',
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

  if (esErrorDeCuerpo(error)) {
    res.status(error.status).json({ error: MENSAJE_POR_TIPO_DE_CUERPO[error.type] ?? 'La petición no es válida' })
    return
  }

  // Error inesperado: el detalle completo queda solo en el log del servidor, junto
  // con una referencia que el cliente sí recibe para poder reportar el problema.
  const referencia = randomUUID()
  console.error(`[error ${referencia}]`, error)
  res.status(500).json({
    error: 'Error interno',
    referencia,
    ...(enProduccion() ? {} : { detalle: error instanceof Error ? error.message : String(error) }),
  })
}
