import { NextRequest } from 'next/server'
import { verifyToken, JWTPayload } from './jwt'

export interface AuthResult {
  success: boolean
  user?: JWTPayload
  error?: string
}

export function getAuthFromRequest(request: NextRequest): AuthResult {
  try {
    // Try to get token from Authorization header first
    const authHeader = request.headers.get('authorization')
    let token: string | null = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      // Fallback to cookie
      token = request.cookies.get('auth-token')?.value || null
    }

    if (!token) {
      return {
        success: false,
        error: 'No authentication token provided'
      }
    }

    const user = verifyToken(token)
    if (!user) {
      return {
        success: false,
        error: 'Invalid or expired token'
      }
    }

    return {
      success: true,
      user
    }
  } catch (error) {
    return {
      success: false,
      error: 'Authentication failed'
    }
  }
}

export function requireAuth(request: NextRequest): AuthResult {
  return getAuthFromRequest(request)
}

export function requireRole(request: NextRequest, allowedRoles: string[]): AuthResult {
  const authResult = getAuthFromRequest(request)
  
  if (!authResult.success) {
    return authResult
  }

  if (!allowedRoles.includes(authResult.user!.role)) {
    return {
      success: false,
      error: 'Insufficient permissions'
    }
  }

  return authResult
}

export function requireAdmin(request: NextRequest): AuthResult {
  return requireRole(request, ['admin'])
}

export function requireTenant(request: NextRequest, tenantId: string): AuthResult {
  const authResult = getAuthFromRequest(request)
  
  if (!authResult.success) {
    return authResult
  }

  if (authResult.user!.tenantId !== tenantId) {
    return {
      success: false,
      error: 'Access denied: Different tenant'
    }
  }

  return authResult
}