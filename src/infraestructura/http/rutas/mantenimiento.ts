import { Router } from 'express'
import type { Request, Response } from 'express'
import { esTipoMantenimiento } from '../../../dominio/modelo/RegistroMantenimiento'
import type { RegistrarMantenimiento } from '../../../aplicacion/casos-uso/RegistrarMantenimiento'
import type { ListarMantenimientos } from '../../../aplicacion/casos-uso/ListarMantenimientos'
import type { ServicioTokens, SesionesDAO } from '../../../dominio/puertos'
import { requiereSesion } from '../middleware/autenticacion'
import { esSeparadorCsv, mantenimientosACsv } from '../csv'

export interface DependenciasMantenimiento {
  tokens: ServicioTokens
  sesiones: SesionesDAO
  registrarMantenimiento: RegistrarMantenimiento
  listarMantenimientos: ListarMantenimientos
}

// Se monta en el servidor bajo /garage/:motoGuardadaId/mantenimientos (mergeParams
// es lo que permite leer :motoGuardadaId aquí, aunque el parámetro lo declara el padre).
export function rutasMantenimiento(deps: DependenciasMantenimiento): Router {
  const router = Router({ mergeParams: true })
  router.use(requiereSesion(deps.tokens, deps.sesiones))

  /**
   * @openapi
   * /api/garage/{motoGuardadaId}/mantenimientos:
   *   get:
   *     tags: [Mantenimiento]
   *     summary: Lista los mantenimientos registrados de una moto guardada
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: motoGuardadaId
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: Mantenimientos registrados
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items: { $ref: '#/components/schemas/RegistroMantenimiento' }
   *       404:
   *         description: No existe esa moto guardada para este usuario
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Error' }
   */
  router.get('/', async (req: Request, res: Response) => {
    res.json(await deps.listarMantenimientos.ejecutar(req.usuarioId!, req.params.motoGuardadaId as string))
  })

  /**
   * @openapi
   * /api/garage/{motoGuardadaId}/mantenimientos/exportar:
   *   get:
   *     tags: [Mantenimiento]
   *     summary: Descarga el historial de mantenimiento de una moto guardada en CSV
   *     description: Columnas fecha, tipo, kilometraje, costo y notas, del mantenimiento más antiguo al más reciente.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: motoGuardadaId
   *         required: true
   *         schema: { type: string }
   *       - in: query
   *         name: separador
   *         description: Separador de columnas. Usa `;` si Excel en español muestra todo en una sola columna.
   *         schema: { type: string, enum: [',', ';'], default: ',' }
   *     responses:
   *       200:
   *         description: Archivo CSV para descargar
   *         content:
   *           text/csv:
   *             schema: { type: string }
   *       400:
   *         description: El separador no es válido
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Error' }
   *       404:
   *         description: No existe esa moto guardada para este usuario
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Error' }
   */
  router.get('/exportar', async (req: Request, res: Response) => {
    const separador = req.query['separador'] ?? ','
    if (!esSeparadorCsv(separador)) {
      res.status(400).json({ error: 'separador debe ser "," o ";"' })
      return
    }
    const motoGuardadaId = req.params.motoGuardadaId as string
    const registros = await deps.listarMantenimientos.ejecutar(req.usuarioId!, motoGuardadaId)
    res.attachment(`historial-mantenimiento-${motoGuardadaId}.csv`)
    res.send(mantenimientosACsv(registros, separador))
  })

  /**
   * @openapi
   * /api/garage/{motoGuardadaId}/mantenimientos:
   *   post:
   *     tags: [Mantenimiento]
   *     summary: Registra un mantenimiento para una moto guardada
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: motoGuardadaId
   *         required: true
   *         schema: { type: string }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema: { $ref: '#/components/schemas/NuevoMantenimientoInput' }
   *     responses:
   *       201:
   *         description: Mantenimiento registrado
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/RegistroMantenimiento' }
   *       400:
   *         description: tipo, kilometraje y costo son obligatorios y deben tener el formato correcto
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Error' }
   *       404:
   *         description: No existe esa moto guardada para este usuario
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Error' }
   */
  router.post('/', async (req: Request, res: Response) => {
    const { tipo, fecha, kilometraje, costo, notas } = req.body ?? {}
    if (!esTipoMantenimiento(tipo) || typeof kilometraje !== 'number' || typeof costo !== 'number') {
      res.status(400).json({ error: 'tipo, kilometraje y costo son obligatorios y deben tener el formato correcto' })
      return
    }
    const registro = await deps.registrarMantenimiento.ejecutar(req.usuarioId!, {
      motoGuardadaId: req.params.motoGuardadaId as string,
      tipo,
      fecha: fecha ? new Date(fecha) : new Date(),
      kilometraje,
      costo,
      notas,
    })
    res.status(201).json(registro)
  })

  return router
}
