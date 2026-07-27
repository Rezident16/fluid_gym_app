import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../auth/jwt'

export interface AuthedRequest extends Request {
  userId?: string
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined

  if (!token) {
    res.status(401).json({ error: 'Missing bearer token' })
    return
  }

  try {
    req.userId = verifyToken(token).userId
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
