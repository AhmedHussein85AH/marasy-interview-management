import React from 'react'

export default function SimpleAnalytics() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics & Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Interview Success Rate</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">78%</div>
            <p className="text-gray-600">This month</p>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Average Time to Hire</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">12</div>
            <p className="text-gray-600">Days</p>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Total Applications</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">156</div>
            <p className="text-gray-600">This quarter</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Top Positions</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Software Engineer</span>
              <span className="font-semibold">25</span>
            </div>
            <div className="flex justify-between items-center">
              <span>UI/UX Designer</span>
              <span className="font-semibold">18</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Product Manager</span>
              <span className="font-semibold">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Data Analyst</span>
              <span className="font-semibold">8</span>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Hires</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>John Smith</span>
              <span className="text-green-600 font-semibold">Hired</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Sarah Johnson</span>
              <span className="text-green-600 font-semibold">Hired</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Mike Davis</span>
              <span className="text-green-600 font-semibold">Hired</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Lisa Brown</span>
              <span className="text-green-600 font-semibold">Hired</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
