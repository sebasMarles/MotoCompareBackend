import { Router } from 'express'
import type { Request, Response } from 'express'
import { esCategoriaCosto } from '../../../dominio/modelo/CostoMensual'
import { GarageNoEncontrado } from '../../../aplicacion/casos-uso/soporte-garage'
import type { ConfigurarCostoMensual } from '../../../aplicacion/casos-uso/ConfigurarCostoMensual'
import type { ListarCostosMensuales } from '../../../aplicacion/casos-uso/ListarCostosMensuales'
import { CostoNoEncontrado } from '../../../aplicacion/casos-uso/EliminarCostoMensual'
import type { EliminarCostoMensual } from '../../../aplicacion/casos-uso/EliminarCostoMensual'
import type { ServicioTokens, SesionesDAO } from '../../../dominio/puertos'
import { requiereSesion } from '../middleware/autenticacion'

export interface DependenciasCostos {
  tokens: ServicioTokens
  sesiones: SesionesDAO
  configurarCostoMensual: ConfigurarCostoMensual
  listarCostosMensuales: ListarCostosMensuales
  eliminarCostoMensual: EliminarCostoMensual
}

// Se monta en el servidor bajo /garage/:motoGuardadaId/costos.
export function rutasCostos(deps: DependenciasCostos): Router {
  const router = Router({ mergeParams: true })
  router.use(requiereSesion(deps.tokens, deps.sesiones))

  /**
   * @openapi
   * /api/garage/{motoGuardadaId}/costos:
   *   get:
   *     tags: [Costos]
   *     summary: Lista los costos mensuales de una moto guardada, con el total y el salario ideal
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: motoGuardadaId
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: Resumen de costos
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/ResumenCostosDTO' }
   *       404:
   *         description: No existe esa moto guardada para este usuario
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Error' }
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      res.json(await deps.listarCostosMensuales.ejecutar(req.usuarioId!, req.params.motoGuardadaId as string))
    } catch (error) {
      if (error instanceof GarageNoEncontrado) {
        res.status(404).json({ error: error.message })
        return
      }
      throw error
    }
  })

  /**
   * @openapi
   * /api/garage/{motoGuardadaId}/costos:
   *   post:
   *     tags: [Costos]
   *     summary: Configura un costo mensual para una moto guardada
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
   *           schema: { $ref: '#/components/schemas/NuevoCostoInput' }
   *     responses:
   *       201:
   *         description: Costo mensual creado
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/CostoMensual' }
   *       400:
   *         description: categoria y monto son obligatorios y deben tener el formato correcto
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
    const { categoria, monto, descripcion } = req.body ?? {}
    if (!esCategoriaCosto(categoria) || typeof monto !== 'number') {
      res.status(400).json({ error: 'categoria y monto son obligatorios y deben tener el formato correcto' })
      return
    }
    try {
      const costo = await deps.configurarCostoMensual.ejecutar(req.usuarioId!, {
        motoGuardadaId: req.params.motoGuardadaId as string,
        categoria,
        monto,
        descripcion,
      })
      res.status(201).json(costo)
    } catch (error) {
      if (error instanceof GarageNoEncontrado) {
        res.status(404).json({ error: error.message })
        return
      }
      throw error
    }
  })

  /**
   * @openapi
   * /api/garage/{motoGuardadaId}/costos/{costoId}:
   *   delete:
   *     tags: [Costos]
   *     summary: Elimina un costo mensual de una moto guardada
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: motoGuardadaId
   *         required: true
   *         schema: { type: string }
   *       - in: path
   *         name: costoId
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       204:
   *         description: Costo eliminado
   *       404:
   *         description: No existe esa moto guardada o ese costo para este usuario
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Error' }
   */
  router.delete('/:costoId', async (req: Request, res: Response) => {
    try {
      await deps.eliminarCostoMensual.ejecutar(req.usuarioId!, req.params.motoGuardadaId as string, req.params.costoId as string)
      res.status(204).send()
    } catch (error) {
      if (error instanceof GarageNoEncontrado || error instanceof CostoNoEncontrado) {
        res.status(404).json({ error: error.message })
        return
      }
      throw error
    }
  })

  return router
}
