export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          user_type: 'security_employee' | 'interview_manager' | 'admin'
          department: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          user_type: 'security_employee' | 'interview_manager' | 'admin'
          department: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          user_type?: 'security_employee' | 'interview_manager' | 'admin'
          department?: string
          created_at?: string
        }
      }
      candidates: {
        Row: {
          id: string
          name: string
          national_id: string
          birth_date: string
          governorate: string
          qualification: string
          marital_status: 'أعزب' | 'متزوج' | 'مطلق' | 'أرمل'
          security_company: string
          offer_date: string
          offer_result: 'مقبول' | 'مرفوض' | 'مستبعد' | 'في انتظار'
          status: 'جديد' | 'قيد المراجعة' | 'تم التوظيف' | 'مرفوض'
          created_by: string
          created_at: string
          updated_at: string
          is_rejected_before: boolean
          previous_rejection_date: string | null
        }
        Insert: {
          id?: string
          name: string
          national_id: string
          birth_date: string
          governorate: string
          qualification: string
          marital_status: 'أعزب' | 'متزوج' | 'مطلق' | 'أرمل'
          security_company: string
          offer_date: string
          offer_result?: 'مقبول' | 'مرفوض' | 'مستبعد' | 'في انتظار'
          status?: 'جديد' | 'قيد المراجعة' | 'تم التوظيف' | 'مرفوض'
          created_by: string
          created_at?: string
          updated_at?: string
          is_rejected_before?: boolean
          previous_rejection_date?: string | null
        }
        Update: {
          id?: string
          name?: string
          national_id?: string
          birth_date?: string
          governorate?: string
          qualification?: string
          marital_status?: 'أعزب' | 'متزوج' | 'مطلق' | 'أرمل'
          security_company?: string
          offer_date?: string
          offer_result?: 'مقبول' | 'مرفوض' | 'مستبعد' | 'في انتظار'
          status?: 'جديد' | 'قيد المراجعة' | 'تم التوظيف' | 'مرفوض'
          created_by?: string
          created_at?: string
          updated_at?: string
          is_rejected_before?: boolean
          previous_rejection_date?: string | null
        }
      }
      interviews: {
        Row: {
          id: string
          candidate_id: string
          candidate_name: string
          position: string
          date: string
          time: string
          status: 'مجدولة' | 'مكتملة' | 'ملغاة'
          notes: string
          interviewer: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          candidate_name: string
          position: string
          date: string
          time: string
          status?: 'مجدولة' | 'مكتملة' | 'ملغاة'
          notes?: string
          interviewer: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          candidate_id?: string
          candidate_name?: string
          position?: string
          date?: string
          time?: string
          status?: 'مجدولة' | 'مكتملة' | 'ملغاة'
          notes?: string
          interviewer?: string
          created_at?: string
          updated_at?: string
        }
      }
      saved_candidates: {
        Row: {
          id: string
          name: string
          national_id: string
          birth_date: string
          governorate: string
          qualification: string
          marital_status: 'أعزب' | 'متزوج' | 'مطلق' | 'أرمل'
          security_company: string
          offer_date: string
          final_result: 'مقبول' | 'مرفوض' | 'مستبعد'
          decision_date: string
          decision_by: string
          notes: string | null
          is_rejected_before: boolean
          previous_rejection_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          national_id: string
          birth_date: string
          governorate: string
          qualification: string
          marital_status: 'أعزب' | 'متزوج' | 'مطلق' | 'أرمل'
          security_company: string
          offer_date: string
          final_result: 'مقبول' | 'مرفوض' | 'مستبعد'
          decision_date: string
          decision_by: string
          notes?: string | null
          is_rejected_before?: boolean
          previous_rejection_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          national_id?: string
          birth_date?: string
          governorate?: string
          qualification?: string
          marital_status?: 'أعزب' | 'متزوج' | 'مطلق' | 'أرمل'
          security_company?: string
          offer_date?: string
          final_result?: 'مقبول' | 'مرفوض' | 'مستبعد'
          decision_date?: string
          decision_by?: string
          notes?: string | null
          is_rejected_before?: boolean
          previous_rejection_date?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          type: 'rejected_before' | 'new_candidate' | 'decision_made'
          title: string
          message: string
          candidate_id: string
          candidate_name: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          type: 'rejected_before' | 'new_candidate' | 'decision_made'
          title: string
          message: string
          candidate_id: string
          candidate_name: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'rejected_before' | 'new_candidate' | 'decision_made'
          title?: string
          message?: string
          candidate_id?: string
          candidate_name?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
  }
}
