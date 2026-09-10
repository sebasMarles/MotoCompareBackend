import { Router } from 'express'
import type { Request, Response } from 'express'
import { MotoNoEncontrada } from '../../../aplicacion/casos-uso/ObtenerMotoPorId'
import { GarageNoEncontrado } from '../../../aplicacion/casos-uso/soporte-garage'
import type { AgregarMotoAlGarage } from '../../../aplicacion/casos-uso/AgregarMotoAlGarage'
import type { ListarGarage } from '../../../aplicacion/casos-uso/ListarGarage'
import type { ActualizarKilometraje } from '../../../aplicacion/casos-uso/ActualizarKilometraje'
import type { EliminarMotoDelGarage } from '../../../aplicacion/casos-uso/EliminarMotoDelGarage'
import type { ServicioTokens } from '../../../dominio/puertos'
import { requiereSesion } from '../middleware/autenticacion'

export interface DependenciasGarage {
  tokens: ServicioTokens
  agregarMotoAlGarage: AgregarMotoAlGarage
  listarGarage: ListarGarage
  actualizarKilometraje: ActualizarKilometraje
  eliminarMotoDelGarage: EliminarMotoDelGarage
}

export function rutasGarage(deps: DependenciasGarage): Router {
  const router = Router()
  router.use(requiereSesion(deps.tokens)) // Mi Garage es exclusivo de usuarios registrados.

  router.get('/', async (req: Request, res: Response) => {
    res.json(await deps.listarGarage.ejecutar(req.usuarioId!))
  })

  router.post('/', async (req: Request, res: Response) => {
    const { motoId, apodo } = req.body ?? {}
    if (typeof motoId !== 'string') {
      res.status(400).json({ error: 'motoId es obligatorio' })
      return
    }
    try {
      const guardada = await deps.agregarMotoAlGarage.ejecutar({ usuarioId: req.usuarioId!, motoId, apodo })
      res.status(201).json(guardada)
    } catch (error) {
      if (error instanceof MotoNoEncontrada) {
        res.status(404).json({ error: error.message })
        return
      }
      throw error
    }
  })

  router.patch('/:id/kilometraje', async (req: Request, res: Response) => {
    const { kilometrajeActual } = req.body ?? {}
    if (typeof kilometrajeActual !== 'number') {
      res.status(400).json({ error: 'kilometrajeActual debe ser un número' })
      return
    }
    try {
      const guardada = await deps.actualizarKilometraje.ejecutar(req.usuarioId!, req.params.id, kilometrajeActual)
      res.json(guardada)
    } catch (error) {
      if (error instanceof GarageNoEncontrado) {
        res.status(404).json({ error: error.message })
        return
      }
      throw error
    }
  })

  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      await deps.eliminarMotoDelGarage.ejecutar(req.usuarioId!, req.params.id)
      res.status(204).send()
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
