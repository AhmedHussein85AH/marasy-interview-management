import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useNavigate } from 'react-router-dom'

export default function InterviewForm() {
  const navigate = useNavigate()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/interviews')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold gradient-text">Schedule Interview</h1>
          <p className="text-muted-foreground">
            Create a new interview schedule
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Interview Form</CardTitle>
          <CardDescription>
            This feature is coming soon!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The interview scheduling form will be implemented here with features like:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
            <li>Candidate selection</li>
            <li>Interviewer assignment</li>
            <li>Date and time scheduling</li>
            <li>Interview type selection</li>
            <li>Calendar integration</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
