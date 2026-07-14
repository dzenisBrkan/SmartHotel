export interface RecenzijaDto {
  recenzijeId: number;
  korisnikId: number;
  sobaId: number;
  korisnikImePrezime: string;
  sobaNaziv: string;
  ocjena: number;
  komentar: string;
  datum: string;
}

export interface RecenzijaInsertRequest {
  sobaId: number;
  ocjena: number;
  komentar: string;
}

export interface RecenzijaUpdateRequest {
  ocjena?: number;
  komentar?: string;
}

export interface RecenzijaSearchObject {
  sobaId?: number;
  korisnikId?: number;
}
