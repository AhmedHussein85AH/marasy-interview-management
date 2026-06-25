import React from 'react'

export default function SimpleDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-100 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">Total Candidates</h3>
          <p className="text-3xl font-bold text-blue-900">25</p>
        </div>
        
        <div className="bg-green-100 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">Interviews Today</h3>
          <p className="text-3xl font-bold text-green-900">3</p>
        </div>
        
        <div className="bg-yellow-100 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800">Pending Reviews</h3>
          <p className="text-3xl font-bold text-yellow-900">7</p>
        </div>
        
        <div className="bg-purple-100 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800">Hired This Month</h3>
          <p className="text-3xl font-bold text-purple-900">5</p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span>John Doe - Interview scheduled</span>
            <span className="text-gray-500">2 hours ago</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span>Jane Smith - Application received</span>
            <span className="text-gray-500">4 hours ago</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span>Mike Johnson - Interview completed</span>
            <span className="text-gray-500">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  )
}
