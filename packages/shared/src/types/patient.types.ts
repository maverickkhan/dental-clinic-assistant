export interface Patient {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  medical_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientDto {
  name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  medical_notes?: string;
}

export interface UpdatePatientDto {
  name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  medical_notes?: string;
}
