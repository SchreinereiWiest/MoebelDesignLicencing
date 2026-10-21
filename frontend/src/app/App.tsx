import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'
import LoginPage from '../features/auth/LoginPage'
import LicenseDashboard from '../features/licenses/LicenseDashboard'

function ProtectedApp() {
  const { admin, loading } = useAuth()
  if (loading) return <div className="grid min-h-screen place-items-center bg-ink-950 text-sm text-slate-400">Sitzung wird geprüft …</div>
  if (!admin) return <Navigate to="/login" replace />
  return <LicenseDashboard />
}

function AppRoutes() {
  const { admin, loading } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={!loading && admin ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider><AppRoutes /></AuthProvider>
    </BrowserRouter>
  )
}
