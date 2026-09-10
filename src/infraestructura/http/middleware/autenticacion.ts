import type { NextFunction, Request, RequestHandler, Response } from 'express'
import type { SesionesDAO, ServicioTokens } from '../../../dominio/puertos'

declare global {
  namespace Express {
    interface Request {
      usuarioId?: string
      sesionJti?: string
      sesionExpiraEn?: Date
    }
  }
}

export function requiereSesion(tokens: ServicioTokens, sesiones: SesionesDAO): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const encabezado = req.headers.authorization
    const token = encabezado?.startsWith('Bearer ') ? encabezado.slice(7) : null
    const credencial = token && tokens.verificar(token)

    if (!credencial) {
      res.status(401).json({ error: 'Se requiere iniciar sesión' })
      return
    }

    // El JWT en sí sigue siendo "válido" hasta su expiración natural; esta comprobación
    // es lo que hace que un logout invalide de verdad la sesión antes de esa fecha.
    if (await sesiones.estaRevocada(credencial.jti)) {
      res.status(401).json({ error: 'La sesión fue cerrada, inicia sesión de nuevo' })
      return
    }

    req.usuarioId = credencial.id
    req.sesionJti = credencial.jti
    req.sesionExpiraEn = credencial.exp
    next()
  }
}
