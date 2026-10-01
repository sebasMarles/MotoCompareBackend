import { Router } from 'express'
import type { Request, Response } from 'express'
import { CorreoYaRegistrado } from '../../../aplicacion/casos-uso/RegistrarUsuario'
import type { RegistrarUsuario } from '../../../aplicacion/casos-uso/RegistrarUsuario'
import { CredencialesInvalidas } from '../../../aplicacion/casos-uso/IniciarSesion'
import type { IniciarSesion } from '../../../aplicacion/casos-uso/IniciarSesion'
import type { CerrarSesion } from '../../../aplicacion/casos-uso/CerrarSesion'
import { aUsuarioDTO } from '../../../dominio/modelo/Usuario'
import type { SesionesDAO, ServicioTokens, UsuarioDAO } from '../../../dominio/puertos'
import { requiereSesion } from '../middleware/autenticacion'
import { correoValido, claveValida, nombreValido } from '../validacion'

export interface DependenciasAutenticacion {
  usuarios: UsuarioDAO
  tokens: ServicioTokens
  sesiones: SesionesDAO
  registrarUsuario: RegistrarUsuario
  iniciarSesion: IniciarSesion
  cerrarSesion: CerrarSesion
}

export function rutasAutenticacion(deps: DependenciasAutenticacion): Router {
  const router = Router()

  /**
   * @openapi
   * /api/auth/registro:
   *   post:
   *     tags: [Autenticación]
   *     summary: Registra un usuario nuevo
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegistroInput'
   *     responses:
   *       201:
   *         description: Usuario creado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Usuario'
   *       400:
   *         description: Datos inválidos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       409:
   *         description: El correo ya está registrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/registro', async (req: Request, res: Response) => {
    const { nombre, correo, clave } = req.body ?? {}
    if (typeof nombre !== 'string' || typeof correo !== 'string' || typeof clave !== 'string') {
      res.status(400).json({ error: 'nombre, correo y clave son obligatorios' })
      return
    }
    if (!nombreValido(nombre)) {
      res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres' })
      return
    }
    if (!correoValido(correo)) {
      res.status(400).json({ error: 'El correo no tiene un formato válido' })
      return
    }
    if (!claveValida(clave)) {
      res.status(400).json({ error: 'La clave debe tener al menos 8 caracteres' })
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

  /**
   * @openapi
   * /api/auth/login:
   *   post:
   *     tags: [Autenticación]
   *     summary: Inicia sesión y devuelve un token JWT
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginInput'
   *     responses:
   *       200:
   *         description: Sesión iniciada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/SesionDTO'
   *       400:
   *         description: correo y clave son obligatorios
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Correo o clave incorrectos
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
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

  /**
   * @openapi
   * /api/auth/perfil:
   *   get:
   *     tags: [Autenticación]
   *     summary: Devuelve el usuario autenticado
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Usuario autenticado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Usuario'
   *       401:
   *         description: Se requiere iniciar sesión
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Usuario no encontrado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.get('/perfil', requiereSesion(deps.tokens, deps.sesiones), async (req: Request, res: Response) => {
    const usuario = await deps.usuarios.porId(req.usuarioId!)
    if (!usuario) {
      res.status(404).json({ error: 'Usuario no encontrado' })
      return
    }
    res.json(aUsuarioDTO(usuario))
  })

  /**
   * @openapi
   * /api/auth/logout:
   *   post:
   *     tags: [Autenticación]
   *     summary: Cierra la sesión actual (revoca el token)
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       204:
   *         description: Sesión cerrada
   *       401:
   *         description: Se requiere iniciar sesión
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  router.post('/logout', requiereSesion(deps.tokens, deps.sesiones), async (req: Request, res: Response) => {
    await deps.cerrarSesion.ejecutar(req.sesionJti!, req.sesionExpiraEn!)
    res.status(204).send()
  })

  return router
}
