import cors from 'cors'
import express, { Router } from 'express'
import type { ErrorRequestHandler, Express } from 'express'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './swagger'
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
  DependenciasCostos & {
    comprobarBaseDeDatos: () => Promise<void>
  }

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

  /**
   * @openapi
   * /api/salud:
   *   get:
   *     tags: [Sistema]
   *     summary: Comprueba que el servidor esté arriba y que la base de datos responda
   *     responses:
   *       200:
   *         description: El servidor y la base de datos responden
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 estado: { type: string, example: 'ok' }
   *                 baseDeDatos: { type: string, example: 'ok' }
   *       503:
   *         description: El servidor está arriba pero no logra conectarse a la base de datos
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 estado: { type: string, example: 'error' }
   *                 baseDeDatos: { type: string, example: 'error' }
   */
  api.get('/salud', async (_req, res) => {
    try {
      await deps.comprobarBaseDeDatos()
      res.json({ estado: 'ok', baseDeDatos: 'ok' })
    } catch {
      res.status(503).json({ estado: 'error', baseDeDatos: 'error' })
    }
  })
  api.use('/auth', rutasAutenticacion(deps))
  api.use('/motos', rutasMotos(deps))
  api.use('/garage', rutasGarage(deps))
  api.use('/garage/:motoGuardadaId/mantenimientos', rutasMantenimiento(deps))
  api.use('/garage/:motoGuardadaId/costos', rutasCostos(deps))

  const app = express()
  app.use(cors({ origin: origenFrontend }))
  app.use(express.json())
  app.use('/api', api)
  // Documentación interactiva de la API (Swagger UI), armada a partir de los
  // comentarios @openapi en infraestructura/http/rutas/*.ts.
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  app.use((_req, res) => void res.status(404).json({ error: 'Ruta no encontrada' }))
  app.use(errores)
  return app
}
