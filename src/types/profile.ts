
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}
