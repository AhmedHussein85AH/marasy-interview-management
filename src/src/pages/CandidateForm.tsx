import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, X } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useStore } from '../store/useStore'

export default function CandidateForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { candidates, addCandidate, updateCandidate } = useStore()
  const isEdit = id && id !== 'new'
  
  const existingCandidate = isEdit ? candidates.find(c => c.id === id) : null
  
  const [formData, setFormData] = useState({
    fullName: existingCandidate?.fullName || '',
    email: existingCandidate?.email || '',
    phone: existingCandidate?.phone || '',
    position: existingCandidate?.position || '',
    department: existingCandidate?.department || '',
    experience: existingCandidate?.experience || 0,
    skills: existingCandidate?.skills?.join(', ') || '',
    status: existingCandidate?.status || 'applied' as const,
    notes: existingCandidate?.notes || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const candidateData = {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
    }

    if (isEdit && existingCandidate) {
      updateCandidate(id, candidateData)
    } else {
      addCandidate(candidateData)
    }
    
    navigate('/candidates')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/candidates')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold gradient-text">
            {isEdit ? 'Edit Candidate' : 'Add New Candidate'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update candidate information' : 'Add a new candidate to the system'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Personal details of the candidate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
              <CardDescription>
                Position and department details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Position</label>
                <Input
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Enter position"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Department</label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Enter department"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Experience (years)</label>
                <Input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                  placeholder="Enter years of experience"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills and Status */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Status</CardTitle>
              <CardDescription>
                Technical skills and current status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Skills</label>
                <Input
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="Enter skills separated by commas"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <div className="flex gap-2 flex-wrap">
                  {['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'].map((status) => (
                    <Badge
                      key={status}
                      variant={formData.status === status ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setFormData({ ...formData, status: status as any })}
                    >
                      {status}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
              <CardDescription>
                Any additional information about the candidate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Enter any additional notes..."
                className="w-full min-h-[100px] p-3 border rounded-md resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/candidates')}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            {isEdit ? 'Update Candidate' : 'Add Candidate'}
          </Button>
        </div>
      </form>
    </div>
  )
}
