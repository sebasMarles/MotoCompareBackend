import { Router } from 'express'
import type { Request, Response } from 'express'
import type { ListarMotos } from '../../../aplicacion/casos-uso/ListarMotos'
import type { ObtenerMotoPorId } from '../../../aplicacion/casos-uso/ObtenerMotoPorId'
import type { ListarComparacionesRecomendadas } from '../../../aplicacion/casos-uso/ListarComparacionesRecomendadas'
import type { OrdenMoto } from '../../../dominio/puertos'

const ORDENES_VALIDOS: OrdenMoto[] = ['precio_asc', 'precio_desc', 'potencia_asc', 'potencia_desc']
function esOrdenValido(valor: unknown): valor is OrdenMoto {
  return typeof valor === 'string' && (ORDENES_VALIDOS as string[]).includes(valor)
}

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
   *       - in: query
   *         name: busqueda
   *         description: Texto libre; filtra motos cuya marca o modelo lo contengan.
   *         schema: { type: string }
   *       - in: query
   *         name: limite
   *         description: Cantidad máxima de motos a devolver (paginación). Entre 1 y 100.
   *         schema: { type: integer, minimum: 1, maximum: 100 }
   *       - in: query
   *         name: pagina
   *         description: Número de página (empieza en 1). Solo aplica si se envía `limite`.
   *         schema: { type: integer, minimum: 1 }
   *       - in: query
   *         name: orden
   *         description: Orden del catálogo.
   *         schema: { type: string, enum: [precio_asc, precio_desc, potencia_asc, potencia_desc] }
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
    const { marca, categoria, busqueda, limite, pagina, orden } = req.query
    const filtros: { marca?: string; categoria?: string; busqueda?: string; limite?: number; pagina?: number; orden?: OrdenMoto } = {}
    if (typeof marca === 'string') filtros.marca = marca
    if (typeof categoria === 'string') filtros.categoria = categoria
    if (typeof busqueda === 'string' && busqueda.trim() !== '') filtros.busqueda = busqueda.trim()
    if (orden !== undefined) {
      if (!esOrdenValido(orden)) {
        res.status(400).json({ error: 'orden debe ser uno de: ' + ORDENES_VALIDOS.join(', ') })
        return
      }
      filtros.orden = orden
    }

    if (typeof limite === 'string') {
      const limiteNumero = Number(limite)
      if (!Number.isInteger(limiteNumero) || limiteNumero < 1 || limiteNumero > 100) {
        res.status(400).json({ error: 'limite debe ser un entero entre 1 y 100' })
        return
      }
      filtros.limite = limiteNumero
    }
    if (typeof pagina === 'string') {
      const paginaNumero = Number(pagina)
      if (!Number.isInteger(paginaNumero) || paginaNumero < 1) {
        res.status(400).json({ error: 'pagina debe ser un entero mayor o igual a 1' })
        return
      }
      filtros.pagina = paginaNumero
    }

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
    res.json(await deps.obtenerMotoPorId.ejecutar(req.params.id as string))
  })

  return router
}