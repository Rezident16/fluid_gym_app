import jwt from 'jsonwebtoken'

const TOKEN_TTL = '30d'

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.startsWith('replace-with-')) {
    throw new Error('JWT_SECRET is missing or still a placeholder in .env — set a real secret before issuing tokens.')
  }
  return secret
}

export interface TokenPayload {
  userId: string
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: TOKEN_TTL })
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, getJwtSecret()) as TokenPayload
}
