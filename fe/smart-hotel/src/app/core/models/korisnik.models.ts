export interface KorisnikDto {
  korisnikId: number;
  ime: string;
  prezime: string;
  email?: string;
  telefon?: string;
  korisnickoIme: string;
  status?: boolean;
  datumRegistracije: string;
  roles: string[];
}

export interface KorisnikProfilUpdateRequest {
  ime?: string;
  prezime?: string;
  email?: string;
  telefon?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export type ZaposlenikUloga = 'Recepcioner' | 'Admin';

export interface ZaposlenikInsertRequest {
  ime: string;
  prezime: string;
  korisnickoIme: string;
  lozinka: string;
  email?: string;
  telefon?: string;
  uloga: ZaposlenikUloga;
}

export interface ZaposlenikUpdateRequest {
  ime?: string;
  prezime?: string;
  email?: string;
  telefon?: string;
}
