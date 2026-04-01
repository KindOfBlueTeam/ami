import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getOnboardingStatus } from './api/client'
import Layout from './components/Layout'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Services from './pages/Services'
import Usage from './pages/Usage'
import Recommendations from './pages/Recommendations'
import Settings from './pages/Settings'

function AppRoutes() {
  const { data, isLoading } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: getOnboardingStatus,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="text-slate-400 text-sm">Loading…</div>
      </div>
    )
  }

  const complete = data?.complete ?? false

  return (
    <Routes>
      <Route
        path="/onboarding"
        element={complete ? <Navigate to="/dashboard" replace /> : <Onboarding />}
      />
      <Route element={<Layout />}>
        <Route
          path="/dashboard"
          element={complete ? <Dashboard /> : <Navigate to="/onboarding" replace />}
        />
        <Route
          path="/services"
          element={complete ? <Services /> : <Navigate to="/onboarding" replace />}
        />
        <Route
          path="/usage"
          element={complete ? <Usage /> : <Navigate to="/onboarding" replace />}
        />
        <Route
          path="/recommendations"
          element={complete ? <Recommendations /> : <Navigate to="/onboarding" replace />}
        />
        <Route
          path="/settings"
          element={complete ? <Settings /> : <Navigate to="/onboarding" replace />}
        />
      </Route>
      <Route
        path="*"
        element={<Navigate to={complete ? '/dashboard' : '/onboarding'} replace />}
      />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
