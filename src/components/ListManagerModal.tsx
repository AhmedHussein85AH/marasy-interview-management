import React, { useState } from 'react'
import { Plus, Trash2, Edit2, RotateCcw, X, Search, Check, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ListType, useEditableLists } from '../hooks/useEditableLists'

interface Props {
  isOpen: boolean
  onClose: () => void
  listType: ListType
  title?: string
}

export const ListManagerModal: React.FC<Props> = ({ isOpen, onClose, listType, title }) => {
  const { t, i18n } = useTranslation()
  const dir = i18n.language === 'en' ? 'ltr' : 'rtl'
  const { getList, addItem, deleteItem, editItem, resetList } = useEditableLists()

  const [search, setSearch] = useState('')
  const [newItemName, setNewItemName] = useState('')
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  const items = getList(listType)
  const filtered = items.filter(item => item.toLowerCase().includes(search.trim().toLowerCase()))

  const getListTitle = () => {
    if (title) return title
    switch (listType) {
      case 'positions': return t('candidates.columns.position', 'الوظائف')
      case 'companies': return t('candidates.columns.company', 'شركات الأمن')
      case 'governorates': return t('candidates.columns.governorate', 'المحافظات')
      default: return 'القائمة'
    }
  }

  const handleAdd = () => {
    setErrorMsg(null)
    const trimmed = newItemName.trim()
    if (!trimmed) {
      setErrorMsg('يرجى كتابة اسم العنصر')
      return
    }
    if (items.includes(trimmed)) {
      setErrorMsg('هذا العنصر موجود بالفعل')
      return
    }
    addItem(listType, trimmed)
    setNewItemName('')
  }

  const handleStartEdit = (item: string) => {
    setErrorMsg(null)
    setEditingItem(item)
    setEditingValue(item)
  }

  const handleSaveEdit = (oldItem: string) => {
    setErrorMsg(null)
    const trimmed = editingValue.trim()
    if (!trimmed) return
    if (trimmed !== oldItem && items.includes(trimmed)) {
      setErrorMsg('هذا الاسم مستخدم بالفعل')
      return
    }
    editItem(listType, oldItem, trimmed)
    setEditingItem(null)
    setEditingValue('')
  }

  const handleDelete = (item: string) => {
    deleteItem(listType, item)
    setDeleteConfirm(null)
  }

  const handleReset = () => {
    if (window.confirm('هل أنت متأكد من استعادة القائمة الافتراضية للنظام؟')) {
      resetList(listType)
      setDeleteConfirm(null)
      setErrorMsg(null)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '16px',
    }}>
      <div style={{
        backgroundColor: 'hsl(var(--card))',
        color: 'hsl(var(--card-foreground))',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '540px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        border: '1px solid hsl(var(--border))',
        direction: dir,
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid hsl(var(--border))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'hsl(var(--muted)/0.4)',
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚙️</span>
              <span>إدارة {getListTitle()}</span>
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '99px',
                background: 'hsl(var(--primary)/0.15)',
                color: 'hsl(var(--primary))'
              }}>
                {items.length} عنصر
              </span>
            </h3>
            <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', margin: '4px 0 0 0' }}>
              يمكنك إضافة وحذف وتعديل الخيارات التي تظهر في القوائم المنسدلة
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'hsl(var(--muted-foreground))',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Add Input & Search */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid hsl(var(--border))', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Add Item Box */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
              placeholder={`إضافة عنصر جديد إلى ${getListTitle()}...`}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={handleAdd}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
            >
              <Plus size={16} /> إضافة
            </button>
          </div>

          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#ef4444',
              fontSize: '12px',
              fontWeight: 500,
            }}>
              <AlertCircle size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', top: '12px', [dir === 'rtl' ? 'right' : 'left']: '12px', color: 'hsl(var(--muted-foreground))' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث في القائمة..."
              style={{
                width: '100%',
                padding: '8px 12px',
                paddingRight: dir === 'rtl' ? '36px' : '12px',
                paddingLeft: dir === 'ltr' ? '36px' : '12px',
                borderRadius: '8px',
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--muted)/0.3)',
                color: 'hsl(var(--foreground))',
                fontSize: '13px',
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* List of items */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxHeight: '380px',
        }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'hsl(var(--muted-foreground))', fontSize: '14px' }}>
              لا توجد عناصر مطابقة للبحث
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'hsl(var(--muted)/0.4)',
                  border: '1px solid hsl(var(--border)/0.7)',
                  transition: 'background 0.15s ease',
                }}
              >
                {editingItem === item ? (
                  <div style={{ display: 'flex', gap: '6px', flex: 1, alignItems: 'center' }}>
                    <input
                      type="text"
                      value={editingValue}
                      autoFocus
                      onChange={e => setEditingValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveEdit(item)
                        if (e.key === 'Escape') setEditingItem(null)
                      }}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid hsl(var(--primary))',
                        background: 'hsl(var(--background))',
                        color: 'hsl(var(--foreground))',
                        fontSize: '13px',
                        fontFamily: 'inherit',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(item)}
                      style={{ padding: '6px 10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      title="حفظ"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      style={{ padding: '6px 10px', background: '#64748b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      title="إلغاء"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                      {item}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {deleteConfirm === item ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>تأكيد الحذف؟</span>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            style={{
                              padding: '4px 8px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 600,
                            }}
                          >
                            نعم
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(null)}
                            style={{
                              padding: '4px 8px',
                              background: 'hsl(var(--muted))',
                              color: 'hsl(var(--foreground))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            style={{
                              padding: '6px',
                              background: 'transparent',
                              border: 'none',
                              color: 'hsl(var(--muted-foreground))',
                              cursor: 'pointer',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="تعديل"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(item)}
                            style={{
                              padding: '6px',
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              cursor: 'pointer',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            title="حذف"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid hsl(var(--border))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'hsl(var(--muted)/0.2)',
        }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              background: 'transparent',
              color: 'hsl(var(--muted-foreground))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'inherit',
            }}
          >
            <RotateCcw size={13} /> استعادة الافتراضي
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 20px',
              background: 'hsl(var(--primary))',
              color: 'hsl(var(--primary-foreground))',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              fontFamily: 'inherit',
            }}
          >
            تم
          </button>
        </div>
      </div>
    </div>
  )
}
export default ListManagerModal
