import React from 'react'

export default function SimpleInterviews() {
  const interviews = [
    { id: 1, candidate: 'John Doe', position: 'Software Engineer', date: '2024-01-15', time: '10:00 AM', status: 'Scheduled' },
    { id: 2, candidate: 'Jane Smith', position: 'UI Designer', date: '2024-01-15', time: '2:00 PM', status: 'Scheduled' },
    { id: 3, candidate: 'Mike Johnson', position: 'Product Manager', date: '2024-01-16', time: '11:00 AM', status: 'Completed' },
    { id: 4, candidate: 'Sarah Wilson', position: 'Data Analyst', date: '2024-01-17', time: '3:00 PM', status: 'Scheduled' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-100 text-blue-800'
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'Cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Interviews</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Schedule Interview
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {interviews.map((interview) => (
          <div key={interview.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">{interview.candidate}</h3>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(interview.status)}`}>
                {interview.status}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="font-medium mr-2">Position:</span>
                <span>{interview.position}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">Date:</span>
                <span>{interview.date}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">Time:</span>
                <span>{interview.time}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600">
                View Details
              </button>
              <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-300">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
