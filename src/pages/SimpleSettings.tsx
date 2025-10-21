import React from 'react'

export default function SimpleSettings() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <div className="max-w-2xl space-y-6">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" defaultValue="John Doe" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" defaultValue="john@company.com" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input type="text" defaultValue="Human Resources" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Save Changes
            </button>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Email notifications</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
            </div>
            <div className="flex justify-between items-center">
              <span>Interview reminders</span>
              <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 rounded" />
            </div>
            <div className="flex justify-between items-center">
              <span>Application updates</span>
              <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Appearance</h3>
          <div className="flex items-center justify-between">
            <span>Dark mode</span>
            <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Account Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600">
              Reset Password
            </button>
            <button className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
