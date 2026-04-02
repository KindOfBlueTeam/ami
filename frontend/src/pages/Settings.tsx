import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchSettings,
  updateSettings,
  getActiveUser,
  fetchUsers,
  createUser,
  activateUser,
  renameUser,
  deleteUser,
  deleteCurrentUser,
} from '../api/client'
import type { AppSettings, AppSettingsUpdate } from '../types'

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-slate-50 last:border-0 gap-6">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function ChipGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-1.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={
            value === o.value
              ? 'badge-sage font-medium cursor-default'
              : 'badge badge-gray hover:bg-slate-200 transition-colors cursor-pointer'
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  })

  const { data: activeUser } = useQuery({
    queryKey: ['active-user'],
    queryFn: getActiveUser,
  })

  const { data: allUsers } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })

  const [local, setLocal] = useState<AppSettingsUpdate>({})
  const [saved, setSaved] = useState(false)

  // Add new user state
  const [addingUser, setAddingUser] = useState(false)
  const [newUserName, setNewUserName] = useState('')

  // Rename state
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')

  // Delete confirm state (Account card)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Delete user confirm state (Manage Users section)
  const [deleteConfirmUserId, setDeleteConfirmUserId] = useState<number | null>(null)

  useEffect(() => {
    if (settings) setLocal(settings)
  }, [settings])

  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (data) => {
      qc.setQueryData(['settings'], data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
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

  const switchMutation = useMutation({
    mutationFn: activateUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      qc.invalidateQueries({ queryKey: ['active-user'] })
      qc.invalidateQueries({ queryKey: ['subscriptions'] })
      qc.invalidateQueries({ queryKey: ['recommendations'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['onboarding-status'] })
    },
  })

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => renameUser(id, { name }),
    onSuccess: () => {
      setEditingUserId(null)
      qc.invalidateQueries({ queryKey: ['users'] })
      qc.invalidateQueries({ queryKey: ['active-user'] })
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      setDeleteConfirmUserId(null)
      qc.invalidateQueries({ queryKey: ['users'] })
      qc.invalidateQueries({ queryKey: ['active-user'] })
    },
  })

  const deleteAccountMutation = useMutation({
    mutationFn: deleteCurrentUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      qc.invalidateQueries({ queryKey: ['active-user'] })
      qc.invalidateQueries({ queryKey: ['onboarding-status'] })
      qc.invalidateQueries({ queryKey: ['subscriptions'] })
      qc.invalidateQueries({ queryKey: ['recommendations'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      navigate('/onboarding')
    },
  })

  const handleSave = () => updateMutation.mutate(local)

  const set = (key: keyof AppSettings) => (v: string) =>
    setLocal((prev) => ({ ...prev, [key]: v as any }))

  const handleAddUser = () => {
    const name = newUserName.trim()
    if (!name) return
    addUserMutation.mutate(name)
  }

  if (isLoading) return <p className="text-slate-400 text-sm">Loading…</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-400 mt-0.5">Preferences and configuration.</p>
      </div>

      {/* Preferences card */}
      <div className="card px-6 py-2">
        <Row
          label="Eco priority"
          sub="How much weight to give environmental impact in recommendations."
        >
          <ChipGroup
            value={(local.eco_priority ?? 'medium') as any}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
            onChange={set('eco_priority')}
          />
        </Row>

        <Row
          label="Optimization style"
          sub="What Ami should prioritize in recommendations."
        >
          <ChipGroup
            value={(local.optimization_style ?? 'balanced') as any}
            options={[
              { value: 'cost', label: 'Cost' },
              { value: 'value', label: 'Value' },
              { value: 'eco', label: 'Eco' },
              { value: 'balanced', label: 'Balanced' },
            ]}
            onChange={set('optimization_style')}
          />
        </Row>

        <Row
          label="Eco tradeoff"
          sub="Would you pay more for a greener AI option?"
        >
          <ChipGroup
            value={(local.eco_tradeoff ?? 'maybe') as any}
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'maybe', label: 'Maybe' },
              { value: 'no', label: 'No' },
            ]}
            onChange={set('eco_tradeoff')}
          />
        </Row>

        <Row
          label="Grid carbon intensity"
          sub="kg CO₂e per kWh. Default is US average (EPA 2023)."
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.001"
              min="0"
              className="input w-28 text-sm"
              value={local.carbon_intensity_kwh ?? '0.386'}
              onChange={(e) => set('carbon_intensity_kwh')(e.target.value)}
            />
            <span className="text-xs text-slate-400">kg/kWh</span>
          </div>
        </Row>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? 'Saving…' : 'Save preferences'}
        </button>
        {saved && <span className="text-xs text-sage-600">Saved ✓</span>}
      </div>

      {/* Account */}
      <div className="card p-5 space-y-4">
        <div>
          <h2 className="text-sm font-medium text-slate-600">Account</h2>
          {activeUser && (
            <p className="text-xs text-slate-400 mt-0.5">
              Active profile: <span className="font-medium text-slate-500">{activeUser.name}</span>
              {allUsers && allUsers.length > 1 && (
                <span className="ml-1">· {allUsers.length} profiles on this device</span>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {/* Add New User */}
          {!addingUser ? (
            <button
              className="btn-secondary self-start"
              onClick={() => {
                setAddingUser(true)
                setConfirmDelete(false)
                setNewUserName('')
              }}
              disabled={addUserMutation.isPending}
            >
              Add new user
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="input text-sm w-44"
                placeholder="Name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddUser()
                  if (e.key === 'Escape') setAddingUser(false)
                }}
                autoFocus
              />
              <button
                className="btn-primary text-sm px-3 py-1.5"
                onClick={handleAddUser}
                disabled={!newUserName.trim() || addUserMutation.isPending}
              >
                {addUserMutation.isPending ? 'Creating…' : 'Create'}
              </button>
              <button
                className="text-xs text-slate-400 hover:text-slate-600"
                onClick={() => setAddingUser(false)}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Delete This Account */}
          {!confirmDelete ? (
            <button
              className="self-start text-sm font-medium text-red-600 hover:text-red-700 hover:underline transition-colors"
              onClick={() => {
                setConfirmDelete(true)
                setAddingUser(false)
              }}
            >
              Delete this account
            </button>
          ) : (
            <div className="rounded-lg border border-red-100 bg-red-50 p-4 space-y-3">
              <p className="text-sm text-red-700 font-medium">Delete this account?</p>
              <p className="text-xs text-red-600 leading-relaxed">
                This will permanently delete all subscriptions, recommendations, and usage
                data for <strong>{activeUser?.name ?? 'this account'}</strong>.
                {allUsers && allUsers.length === 1
                  ? ' You\'ll be taken back to onboarding to start fresh.'
                  : ' You\'ll be switched to another profile.'}
              </p>
              <div className="flex gap-2">
                <button
                  className="text-sm font-medium bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  onClick={() => deleteAccountMutation.mutate()}
                  disabled={deleteAccountMutation.isPending}
                >
                  {deleteAccountMutation.isPending ? 'Deleting…' : 'Yes, delete'}
                </button>
                <button
                  className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manage Users */}
      {allUsers && allUsers.length > 0 && (
        <div className="card p-5 space-y-3">
          <h2 className="text-sm font-medium text-slate-600">Manage users</h2>
          <div className="divide-y divide-slate-50">
            {allUsers.map((u) => (
              <div key={u.id} className="py-3 first:pt-0 last:pb-0">
                {deleteConfirmUserId === u.id ? (
                  <div className="rounded-lg border border-red-100 bg-red-50 p-3 space-y-2">
                    <p className="text-sm text-red-700 font-medium">Delete {u.name}?</p>
                    <p className="text-xs text-red-600 leading-relaxed">
                      This will permanently delete all subscriptions, recommendations, and usage data for <strong>{u.name}</strong>.
                    </p>
                    <div className="flex gap-2">
                      <button
                        className="text-sm font-medium bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        onClick={() => deleteUserMutation.mutate(u.id)}
                        disabled={deleteUserMutation.isPending}
                      >
                        {deleteUserMutation.isPending ? 'Deleting…' : 'Yes, delete'}
                      </button>
                      <button
                        className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5"
                        onClick={() => setDeleteConfirmUserId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : editingUserId === u.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="input text-sm flex-1 min-w-0"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && editName.trim()) {
                          renameMutation.mutate({ id: u.id, name: editName.trim() })
                        }
                        if (e.key === 'Escape') setEditingUserId(null)
                      }}
                      autoFocus
                    />
                    <button
                      className="btn-primary text-xs px-2.5 py-1.5"
                      onClick={() => {
                        if (editName.trim()) renameMutation.mutate({ id: u.id, name: editName.trim() })
                      }}
                      disabled={!editName.trim() || renameMutation.isPending}
                    >
                      {renameMutation.isPending ? '…' : 'Save'}
                    </button>
                    <button
                      className="text-xs text-slate-400 hover:text-slate-600"
                      onClick={() => setEditingUserId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-slate-700 truncate">{u.name}</span>
                      {u.is_active && (
                        <span className="badge-sage text-xs shrink-0">Active</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {!u.is_active && (
                        <button
                          className="text-xs text-slate-400 hover:text-slate-600"
                          onClick={() => switchMutation.mutate(u.id)}
                          disabled={switchMutation.isPending}
                        >
                          Switch to
                        </button>
                      )}
                      <button
                        className="text-xs text-slate-400 hover:text-slate-600"
                        onClick={() => {
                          setEditingUserId(u.id)
                          setEditName(u.name)
                          setDeleteConfirmUserId(null)
                        }}
                      >
                        Rename
                      </button>
                      {!u.is_active && (
                        <button
                          className="text-xs text-red-400 hover:text-red-600"
                          onClick={() => {
                            setDeleteConfirmUserId(u.id)
                            setEditingUserId(null)
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* About */}
      <div className="card p-5 space-y-3">
        <h2 className="text-sm font-medium text-slate-600">About Ami</h2>
        <div className="text-xs text-slate-400 space-y-1.5 leading-relaxed">
          <p>
            Ami is a local-first AI subscription tracker. All data is stored in a SQLite file
            on your device. No network requests are made to external services.
          </p>
          <p>
            <strong className="text-slate-500">V1 scope:</strong> Consumer AI subscriptions only.
            API platform billing (OpenAI API, Anthropic API, etc.) is not tracked — those have
            different billing models and are out of scope for this tool.
          </p>
          <p>
            <strong className="text-slate-500">Environmental estimates:</strong> kWh and CO₂e
            figures are rough approximations based on published research. They should be read as
            directional indicators, not precise measurements.
          </p>
          <p>Version 0.2.0 · Local</p>
        </div>
      </div>
    </div>
  )
}
