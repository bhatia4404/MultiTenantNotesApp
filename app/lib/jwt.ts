import jwt from 'jsonwebtoken'
import { User } from './types'

const JWT_SECRET = process.env.JWT_SECRET!

export interface JWTPayload {
  id: number
  email: string
  name: string
  role: string
  tenantId: string
  tenantName: string
}

export function generateToken(user: User & { tenantName: string }): string {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenant_id,
    tenantName: user.tenantName
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}