import React, { useState } from 'react'
import { Plus, Settings2, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { ListType, useEditableLists } from '../hooks/useEditableLists'
import ListManagerModal from './ListManagerModal'

interface Props {
  value: string
  options: string[]
  onChange: (val: string) => void
  onAddNew?: (val: string) => void
  onDelete?: (val: string) => void
  listType?: ListType
  title?: string
  placeholder?: string
  disabled?: boolean
  style?: React.CSSProperties
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontFamily: 'inherit',
  fontSize: '14px',
  background: 'hsl(var(--background))',
  color: 'hsl(var(--foreground))',
  outline: 'none',
  boxSizing: 'border-box',
}

const SelectOrAdd: React.FC<Props> = ({
  value,
  options,
  onChange,
  onAddNew,
  onDelete,
  listType,
  title,
  placeholder,
  disabled = false,
  style,
}) => {
  const { currentUser } = useStore()
  const { addItem, deleteItem } = useEditableLists()
  const isAdmin = currentUser?.userType === 'admin'

  const [adding, setAdding] = useState(false)
  const [newValue, setNewValue] = useState('')
  const [showManager, setShowManager] = useState(false)

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value
    if (selected === '__add__') {
      setAdding(true)
      setNewValue('')
    } else if (selected === '__manage__') {
      setShowManager(true)
    } else {
      onChange(selected)
    }
  }

  const handleConfirm = () => {
    const trimmed = newValue.trim()
    if (!trimmed) return
    if (onAddNew) {
      onAddNew(trimmed)
    } else if (listType) {
      addItem(listType, trimmed)
    }
    onChange(trimmed)
    setAdding(false)
    setNewValue('')
  }

  const handleCancel = () => {
    setAdding(false)
    setNewValue('')
  }

  const handleDeleteCurrent = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (!value) return
    if (window.confirm(`هل أنت متأكد من حذف "${value}" من القائمة؟`)) {
      if (onDelete) {
        onDelete(value)
      } else if (listType) {
        deleteItem(listType, value)
      }
      onChange('')
    }
  }

  if (adding) {
    return (
      <div style={{ display: 'flex', gap: '6px', width: '100%', alignItems: 'center', ...style }}>
        <input
          autoFocus
          type="text"
          value={newValue}
          onChange={e => setNewValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleConfirm()
            }
            if (e.key === 'Escape') handleCancel()
          }}
          placeholder={placeholder || 'اكتب القيمة الجديدة...'}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          type="button"
          onClick={handleConfirm}
          style={{
            padding: '10px 14px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '13px',
            whiteSpace: 'nowrap',
            fontFamily: 'inherit',
          }}
        >
          ✓ إضافة
        </button>
        <button
          type="button"
          onClick={handleCancel}
          style={{
            padding: '10px 12px',
            background: '#94a3b8',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: 'inherit',
          }}
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '6px', width: '100%', alignItems: 'center', ...style }}>
      <select
        value={value}
        onChange={handleSelect}
        disabled={disabled}
        className="form-input"
        style={{
          ...inputStyle,
          flex: 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <option value="">{placeholder || 'اختر...'}</option>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
        {onAddNew || listType ? (
          <option value="__add__" style={{ color: '#2563eb', fontWeight: 'bold' }}>
            + إضافة جديد...
          </option>
        ) : null}
        {isAdmin && listType ? (
          <option value="__manage__" style={{ color: '#8b5cf6', fontWeight: 'bold' }}>
            ⚙️ إدارة القائمة بالكامل (حذف / تعديل)...
          </option>
        ) : null}
      </select>

      {/* Admin Quick Action Buttons */}
      {isAdmin && (
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          {listType && (
            <button
              type="button"
              onClick={() => setShowManager(true)}
              title="إدارة القائمة وحذف العناصر"
              style={{
                padding: '9px 10px',
                background: 'hsl(var(--muted)/0.8)',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s ease',
              }}
            >
              <Settings2 size={15} />
            </button>
          )}

          {value && (onDelete || listType) && (
            <button
              type="button"
              onClick={handleDeleteCurrent}
              title={`حذف "${value}" من القائمة`}
              style={{
                padding: '9px 10px',
                background: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s ease',
              }}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}

      {/* List Manager Modal */}
      {listType && (
        <ListManagerModal
          isOpen={showManager}
          onClose={() => setShowManager(false)}
          listType={listType}
          title={title}
        />
      )}
    </div>
  )
}

export default SelectOrAdd
