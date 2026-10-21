import { useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth'
import type { Admin } from '../types'
import { AuthContext, type AuthContextValue } from './auth-state'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    authApi.loadSession()
      .then((result) => { if (active) setAdmin(result.admin) })
      .catch(() => { if (active) setAdmin(null) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    admin,
    loading,
    async signIn(email, password) {
      const result = await authApi.login(email, password)
      setAdmin(result.admin)
    },
    async signOut() {
      await authApi.logout()
      setAdmin(null)
    },
  }), [admin, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
