import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../integrations/supabase/client'
import { useStore, Candidate, Interview, SavedCandidate, Notification, LoginLog, User } from '../store/useStore'

export const queryKeys = {
  candidates: ['candidates'] as const,
  interviews: ['interviews'] as const,
  savedCandidates: ['saved-candidates'] as const,
  notifications: ['notifications'] as const,
  users: ['users'] as const,
  loginLogs: ['login-logs'] as const,
  allData: ['all-data'] as const,
}

const fetchAll = async (table: string) => {
  let allData: any[] = []
  let from = 0
  const limit = 1000
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)

    if (error) throw error

    if (data && data.length > 0) {
      allData = [...allData, ...data]
      from += limit
      if (data.length < limit) hasMore = false
    } else {
      hasMore = false
    }
  }
  return allData
}

export const useCandidatesQuery = () =>
  useQuery({
    queryKey: queryKeys.candidates,
    queryFn: async () => {
      const data = await fetchAll('candidates')
      return (data || []).map((c: any): Candidate => ({
        id: c.id, name: c.name, nationalId: c.national_id,
        birthDate: c.birth_date, governorate: c.governorate,
        qualification: c.qualification, maritalStatus: c.marital_status,
        securityCompany: c.security_company, position: c.position,
        phone: c.phone, offerDate: c.offer_date,
        offerResult: c.offer_result, status: c.status,
        createdBy: c.created_by, notes: c.notes,
        workShift: c.work_shift, isRejectedBefore: c.is_rejected_before,
        previousRejectionDate: c.previous_rejection_date,
        createdAt: c.created_at, updatedAt: c.updated_at,
      }))
    },
    staleTime: 5 * 60 * 1000,
  })

export const useInterviewsQuery = () =>
  useQuery({
    queryKey: queryKeys.interviews,
    queryFn: async () => {
      const data = await fetchAll('interviews')
      return (data || []).map((i: any): Interview => ({
        id: i.id, candidateId: i.candidate_id,
        candidateName: i.candidate_name, position: i.position,
        date: i.date, time: i.time, status: i.status,
        notes: i.notes, interviewer: i.interviewer,
        createdAt: i.created_at, updatedAt: i.updated_at,
      }))
    },
    staleTime: 5 * 60 * 1000,
  })

export const useSavedCandidatesQuery = () =>
  useQuery({
    queryKey: queryKeys.savedCandidates,
    queryFn: async () => {
      const data = await fetchAll('saved_candidates')
      return (data || []).map((s: any): SavedCandidate => ({
        id: s.id, name: s.name, nationalId: s.national_id,
        birthDate: s.birth_date, governorate: s.governorate,
        qualification: s.qualification, maritalStatus: s.marital_status,
        securityCompany: s.security_company, position: s.position,
        offerDate: s.offer_date, finalResult: s.final_result,
        decisionDate: s.decision_date, decisionBy: s.decision_by,
        notes: s.notes, workShift: s.work_shift,
        exclusionReason: s.exclusion_reason,
        resignationReason: s.resignation_reason,
        isRejectedBefore: s.is_rejected_before,
        previousRejectionDate: s.previous_rejection_date,
        createdAt: s.created_at,
      }))
    },
    staleTime: 5 * 60 * 1000,
  })

export const useNotificationsQuery = () =>
  useQuery({
    queryKey: queryKeys.notifications,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications').select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []) as Notification[]
    },
    staleTime: 5 * 60 * 1000,
  })

export const useUsersQuery = () =>
  useQuery({
    queryKey: queryKeys.users,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, user_type, department, created_at, is_active, permissions')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data || []).map((u: any): User => ({
        id: u.id, name: u.name, email: u.email,
        userType: u.user_type, department: u.department,
        createdAt: u.created_at, isActive: u.is_active ?? true,
        permissions: u.permissions ? (u.permissions as any) : undefined,
      }))
    },
    staleTime: 5 * 60 * 1000,
  })

export const useLoginLogsQuery = () =>
  useQuery({
    queryKey: queryKeys.loginLogs,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('login_logs').select('*')
        .order('login_time', { ascending: false })
        .limit(1000)
      if (error) throw error
      return (data || []).map((log: any): LoginLog => ({
        id: log.id, userId: log.user_id, userEmail: log.user_email,
        userName: log.user_name, loginTime: log.login_time,
        logoutTime: log.logout_time, ipAddress: log.ip_address,
        userAgent: log.user_agent, deviceType: log.device_type,
        browser: log.browser, os: log.os, country: log.country,
        city: log.city, latitude: log.latitude, longitude: log.longitude,
        isActive: log.is_active, sessionId: log.session_id,
        createdAt: log.created_at,
      }))
    },
    staleTime: 2 * 60 * 1000,
  })

export const useInvalidateAll = () => {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['candidates'] })
    queryClient.invalidateQueries({ queryKey: ['interviews'] })
    queryClient.invalidateQueries({ queryKey: ['saved-candidates'] })
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }
}

export const useInvalidateLoginLogs = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.loginLogs })
}
