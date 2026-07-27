import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { OAuth2Client } from 'google-auth-library'
import type { AuthResponse, AuthUser, SignupRequest, LoginRequest, GoogleAuthRequest } from '@fluidgym/shared-types'
import { createUser, findUserByEmail, findUserByGoogleId, linkGoogleId } from '../db/userRepo'
import { signToken } from '../auth/jwt'
import { asyncHandler } from '../middleware/asyncHandler'

const SALT_ROUNDS = 10

const router = Router()

function toAuthUser(user: { id: string; email: string }): AuthUser {
  return { id: user.id, email: user.email }
}

router.post('/signup', asyncHandler(async (req, res) => {
  const { email, password } = req.body as Partial<SignupRequest>
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' })
    return
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'password must be at least 8 characters' })
    return
  }

  const existing = await findUserByEmail(email)
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists' })
    return
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const user = await createUser({ email, passwordHash })
  const token = signToken({ userId: user.id })

  const response: AuthResponse = { token, user: toAuthUser(user) }
  res.status(201).json(response)
}))

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body as Partial<LoginRequest>
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' })
    return
  }

  const user = await findUserByEmail(email)
  if (!user || !user.passwordHash) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const token = signToken({ userId: user.id })
  const response: AuthResponse = { token, user: toAuthUser(user) }
  res.json(response)
}))

function getGoogleClient(): { client: OAuth2Client; clientId: string } {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId || clientId.startsWith('your-')) {
    throw new Error('GOOGLE_CLIENT_ID is missing or still a placeholder in .env')
  }
  return { client: new OAuth2Client(clientId), clientId }
}

router.post('/google', asyncHandler(async (req, res) => {
  const { idToken } = req.body as Partial<GoogleAuthRequest>
  if (!idToken) {
    res.status(400).json({ error: 'idToken is required' })
    return
  }

  let client: OAuth2Client
  let clientId: string
  try {
    ;({ client, clientId } = getGoogleClient())
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
    return
  }

  let payload
  try {
    const ticket = await client.verifyIdToken({ idToken, audience: clientId })
    payload = ticket.getPayload()
  } catch {
    res.status(401).json({ error: 'Invalid Google ID token' })
    return
  }

  if (!payload?.email || !payload.sub) {
    res.status(401).json({ error: 'Google token did not include an email' })
    return
  }
  if (!payload.email_verified) {
    res.status(401).json({ error: 'Google account email is not verified' })
    return
  }

  let user = await findUserByGoogleId(payload.sub)
  if (!user) {
    const existingByEmail = await findUserByEmail(payload.email)
    user = existingByEmail
      ? await linkGoogleId(existingByEmail.id, payload.sub)
      : await createUser({ email: payload.email, googleId: payload.sub })
  }

  const token = signToken({ userId: user.id })
  const response: AuthResponse = { token, user: toAuthUser(user) }
  res.json(response)
}))

export default router
