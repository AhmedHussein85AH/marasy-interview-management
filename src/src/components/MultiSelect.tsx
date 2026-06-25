import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, X } from 'lucide-react'

interface MultiSelectProps {
  options: string[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder: string
}

const MultiSelect: React.FC<MultiSelectProps> = ({ options, selectedValues, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter(v => v !== option))
    } else {
      onChange([...selectedValues, option])
    }
  }

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '250px' }} className="print-hidden">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '10px 14px',
          border: '1px solid #ddd',
          borderRadius: '5px',
          backgroundColor: 'white',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '42px',
          color: selectedValues.length > 0 ? '#2c3e50' : '#7f8c8d',
          fontSize: '13.5px'
        }}
      >
        <span style={{ 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          paddingRight: '10px'
        }}>
          {selectedValues.length === 0 
            ? placeholder 
            : selectedValues.length === 1 
              ? selectedValues[0] 
              : `${selectedValues.length} محدد`}
        </span>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {selectedValues.length > 0 && (
            <button
              onClick={clearSelection}
              title="إلغاء التحديد"
              style={{
                background: 'none', border: 'none', padding: '0',
                cursor: 'pointer', color: '#e74c3c', display: 'flex', alignItems: 'center'
              }}
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown size={16} color="#95a5a6" />
        </div>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '5px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          maxHeight: '250px',
          overflowY: 'auto',
          zIndex: 50,
          direction: 'rtl'
        }}>
          {options.length === 0 ? (
            <div style={{ padding: '10px', textAlign: 'center', color: '#95a5a6', fontSize: '13px' }}>
              لا توجد خيارات
            </div>
          ) : (
            options.map(option => {
              const isSelected = selectedValues.includes(option)
              return (
                <div
                  key={option}
                  onClick={() => toggleOption(option)}
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    fontSize: '13.5px',
                    color: isSelected ? 'hsl(217 91% 48%)' : '#2c3e50',
                    backgroundColor: isSelected ? 'hsl(217 91% 95%)' : 'transparent',
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = '#f8f9fa'
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <div style={{
                    width: '18px', height: '18px',
                    border: `1.5px solid ${isSelected ? 'hsl(217 91% 48%)' : '#cbd5e1'}`,
                    borderRadius: '4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isSelected ? 'hsl(217 91% 48%)' : 'white',
                    flexShrink: 0
                  }}>
                    {isSelected && <Check size={12} color="white" strokeWidth={3} />}
                  </div>
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {option}
                  </span>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default MultiSelect
