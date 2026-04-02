import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchUsers, activateUser, createUser } from '../api/client'

export default function UserSelect() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [addingUser, setAddingUser] = useState(false)
  const [newUserName, setNewUserName] = useState('')

  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })

  const onboardedUsers = allUsers.filter((u) => u.onboarding_complete)

  const selectMutation = useMutation({
    mutationFn: activateUser,
    onSuccess: () => {
      qc.setQueryData(['onboarding-status'], { complete: true })
      qc.invalidateQueries({ queryKey: ['active-user'] })
      qc.invalidateQueries({ queryKey: ['subscriptions'] })
      qc.invalidateQueries({ queryKey: ['recommendations'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      navigate('/dashboard')
    },
  })

  const addUserMutation = useMutation({
    mutationFn: async (name: string) => {
      const user = await createUser({ name })
      await activateUser(user.id)
      return user
    },
    onSuccess: (user) => {
      qc.invalidateQueries({ queryKey: ['users'] })
      qc.invalidateQueries({ queryKey: ['active-user'] })
      qc.setQueryData(['onboarding-status'], { complete: false })
      qc.invalidateQueries({ queryKey: ['subscriptions'] })
      qc.invalidateQueries({ queryKey: ['recommendations'] })
      sessionStorage.setItem('ami-new-user-name', user.name)
      navigate('/onboarding')
    },
  })

  const handleAddUser = () => {
    const name = newUserName.trim()
    if (!name) return
    addUserMutation.mutate(name)
  }

  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-4xl mb-3">🌿</div>
          <h1 className="text-2xl font-semibold text-slate-800">Welcome back</h1>
          <p className="text-sm text-slate-400 mt-1">Who are you?</p>
        </div>

        {/* User tiles */}
        <div className="card p-6">
          <div className="grid grid-cols-2 gap-3">
            {onboardedUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => selectMutation.mutate(u.id)}
                disabled={selectMutation.isPending}
                className="rounded-xl border border-slate-100 bg-slate-50 hover:bg-sage-50 hover:border-sage-200 p-4 text-center transition-colors disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-sage-100 text-sage-700 text-lg font-semibold flex items-center justify-center mx-auto mb-2">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-700">{u.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Create new account */}
        <div className="text-center space-y-3">
          {!addingUser ? (
            <p className="text-sm text-slate-400">
              Don't see your name above?{' '}
              <button
                className="font-medium text-sage-600 hover:text-sage-700 hover:underline"
                onClick={() => setAddingUser(true)}
              >
                Create your account now!
              </button>
            </p>
          ) : (
            <div className="card p-5 text-left space-y-3">
              <p className="text-sm font-medium text-slate-700">What should I call you?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input text-sm flex-1"
                  placeholder="Your name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddUser()
                    if (e.key === 'Escape') { setAddingUser(false); setNewUserName('') }
                  }}
                  autoFocus
                />
                <button
                  className="btn-primary text-sm px-4"
                  onClick={handleAddUser}
                  disabled={!newUserName.trim() || addUserMutation.isPending}
                >
                  {addUserMutation.isPending ? 'Creating…' : 'Go →'}
                </button>
              </div>
              <button
                className="text-xs text-slate-400 hover:text-slate-600"
                onClick={() => { setAddingUser(false); setNewUserName('') }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
