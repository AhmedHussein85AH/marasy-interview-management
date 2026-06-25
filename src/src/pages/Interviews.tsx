import { motion } from 'framer-motion'
import { Plus, Calendar, Clock, Video, Phone, MapPin } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useStore } from '../store/useStore'

export default function Interviews() {
  const { interviews, candidates, users } = useStore()

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'phone': return <Phone className="h-4 w-4" />
      case 'in-person': return <MapPin className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Interviews</h1>
          <p className="text-muted-foreground">
            Manage and track all your interviews
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Schedule Interview
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Interviews</p>
                <p className="text-2xl font-bold">{interviews.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">
                  {interviews.filter(i => i.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Video className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Scheduled</p>
                <p className="text-2xl font-bold">
                  {interviews.filter(i => i.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Interviews</CardTitle>
          <CardDescription>
            Your scheduled interviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          {interviews.length > 0 ? (
            <div className="space-y-4">
              {interviews.map((interview, index) => {
                const candidate = candidates.find(c => c.id === interview.candidateId)
                const interviewer = users.find(u => u.id === interview.interviewerId)
                
                return (
                  <motion.div
                    key={interview.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        {getInterviewTypeIcon(interview.type)}
                      </div>
                      <div>
                        <p className="font-medium">{candidate?.fullName}</p>
                        <p className="text-sm text-muted-foreground">
                          {candidate?.position} • {interviewer?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{interview.scheduledDate}</p>
                      <p className="text-sm text-muted-foreground">{interview.scheduledTime}</p>
                    </div>
                    <Badge variant={interview.status === 'scheduled' ? 'info' : 'success'}>
                      {interview.status}
                    </Badge>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No interviews scheduled</p>
              <p className="text-sm">Schedule your first interview to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
