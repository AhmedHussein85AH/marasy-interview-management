import { motion } from 'framer-motion'
import { Settings as SettingsIcon, User, Bell, Shield, Palette } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { useStore } from '../store/useStore'

export default function Settings() {
  const { darkMode, toggleDarkMode } = useStore()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application preferences and configuration
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>
              Customize the look and feel of your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Button
                variant={darkMode ? 'default' : 'outline'}
                onClick={toggleDarkMode}
              >
                {darkMode ? 'Dark' : 'Light'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <CardTitle>Account</CardTitle>
            </div>
            <CardDescription>
              Manage your account settings and profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="font-medium">Profile Information</p>
              <p className="text-sm text-muted-foreground">
                Update your personal details and contact information
              </p>
              <Button variant="outline" className="mt-2">
                Edit Profile
              </Button>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Password & Security</p>
              <p className="text-sm text-muted-foreground">
                Change your password and security settings
              </p>
              <Button variant="outline" className="mt-2">
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive updates via email
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get instant updates in your browser
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <SettingsIcon className="h-5 w-5" />
              <CardTitle>System</CardTitle>
            </div>
            <CardDescription>
              Application settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="font-medium">Data Management</p>
              <p className="text-sm text-muted-foreground">
                Export, import, or clear your data
              </p>
              <div className="flex space-x-2 mt-2">
                <Button variant="outline" size="sm">
                  Export Data
                </Button>
                <Button variant="outline" size="sm">
                  Import Data
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Reset Settings</p>
              <p className="text-sm text-muted-foreground">
                Restore all settings to default values
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Reset All Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Version Info */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p className="font-medium">InterviewPro v2.0.0</p>
            <p className="text-sm">Enhanced Interview Management System</p>
            <p className="text-xs mt-2">
              Built with React, TypeScript, and modern web technologies
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
