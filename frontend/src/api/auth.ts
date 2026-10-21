import { api } from './client'
import type { Admin } from '../types'

type AuthResponse = { admin: Admin; expiresAt: string }

export const login = (email: string, password: string) => api<AuthResponse>('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
})

export const loadSession = () => api<AuthResponse>('/api/auth/me')
export const logout = () => api<void>('/api/auth/logout', { method: 'POST' })
