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

  router.get('/', async (req: Request, res: Response) => {
    const { marca, categoria } = req.query
    const motos = await deps.listarMotos.ejecutar({
      marca: typeof marca === 'string' ? marca : undefined,
      categoria: typeof categoria === 'string' ? categoria : undefined,
    })
    res.json(motos)
  })

  // Antes de "/:id" — si no, Express la trataría como una moto con id "comparaciones-recomendadas".
  router.get('/comparaciones-recomendadas', async (_req: Request, res: Response) => {
    res.json(await deps.listarComparacionesRecomendadas.ejecutar())
  })

  router.get('/:id', async (req: Request, res: Response) => {
    try {
      res.json(await deps.obtenerMotoPorId.ejecutar(req.params.id))
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
