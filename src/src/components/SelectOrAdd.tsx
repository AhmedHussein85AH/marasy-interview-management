import React, { useState } from 'react'

interface Props {
  value: string
  options: string[]
  onChange: (val: string) => void
  onAddNew: (val: string) => void
  placeholder?: string
}

const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', fontFamily: 'inherit', fontSize: '14px' } as const

const SelectOrAdd: React.FC<Props> = ({ value, options, onChange, onAddNew, placeholder }) => {
  const [adding, setAdding] = useState(false)
  const [newValue, setNewValue] = useState('')

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === '__add__') {
      setAdding(true)
      setNewValue('')
    } else {
      onChange(e.target.value)
    }
  }

  const handleConfirm = () => {
    const trimmed = newValue.trim()
    if (!trimmed) return
    onAddNew(trimmed)
    onChange(trimmed)
    setAdding(false)
    setNewValue('')
  }

  const handleCancel = () => {
    setAdding(false)
    setNewValue('')
  }

  if (adding) {
    return (
      <div style={{ display: 'flex', gap: '6px' }}>
        <input
          autoFocus
          type="text"
          value={newValue}
          onChange={e => setNewValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleConfirm(); if (e.key === 'Escape') handleCancel() }}
          placeholder={placeholder || 'اكتب القيمة الجديدة...'}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          type="button"
          onClick={handleConfirm}
          style={{ padding: '10px 14px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}
        >
          ✓ إضافة
        </button>
        <button
          type="button"
          onClick={handleCancel}
          style={{ padding: '10px 10px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <select value={value} onChange={handleSelect} style={inputStyle}>
      <option value="">{placeholder || 'اختر...'}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
      <option value="__add__" style={{ color: '#3498db', fontWeight: 'bold' }}>+ إضافة جديد...</option>
    </select>
  )
}

export default SelectOrAdd
