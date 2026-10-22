import { Router } from 'express'
import type { Request, Response } from 'express'
import { MotoNoEncontrada } from '../../../aplicacion/casos-uso/ObtenerMotoPorId'
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
   *       - in: query
   *         name: precioMin
   *         description: Precio mínimo (inclusive).
   *         schema: { type: number, minimum: 0 }
   *       - in: query
   *         name: precioMax
   *         description: Precio máximo (inclusive).
   *         schema: { type: number, minimum: 0 }
   *       - in: query
   *         name: cilindradaMin
   *         description: Cilindrada mínima en cc (inclusive).
   *         schema: { type: number, minimum: 0 }
   *       - in: query
   *         name: cilindradaMax
   *         description: Cilindrada máxima en cc (inclusive).
   *         schema: { type: number, minimum: 0 }
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
    const { marca, categoria, busqueda, limite, pagina, orden, precioMin, precioMax, cilindradaMin, cilindradaMax } = req.query
    const filtros: {
      marca?: string
      categoria?: string
      busqueda?: string
      limite?: number
      pagina?: number
      orden?: OrdenMoto
      precioMin?: number
      precioMax?: number
      cilindradaMin?: number
      cilindradaMax?: number
    } = {}
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

    const parametroNumericoNoNegativo = (valor: unknown, nombre: string): number | undefined | 'invalido' => {
      if (valor === undefined) return undefined
      if (typeof valor !== 'string') return 'invalido'
      const numero = Number(valor)
      if (!Number.isFinite(numero) || numero < 0) return 'invalido'
      return numero
    }

    const precioMinNumero = parametroNumericoNoNegativo(precioMin, 'precioMin')
    if (precioMinNumero === 'invalido') {
      res.status(400).json({ error: 'precioMin debe ser un número mayor o igual a 0' })
      return
    }
    if (precioMinNumero !== undefined) filtros.precioMin = precioMinNumero

    const precioMaxNumero = parametroNumericoNoNegativo(precioMax, 'precioMax')
    if (precioMaxNumero === 'invalido') {
      res.status(400).json({ error: 'precioMax debe ser un número mayor o igual a 0' })
      return
    }
    if (precioMaxNumero !== undefined) filtros.precioMax = precioMaxNumero

    const cilindradaMinNumero = parametroNumericoNoNegativo(cilindradaMin, 'cilindradaMin')
    if (cilindradaMinNumero === 'invalido') {
      res.status(400).json({ error: 'cilindradaMin debe ser un número mayor o igual a 0' })
      return
    }
    if (cilindradaMinNumero !== undefined) filtros.cilindradaMin = cilindradaMinNumero

    const cilindradaMaxNumero = parametroNumericoNoNegativo(cilindradaMax, 'cilindradaMax')
    if (cilindradaMaxNumero === 'invalido') {
      res.status(400).json({ error: 'cilindradaMax debe ser un número mayor o igual a 0' })
      return
    }
    if (cilindradaMaxNumero !== undefined) filtros.cilindradaMax = cilindradaMaxNumero

    if (filtros.precioMin !== undefined && filtros.precioMax !== undefined && filtros.precioMin > filtros.precioMax) {
      res.status(400).json({ error: 'precioMin no puede ser mayor que precioMax' })
      return
    }
    if (
      filtros.cilindradaMin !== undefined &&
      filtros.cilindradaMax !== undefined &&
      filtros.cilindradaMin > filtros.cilindradaMax
    ) {
      res.status(400).json({ error: 'cilindradaMin no puede ser mayor que cilindradaMax' })
      return
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