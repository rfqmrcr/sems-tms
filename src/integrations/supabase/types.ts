export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          attendance_date: string
          created_at: string
          id: string
          is_present: boolean
          registration_id: string
          signature_data: string | null
          trainee_id: string
        }
        Insert: {
          attendance_date: string
          created_at?: string
          id?: string
          is_present?: boolean
          registration_id: string
          signature_data?: string | null
          trainee_id: string
        }
        Update: {
          attendance_date?: string
          created_at?: string
          id?: string
          is_present?: boolean
          registration_id?: string
          signature_data?: string | null
          trainee_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "trainees"
            referencedColumns: ["id"]
          },
        ]
      }
      course_run_schedules: {
        Row: {
          course_run_id: string
          created_at: string
          end_time: string
          id: string
          schedule_date: string
          start_time: string
          updated_at: string
        }
        Insert: {
          course_run_id: string
          created_at?: string
          end_time?: string
          id?: string
          schedule_date: string
          start_time?: string
          updated_at?: string
        }
        Update: {
          course_run_id?: string
          created_at?: string
          end_time?: string
          id?: string
          schedule_date?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_run_schedules_course_run_id_fkey"
            columns: ["course_run_id"]
            isOneToOne: false
            referencedRelation: "course_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      course_run_trainers: {
        Row: {
          course_run_id: string
          created_at: string
          id: string
          trainer_id: string
        }
        Insert: {
          course_run_id: string
          created_at?: string
          id?: string
          trainer_id: string
        }
        Update: {
          course_run_id?: string
          created_at?: string
          id?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_run_trainers_course_run_id_fkey"
            columns: ["course_run_id"]
            isOneToOne: false
            referencedRelation: "course_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_run_trainers_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      course_runs: {
        Row: {
          capacity: number | null
          course_id: string
          created_at: string
          end_date: string | null
          end_time: string
          id: string
          location: string | null
          price: number | null
          registration_close_days: number | null
          registration_url: string | null
          start_date: string | null
          start_time: string
          title: string | null
          trainer_id: string | null
          visibility: string
        }
        Insert: {
          capacity?: number | null
          course_id: string
          created_at?: string
          end_date?: string | null
          end_time?: string
          id?: string
          location?: string | null
          price?: number | null
          registration_close_days?: number | null
          registration_url?: string | null
          start_date?: string | null
          start_time?: string
          title?: string | null
          trainer_id?: string | null
          visibility?: string
        }
        Update: {
          capacity?: number | null
          course_id?: string
          created_at?: string
          end_date?: string | null
          end_time?: string
          id?: string
          location?: string | null
          price?: number | null
          registration_close_days?: number | null
          registration_url?: string | null
          start_date?: string | null
          start_time?: string
          title?: string | null
          trainer_id?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_runs_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_runs_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          course_agenda: string | null
          course_content_url: string | null
          created_at: string
          description: string | null
          hrdc_program_code: string | null
          id: string
          price: number | null
          registration_url: string | null
          title: string
        }
        Insert: {
          category?: string | null
          course_agenda?: string | null
          course_content_url?: string | null
          created_at?: string
          description?: string | null
          hrdc_program_code?: string | null
          id?: string
          price?: number | null
          registration_url?: string | null
          title: string
        }
        Update: {
          category?: string | null
          course_agenda?: string | null
          course_content_url?: string | null
          created_at?: string
          description?: string | null
          hrdc_program_code?: string | null
          id?: string
          price?: number | null
          registration_url?: string | null
          title?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          attachments: Json | null
          course_run_id: string | null
          created_at: string
          email_type: string
          error_message: string | null
          id: string
          metadata: Json | null
          recipient_email: string
          recipient_name: string | null
          registration_id: string | null
          sent_at: string
          status: string
          subject: string
          template_used: string | null
          trainee_id: string | null
        }
        Insert: {
          attachments?: Json | null
          course_run_id?: string | null
          created_at?: string
          email_type: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email: string
          recipient_name?: string | null
          registration_id?: string | null
          sent_at?: string
          status?: string
          subject: string
          template_used?: string | null
          trainee_id?: string | null
        }
        Update: {
          attachments?: Json | null
          course_run_id?: string | null
          created_at?: string
          email_type?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string
          recipient_name?: string | null
          registration_id?: string | null
          sent_at?: string
          status?: string
          subject?: string
          template_used?: string | null
          trainee_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_course_run_id_fkey"
            columns: ["course_run_id"]
            isOneToOne: false
            referencedRelation: "course_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "trainees"
            referencedColumns: ["id"]
          },
        ]
      }
      email_reminders: {
        Row: {
          course_run_id: string
          created_at: string
          id: string
          reminder_type: string
          sent_at: string
          trainee_id: string
        }
        Insert: {
          course_run_id: string
          created_at?: string
          id?: string
          reminder_type?: string
          sent_at?: string
          trainee_id: string
        }
        Update: {
          course_run_id?: string
          created_at?: string
          id?: string
          reminder_type?: string
          sent_at?: string
          trainee_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_email_reminders_course_run"
            columns: ["course_run_id"]
            isOneToOne: false
            referencedRelation: "course_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_email_reminders_trainee"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "trainees"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          attachment_urls: string[] | null
          cc_emails: string[] | null
          course_id: string | null
          created_at: string
          html_content: string
          id: string
          include_course_agenda: boolean
          include_course_content: boolean
          include_quotation: boolean
          include_trainer_profile: boolean
          is_active: boolean
          name: string
          registration_type: string | null
          subject: string
          trigger_point: string
          updated_at: string
        }
        Insert: {
          attachment_urls?: string[] | null
          cc_emails?: string[] | null
          course_id?: string | null
          created_at?: string
          html_content: string
          id?: string
          include_course_agenda?: boolean
          include_course_content?: boolean
          include_quotation?: boolean
          include_trainer_profile?: boolean
          is_active?: boolean
          name: string
          registration_type?: string | null
          subject: string
          trigger_point?: string
          updated_at?: string
        }
        Update: {
          attachment_urls?: string[] | null
          cc_emails?: string[] | null
          course_id?: string | null
          created_at?: string
          html_content?: string
          id?: string
          include_course_agenda?: boolean
          include_course_content?: boolean
          include_quotation?: boolean
          include_trainer_profile?: boolean
          is_active?: boolean
          name?: string
          registration_type?: string | null
          subject?: string
          trigger_point?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string | null
          registration_id: string
          status: string
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          total_amount: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string | null
          registration_id: string
          status?: string
          subtotal: number
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount: number
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string | null
          registration_id?: string
          status?: string
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string
          contact_email: string
          contact_number: string
          contact_person: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          address: string
          contact_email: string
          contact_number: string
          contact_person: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          address?: string
          contact_email?: string
          contact_number?: string
          contact_person?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      partner_discounts: {
        Row: {
          created_at: string
          id: string
          private_course_discount: number
          public_course_discount: number
          tier: Database["public"]["Enums"]["partner_tier"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          private_course_discount?: number
          public_course_discount?: number
          tier: Database["public"]["Enums"]["partner_tier"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          private_course_discount?: number
          public_course_discount?: number
          tier?: Database["public"]["Enums"]["partner_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          address: string
          contact_number_1: string
          contact_number_2: string | null
          contact_person_1: string
          contact_person_2: string | null
          created_at: string
          email: string
          id: string
          name: string
          partner_code: string
          tier: Database["public"]["Enums"]["partner_tier"]
          updated_at: string
        }
        Insert: {
          address: string
          contact_number_1: string
          contact_number_2?: string | null
          contact_person_1: string
          contact_person_2?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          partner_code: string
          tier?: Database["public"]["Enums"]["partner_tier"]
          updated_at?: string
        }
        Update: {
          address?: string
          contact_number_1?: string
          contact_number_2?: string | null
          contact_person_1?: string
          contact_person_2?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          partner_code?: string
          tier?: Database["public"]["Enums"]["partner_tier"]
          updated_at?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          course_visibility_filter: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          percentage: number
          sponsorship_type_filter: string | null
          type: Database["public"]["Enums"]["discount_type"]
          updated_at: string
          usage_count: number
          usage_limit: number | null
          valid_from: string
          valid_until: string
        }
        Insert: {
          code: string
          course_visibility_filter?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          percentage: number
          sponsorship_type_filter?: string | null
          type: Database["public"]["Enums"]["discount_type"]
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          valid_from?: string
          valid_until: string
        }
        Update: {
          code?: string
          course_visibility_filter?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          percentage?: number
          sponsorship_type_filter?: string | null
          type?: Database["public"]["Enums"]["discount_type"]
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      quotations: {
        Row: {
          converted_to_invoice_id: string | null
          created_at: string
          id: string
          issue_date: string
          notes: string | null
          quotation_number: string
          registration_id: string
          status: string
          subtotal: number
          tax_amount: number
          tax_rate: number
          total_amount: number
          updated_at: string
          valid_until: string
        }
        Insert: {
          converted_to_invoice_id?: string | null
          created_at?: string
          id?: string
          issue_date?: string
          notes?: string | null
          quotation_number: string
          registration_id: string
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total_amount?: number
          updated_at?: string
          valid_until: string
        }
        Update: {
          converted_to_invoice_id?: string | null
          created_at?: string
          id?: string
          issue_date?: string
          notes?: string | null
          quotation_number?: string
          registration_id?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total_amount?: number
          updated_at?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotations_converted_to_invoice_id_fkey"
            columns: ["converted_to_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          cme_sales_representative: string | null
          contact_email: string
          contact_number: string
          contact_person: string
          course_id: string
          course_run_id: string
          created_at: string
          custom_registration_id: string | null
          discount_amount: number | null
          hrdf_grant: boolean | null
          id: string
          organization_id: string
          original_amount: number | null
          partner_discount_percentage: number | null
          payment_amount: number | null
          payment_status: string
          payment_terms: string | null
          payment_type: string | null
          promo_code_used: string | null
          promo_discount_percentage: number | null
          qbo_invoice_number: string | null
          status: string
          total_discount_percentage: number | null
          updated_at: string
        }
        Insert: {
          cme_sales_representative?: string | null
          contact_email: string
          contact_number: string
          contact_person: string
          course_id: string
          course_run_id: string
          created_at?: string
          custom_registration_id?: string | null
          discount_amount?: number | null
          hrdf_grant?: boolean | null
          id?: string
          organization_id: string
          original_amount?: number | null
          partner_discount_percentage?: number | null
          payment_amount?: number | null
          payment_status?: string
          payment_terms?: string | null
          payment_type?: string | null
          promo_code_used?: string | null
          promo_discount_percentage?: number | null
          qbo_invoice_number?: string | null
          status?: string
          total_discount_percentage?: number | null
          updated_at?: string
        }
        Update: {
          cme_sales_representative?: string | null
          contact_email?: string
          contact_number?: string
          contact_person?: string
          course_id?: string
          course_run_id?: string
          created_at?: string
          custom_registration_id?: string | null
          discount_amount?: number | null
          hrdf_grant?: boolean | null
          id?: string
          organization_id?: string
          original_amount?: number | null
          partner_discount_percentage?: number | null
          payment_amount?: number | null
          payment_status?: string
          payment_terms?: string | null
          payment_type?: string | null
          promo_code_used?: string | null
          promo_discount_percentage?: number | null
          qbo_invoice_number?: string | null
          status?: string
          total_discount_percentage?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_course_run_id_fkey"
            columns: ["course_run_id"]
            isOneToOne: false
            referencedRelation: "course_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_settings: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          tax_rate: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          tax_rate?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          tax_rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      trainees: {
        Row: {
          apc_number: string | null
          contact_number: string
          created_at: string
          dob: string
          email: string
          full_name: string
          gender: string
          id: string
          medical_doctor: boolean
          nric: string
          registration_id: string
        }
        Insert: {
          apc_number?: string | null
          contact_number: string
          created_at?: string
          dob: string
          email: string
          full_name: string
          gender: string
          id?: string
          medical_doctor?: boolean
          nric: string
          registration_id: string
        }
        Update: {
          apc_number?: string | null
          contact_number?: string
          created_at?: string
          dob?: string
          email?: string
          full_name?: string
          gender?: string
          id?: string
          medical_doctor?: boolean
          nric?: string
          registration_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainees_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_courses: {
        Row: {
          course_id: string
          created_at: string
          id: string
          trainer_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          trainer_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_courses_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainers: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          expertise: string | null
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          resume_url: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          expertise?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          phone?: string | null
          resume_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          expertise?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          resume_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_course_run_slug: {
        Args: { course_title: string; start_date: string }
        Returns: string
      }
      generate_course_slug: {
        Args: { course_title: string }
        Returns: string
      }
      generate_custom_registration_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_partner_code: {
        Args: { partner_name: string }
        Returns: string
      }
      get_partner_discount: {
        Args: { course_visibility: string; partner_tier_input: number }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "trainer"
      discount_type: "percentage" | "fixed_amount"
      partner_tier: "Tier 1" | "Tier 2" | "Tier 3"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "trainer"],
      discount_type: ["percentage", "fixed_amount"],
      partner_tier: ["Tier 1", "Tier 2", "Tier 3"],
    },
  },
} as const
