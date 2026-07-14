export interface LoginRequest {
  korisnickoIme: string;
  lozinka: string;
}

export interface RegisterRequest {
  ime: string;
  prezime: string;
  email: string;
  korisnickoIme: string;
  lozinka: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  roles?: string[];
  user?: UserLoginInfo;
}

export interface UserLoginInfo {
  korisnikId: number;
  korisnickoIme: string;
  ime: string;
  prezime: string;
  email: string;
}

export type UserRole = 'Admin' | 'Recepcioner' | 'Gost';
