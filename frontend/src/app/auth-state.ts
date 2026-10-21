import { createContext } from 'react'
import type { Admin } from '../types'

export type AuthContextValue = {
  admin: Admin | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
