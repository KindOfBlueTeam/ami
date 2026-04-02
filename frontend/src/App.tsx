import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getOnboardingStatus, fetchUsers } from './api/client'
import Layout from './components/Layout'
import Onboarding from './pages/Onboarding'
import UserSelect from './pages/UserSelect'
import Dashboard from './pages/Dashboard'
import Services from './pages/Services'
import Usage from './pages/Usage'
import Recommendations from './pages/Recommendations'
import Settings from './pages/Settings'

function AppRoutes() {
  const { data, isLoading: statusLoading } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: getOnboardingStatus,
  })

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })

  if (statusLoading || usersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="text-slate-400 text-sm">Loading…</div>
      </div>
    )
  }

  const complete = data?.complete ?? false
  const onboardedCount = allUsers.filter((u) => u.onboarding_complete).length

  return (
    <Routes>
      <Route
        path="/"
        element={
          onboardedCount >= 2
            ? <UserSelect />
            : complete
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/onboarding" replace />
        }
      />
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
        element={<Navigate to="/" replace />}
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
