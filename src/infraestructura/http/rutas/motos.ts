import { Router } from 'express'
import type { Request, Response } from 'express'
import { MotoNoEncontrada } from '../../../aplicacion/casos-uso/ObtenerMotoPorId'
import type { ListarMotos } from '../../../aplicacion/casos-uso/ListarMotos'
import type { ObtenerMotoPorId } from '../../../aplicacion/casos-uso/ObtenerMotoPorId'
import type { ListarComparacionesRecomendadas } from '../../../aplicacion/casos-uso/ListarComparacionesRecomendadas'

export interface DependenciasMotos {
  listarMotos: ListarMotos
  obtenerMotoPorId: ObtenerMotoPorId
  listarComparacionesRecomendadas: ListarComparacionesRecomendadas
}

export function rutasMotos(deps: DependenciasMotos): Router {
  const router = Router()

  /**
   * @openapi
   * /api/motos:
   *   get:
   *     tags: [Motos]
   *     summary: Lista el catálogo de motos
   *     parameters:
   *       - in: query
   *         name: marca
   *         schema: { type: string }
   *       - in: query
   *         name: categoria
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: Lista de motos
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items: { $ref: '#/components/schemas/Moto' }
   */
  router.get('/', async (req: Request, res: Response) => {
    const { marca, categoria } = req.query
    const filtros: { marca?: string; categoria?: string } = {}
    if (typeof marca === 'string') filtros.marca = marca
    if (typeof categoria === 'string') filtros.categoria = categoria
    const motos = await deps.listarMotos.ejecutar(filtros)
    res.json(motos)
  })

  // Antes de "/:id" — si no, Express la trataría como una moto con id "comparaciones-recomendadas".
  /**
   * @openapi
   * /api/motos/comparaciones-recomendadas:
   *   get:
   *     tags: [Motos]
   *     summary: Lista las comparaciones recomendadas del catálogo
   *     responses:
   *       200:
   *         description: Comparaciones recomendadas
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items: { $ref: '#/components/schemas/ComparacionRecomendadaDTO' }
   */
  router.get('/comparaciones-recomendadas', async (_req: Request, res: Response) => {
    res.json(await deps.listarComparacionesRecomendadas.ejecutar())
  })

  /**
   * @openapi
   * /api/motos/{id}:
   *   get:
   *     tags: [Motos]
   *     summary: Obtiene una moto por id
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200:
   *         description: La moto
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Moto' }
   *       404:
   *         description: No existe una moto con ese id
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/Error' }
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      res.json(await deps.obtenerMotoPorId.ejecutar(req.params.id as string))
    } catch (error) {
      if (error instanceof MotoNoEncontrada) {
        res.status(404).json({ error: error.message })
        return
      }
      throw error
    }
  })

  return router
}
