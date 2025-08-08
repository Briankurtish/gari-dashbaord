export interface User {
  id: number;
  reference: string;
  phone: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  nationality: string;
  gender: string;
  date_of_birth: string | null;
  is_active: boolean;
  is_admin: boolean;
  role: string;
  groups: string[];
  picture: string | null;
  picture_url: string | null;
  loans: any[];
  wallet: {
    available_balance: string;
    locked_balance: string;
    created_at: string;
    updated_at: string;
  };
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
