import { useState, useEffect } from 'react'
import { SECURITY_COMPANIES, POSITIONS } from '../constants/lists'

const STORAGE_KEY_COMPANIES = 'custom_security_companies'
const STORAGE_KEY_POSITIONS = 'custom_positions'

const loadExtra = (key: string): string[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

const saveExtra = (key: string, items: string[]) => {
  localStorage.setItem(key, JSON.stringify(items))
}

export const useEditableLists = () => {
  const [extraCompanies, setExtraCompanies] = useState<string[]>(() => loadExtra(STORAGE_KEY_COMPANIES))
  const [extraPositions, setExtraPositions] = useState<string[]>(() => loadExtra(STORAGE_KEY_POSITIONS))

  const allCompanies = [...SECURITY_COMPANIES, ...extraCompanies]
  const allPositions = [...POSITIONS, ...extraPositions]

  const addCompany = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed || allCompanies.includes(trimmed)) return
    const updated = [...extraCompanies, trimmed]
    setExtraCompanies(updated)
    saveExtra(STORAGE_KEY_COMPANIES, updated)
  }

  const addPosition = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed || allPositions.includes(trimmed)) return
    const updated = [...extraPositions, trimmed]
    setExtraPositions(updated)
    saveExtra(STORAGE_KEY_POSITIONS, updated)
  }

  return { allCompanies, allPositions, addCompany, addPosition }
}
