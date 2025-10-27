import { motion } from 'framer-motion'
import { Plus, User, Mail, Shield, Building, Edit, Trash2, Save, X } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { useStore, UserType } from '../store/useStore'
import { useState } from 'react'


export default function Users() {
  const { users, currentUser, addUserToSupabase, updateUserRoleInSupabase } = useStore()
  const [isAddingUser, setIsAddingUser] = useState(false)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    department: '',
    userType: 'security_employee' as UserType
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'interview_manager': return 'warning'
      case 'security_employee': return 'success'
      default: return 'default'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'مدير النظام'
      case 'interview_manager': return 'مدير المقابلات'
      case 'security_employee': return 'موظف أمن'
      default: return role
    }
  }

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.department) {
      setError('يرجى ملء جميع الحقول المطلوبة')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      await addUserToSupabase(newUser)
      setNewUser({ name: '', email: '', department: '', userType: 'security_employee' })
      setIsAddingUser(false)
    } catch (err) {
      setError('فشل في إضافة المستخدم')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: UserType) => {
    setLoading(true)
    try {
      await updateUserRoleInSupabase(userId, newRole)
      setEditingUser(null)
    } catch (err) {
      setError('فشل في تحديث الدور')
    } finally {
      setLoading(false)
    }
  }

  const canManageUsers = currentUser?.userType === 'admin'

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">إدارة المستخدمين</h1>
          <p className="text-muted-foreground">
            إدارة أعضاء الفريق وأدوارهم
          </p>
        </div>
        {canManageUsers && (
          <Button 
            onClick={() => setIsAddingUser(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            إضافة مستخدم
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">إجمالي المستخدمين</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">مديري النظام</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.userType === 'admin').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">مديري المقابلات</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.userType === 'interview_manager').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add User Form */}
      {isAddingUser && (
        <Card>
          <CardHeader>
            <CardTitle>إضافة مستخدم جديد</CardTitle>
            <CardDescription>
              أدخل بيانات المستخدم الجديد
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">الاسم الكامل</label>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="أدخل الاسم الكامل"
                />
              </div>
              <div>
                <label className="text-sm font-medium">البريد الإلكتروني</label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="أدخل البريد الإلكتروني"
                />
              </div>
              <div>
                <label className="text-sm font-medium">القسم</label>
                <Input
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  placeholder="أدخل القسم"
                />
              </div>
              <div>
                <label className="text-sm font-medium">الدور</label>
                <select
                  value={newUser.userType}
                  onChange={(e) => setNewUser({ ...newUser, userType: e.target.value as UserType })}
                  className="w-full p-2 border rounded-md"
                  title="اختر الدور"
                >
                  <option value="security_employee">موظف أمن</option>
                  <option value="interview_manager">مدير مقابلات</option>
                  <option value="admin">مدير النظام</option>
                </select>
              </div>
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            <div className="flex space-x-2">
              <Button onClick={handleAddUser} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'جاري الإضافة...' : 'إضافة المستخدم'}
              </Button>
              <Button variant="outline" onClick={() => setIsAddingUser(false)}>
                <X className="mr-2 h-4 w-4" />
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>أعضاء الفريق</CardTitle>
          <CardDescription>
            جميع المستخدمين في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{user.department}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('en-US')}
                    </p>
                  </div>
                  {editingUser === user.id ? (
                    <div className="flex items-center space-x-2">
                      <select
                        value={user.userType}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value as UserType)}
                        className="p-1 border rounded text-sm"
                        title="تحديث الدور"
                      >
                        <option value="security_employee">موظف أمن</option>
                        <option value="interview_manager">مدير مقابلات</option>
                        <option value="admin">مدير النظام</option>
                      </select>
                      <Button size="sm" variant="outline" onClick={() => setEditingUser(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Badge variant={getRoleColor(user.userType)}>
                        {getRoleLabel(user.userType)}
                      </Badge>
                      {canManageUsers && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingUser(user.id)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
