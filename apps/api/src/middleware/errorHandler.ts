import type { Request, Response, NextFunction } from 'express'

// Express identifies error-handling middleware by arity (4 params), so _next must stay even though it's unused.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}
