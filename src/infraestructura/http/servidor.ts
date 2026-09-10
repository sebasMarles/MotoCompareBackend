import cors from 'cors'
import express, { Router } from 'express'
import type { ErrorRequestHandler, Express } from 'express'
import { rutasAutenticacion } from './rutas/autenticacion'
import type { DependenciasAutenticacion } from './rutas/autenticacion'
import { rutasMotos } from './rutas/motos'
import type { DependenciasMotos } from './rutas/motos'
import { rutasGarage } from './rutas/garage'
import type { DependenciasGarage } from './rutas/garage'
import { rutasMantenimiento } from './rutas/mantenimiento'
import type { DependenciasMantenimiento } from './rutas/mantenimiento'
import { rutasCostos } from './rutas/costos'
import type { DependenciasCostos } from './rutas/costos'

export type DependenciasServidor = DependenciasAutenticacion &
  DependenciasMotos &
  DependenciasGarage &
  DependenciasMantenimiento &
  DependenciasCostos

// Origen permitido para llamadas cross-origin (el frontend Angular corre en un
// puerto distinto al del backend). Configurable por si el frontend corre en
// otro puerto o dominio; por defecto, el puerto de `ng serve`.
const origenFrontend = process.env['FRONTEND_ORIGIN'] ?? 'http://localhost:4200'

const errores: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ error: 'Error interno' })
}

export function crearServidor(deps: DependenciasServidor): Express {
  const api = Router()
  api.get('/salud', (_req, res) => void res.json({ estado: 'ok' }))
  api.use('/auth', rutasAutenticacion(deps))
  api.use('/motos', rutasMotos(deps))
  api.use('/garage', rutasGarage(deps))
  api.use('/garage/:motoGuardadaId/mantenimientos', rutasMantenimiento(deps))
  api.use('/garage/:motoGuardadaId/costos', rutasCostos(deps))

  const app = express()
  app.use(cors({ origin: origenFrontend }))
  app.use(express.json())
  app.use('/api', api)
  app.use((_req, res) => void res.status(404).json({ error: 'Ruta no encontrada' }))
  app.use(errores)
  return app
}
