import { Router } from 'express'
import type { Request, Response } from 'express'
import { esCategoriaCosto } from '../../../dominio/modelo/CostoMensual'
import { GarageNoEncontrado } from '../../../aplicacion/casos-uso/soporte-garage'
import type { ConfigurarCostoMensual } from '../../../aplicacion/casos-uso/ConfigurarCostoMensual'
import type { ListarCostosMensuales } from '../../../aplicacion/casos-uso/ListarCostosMensuales'
import type { ServicioTokens } from '../../../dominio/puertos'
import { requiereSesion } from '../middleware/autenticacion'

export interface DependenciasCostos {
  tokens: ServicioTokens
  configurarCostoMensual: ConfigurarCostoMensual
  listarCostosMensuales: ListarCostosMensuales
}

// Se monta en el servidor bajo /garage/:motoGuardadaId/costos.
export function rutasCostos(deps: DependenciasCostos): Router {
  const router = Router({ mergeParams: true })
  router.use(requiereSesion(deps.tokens))

  router.get('/', async (req: Request, res: Response) => {
    try {
      res.json(await deps.listarCostosMensuales.ejecutar(req.usuarioId!, req.params.motoGuardadaId))
    } catch (error) {
      if (error instanceof GarageNoEncontrado) {
        res.status(404).json({ error: error.message })
        return
      }
      throw error
    }
  })

  router.post('/', async (req: Request, res: Response) => {
    const { categoria, monto, descripcion } = req.body ?? {}
    if (!esCategoriaCosto(categoria) || typeof monto !== 'number') {
      res.status(400).json({ error: 'categoria y monto son obligatorios y deben tener el formato correcto' })
      return
    }
    try {
      const costo = await deps.configurarCostoMensual.ejecutar(req.usuarioId!, {
        motoGuardadaId: req.params.motoGuardadaId,
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

  return router
}
