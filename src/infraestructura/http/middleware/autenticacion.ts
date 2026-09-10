import type { NextFunction, Request, RequestHandler, Response } from 'express'
import type { ServicioTokens } from '../../../dominio/puertos'

// Extiende el tipo de Request de Express para que el resto del código sepa que
// req.usuarioId existe después de pasar por este middleware.
declare global {
  namespace Express {
    interface Request {
      usuarioId?: string
    }
  }
}

/** Exige un token válido en `Authorization: Bearer <token>` y deja el id del usuario
 * en `req.usuarioId` para que las rutas protegidas lo usen. */
export function requiereSesion(tokens: ServicioTokens): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const encabezado = req.headers.authorization
    const token = encabezado?.startsWith('Bearer ') ? encabezado.slice(7) : null
    const credencial = token && tokens.verificar(token)

    if (!credencial) {
      res.status(401).json({ error: 'Se requiere iniciar sesión' })
      return
    }

    req.usuarioId = credencial.id
    next()
  }
}
