import { createContext, useContext, useState, type ReactNode } from 'react'

export type UnitSystem = 'metric' | 'imperial'

const STORAGE_KEY = 'ami-unit-system'

interface UnitSystemContextValue {
  unitSystem: UnitSystem
  setUnitSystem: (v: UnitSystem) => void
}

const UnitSystemContext = createContext<UnitSystemContextValue>({
  unitSystem: 'metric',
  setUnitSystem: () => {},
})

export function UnitSystemProvider({ children }: { children: ReactNode }) {
  const [unitSystem, setUnitSystemState] = useState<UnitSystem>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'imperial' ? 'imperial' : 'metric'
  })

  function setUnitSystem(v: UnitSystem) {
    setUnitSystemState(v)
    localStorage.setItem(STORAGE_KEY, v)
  }

  return (
    <UnitSystemContext.Provider value={{ unitSystem, setUnitSystem }}>
      {children}
    </UnitSystemContext.Provider>
  )
}

export function useUnitSystem(): UnitSystemContextValue {
  return useContext(UnitSystemContext)
}
