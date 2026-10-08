import { useState, useEffect, useCallback } from 'react'
import { SECURITY_COMPANIES, POSITIONS, GOVERNORATES } from '../constants/lists'

export type ListType = 'positions' | 'companies' | 'governorates'

const STORAGE_KEYS = {
  positions: 'app_list_positions_v2',
  companies: 'app_list_companies_v2',
  governorates: 'app_list_governorates_v2',
  // Legacy keys for migration
  legacyPositions: 'custom_positions',
  legacyCompanies: 'custom_security_companies',
}

const loadList = (type: ListType): string[] => {
  try {
    const key = STORAGE_KEYS[type]
    const stored = localStorage.getItem(key)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }

    // Migration from v1
    if (type === 'positions') {
      const legacy = localStorage.getItem(STORAGE_KEYS.legacyPositions)
      if (legacy) {
        const extra = JSON.parse(legacy)
        const combined = Array.from(new Set([...POSITIONS, ...(Array.isArray(extra) ? extra : [])]))
        localStorage.setItem(key, JSON.stringify(combined))
        return combined
      }
      return [...POSITIONS]
    }

    if (type === 'companies') {
      const legacy = localStorage.getItem(STORAGE_KEYS.legacyCompanies)
      if (legacy) {
        const extra = JSON.parse(legacy)
        const combined = Array.from(new Set([...SECURITY_COMPANIES, ...(Array.isArray(extra) ? extra : [])]))
        localStorage.setItem(key, JSON.stringify(combined))
        return combined
      }
      return [...SECURITY_COMPANIES]
    }

    if (type === 'governorates') {
      return [...GOVERNORATES]
    }

    return []
  } catch (err) {
    console.error(`Error loading list ${type}:`, err)
    if (type === 'positions') return [...POSITIONS]
    if (type === 'companies') return [...SECURITY_COMPANIES]
    if (type === 'governorates') return [...GOVERNORATES]
    return []
  }
}

const saveList = (type: ListType, items: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(items))
    window.dispatchEvent(new CustomEvent('app-lists-changed', { detail: { type, items } }))
  } catch (err) {
    console.error(`Error saving list ${type}:`, err)
  }
}

export const useEditableLists = () => {
  const [positions, setPositions] = useState<string[]>(() => loadList('positions'))
  const [companies, setCompanies] = useState<string[]>(() => loadList('companies'))
  const [governorates, setGovernorates] = useState<string[]>(() => loadList('governorates'))

  const refreshLists = useCallback(() => {
    setPositions(loadList('positions'))
    setCompanies(loadList('companies'))
    setGovernorates(loadList('governorates'))
  }, [])

  useEffect(() => {
    const handleListsChanged = () => {
      refreshLists()
    }
    window.addEventListener('app-lists-changed', handleListsChanged)
    window.addEventListener('storage', handleListsChanged)
    return () => {
      window.removeEventListener('app-lists-changed', handleListsChanged)
      window.removeEventListener('storage', handleListsChanged)
    }
  }, [refreshLists])

  // ── Generic List Methods ─────────────────────────────────
  const getList = useCallback((type: ListType): string[] => {
    if (type === 'positions') return positions
    if (type === 'companies') return companies
    if (type === 'governorates') return governorates
    return []
  }, [positions, companies, governorates])

  const addItem = useCallback((type: ListType, name: string): boolean => {
    const trimmed = name.trim()
    if (!trimmed) return false
    const current = loadList(type)
    if (current.includes(trimmed)) return false
    const updated = [...current, trimmed]
    saveList(type, updated)
    refreshLists()
    return true
  }, [refreshLists])

  const deleteItem = useCallback((type: ListType, name: string): boolean => {
    const current = loadList(type)
    const updated = current.filter(item => item !== name)
    saveList(type, updated)
    refreshLists()
    return true
  }, [refreshLists])

  const editItem = useCallback((type: ListType, oldName: string, newName: string): boolean => {
    const trimmed = newName.trim()
    if (!trimmed || trimmed === oldName) return false
    const current = loadList(type)
    const updated = current.map(item => item === oldName ? trimmed : item)
    saveList(type, updated)
    refreshLists()
    return true
  }, [refreshLists])

  const resetList = useCallback((type: ListType) => {
    let defaults: string[] = []
    if (type === 'positions') defaults = [...POSITIONS]
    if (type === 'companies') defaults = [...SECURITY_COMPANIES]
    if (type === 'governorates') defaults = [...GOVERNORATES]
    saveList(type, defaults)
    refreshLists()
  }, [refreshLists])

  // ── Specific Helper Methods ──────────────────────────────
  const addPosition = useCallback((name: string) => addItem('positions', name), [addItem])
  const deletePosition = useCallback((name: string) => deleteItem('positions', name), [deleteItem])
  const editPosition = useCallback((oldName: string, newName: string) => editItem('positions', oldName, newName), [editItem])
  const resetPositions = useCallback(() => resetList('positions'), [resetList])

  const addCompany = useCallback((name: string) => addItem('companies', name), [addItem])
  const deleteCompany = useCallback((name: string) => deleteItem('companies', name), [deleteItem])
  const editCompany = useCallback((oldName: string, newName: string) => editItem('companies', oldName, newName), [editItem])
  const resetCompanies = useCallback(() => resetList('companies'), [resetList])

  const addGovernorate = useCallback((name: string) => addItem('governorates', name), [addItem])
  const deleteGovernorate = useCallback((name: string) => deleteItem('governorates', name), [deleteItem])
  const editGovernorate = useCallback((oldName: string, newName: string) => editItem('governorates', oldName, newName), [editItem])
  const resetGovernorates = useCallback(() => resetList('governorates'), [resetList])

  return {
    allPositions: positions,
    allCompanies: companies,
    allGovernorates: governorates,
    positions,
    companies,
    governorates,
    getList,
    addItem,
    deleteItem,
    editItem,
    resetList,
    addPosition,
    deletePosition,
    editPosition,
    resetPositions,
    addCompany,
    deleteCompany,
    editCompany,
    resetCompanies,
    addGovernorate,
    deleteGovernorate,
    editGovernorate,
    resetGovernorates,
    refreshLists,
  }
}
