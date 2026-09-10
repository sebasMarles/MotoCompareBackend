import { Router } from 'express'
import type { Request, Response } from 'express'
import { CorreoYaRegistrado } from '../../../aplicacion/casos-uso/RegistrarUsuario'
import type { RegistrarUsuario } from '../../../aplicacion/casos-uso/RegistrarUsuario'
import { CredencialesInvalidas } from '../../../aplicacion/casos-uso/IniciarSesion'
import type { IniciarSesion } from '../../../aplicacion/casos-uso/IniciarSesion'
import { aUsuarioDTO } from '../../../dominio/modelo/Usuario'
import type { ServicioTokens, UsuarioDAO } from '../../../dominio/puertos'
import { requiereSesion } from '../middleware/autenticacion'

export interface DependenciasAutenticacion {
  usuarios: UsuarioDAO
  tokens: ServicioTokens
  registrarUsuario: RegistrarUsuario
  iniciarSesion: IniciarSesion
}

export function rutasAutenticacion(deps: DependenciasAutenticacion): Router {
  const router = Router()

  router.post('/registro', async (req: Request, res: Response) => {
    const { nombre, correo, clave } = req.body ?? {}
    if (typeof nombre !== 'string' || typeof correo !== 'string' || typeof clave !== 'string') {
      res.status(400).json({ error: 'nombre, correo y clave son obligatorios' })
      return
    }
    try {
      const usuario = await deps.registrarUsuario.ejecutar({ nombre, correo, clave })
      res.status(201).json(aUsuarioDTO(usuario))
    } catch (error) {
      if (error instanceof CorreoYaRegistrado) {
        res.status(409).json({ error: error.message })
        return
      }
      throw error
    }
  })

  router.post('/login', async (req: Request, res: Response) => {
    const { correo, clave } = req.body ?? {}
    if (typeof correo !== 'string' || typeof clave !== 'string') {
      res.status(400).json({ error: 'correo y clave son obligatorios' })
      return
    }
    try {
      const sesion = await deps.iniciarSesion.ejecutar(correo, clave)
      res.json(sesion)
    } catch (error) {
      if (error instanceof CredencialesInvalidas) {
        res.status(401).json({ error: error.message })
        return
      }
      throw error
    }
  })

  router.get('/perfil', requiereSesion(deps.tokens), async (req: Request, res: Response) => {
    const usuario = await deps.usuarios.porId(req.usuarioId!)
    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' })
      return
    }
    res.json(aUsuarioDTO(usuario))
  })

  return router
}
