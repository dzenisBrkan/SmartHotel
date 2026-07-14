export enum StatusRezervacije {
  Kreirana = 0,
  U_Toku = 1,
  Zavrsena = 2,
  Otkazana = 3,
}

export const STATUS_LABELS: Record<StatusRezervacije, string> = {
  [StatusRezervacije.Kreirana]: 'Pending',
  [StatusRezervacije.U_Toku]: 'Active',
  [StatusRezervacije.Zavrsena]: 'Completed',
  [StatusRezervacije.Otkazana]: 'Cancelled',
};

export const STATUS_COLORS: Record<StatusRezervacije, string> = {
  [StatusRezervacije.Kreirana]: 'warning',
  [StatusRezervacije.U_Toku]: 'success',
  [StatusRezervacije.Zavrsena]: 'info',
  [StatusRezervacije.Otkazana]: 'danger',
};

export interface RezervacijaUslugaDto {
  uslugaId: number;
  naziv: string;
  cijena: number;
}

export interface PlacanjeDto {
  placanjeId: number;
  iznos: number;
  datum: string;
}

export interface RezervacijaDto {
  rezervacijaId: number;
  korisnikId: number;
  sobaId: number;
  korisnikImePrezime: string;
  sobaNaziv: string;
  datumOd: string;
  datumDo: string;
  brojOsoba: number;
  status: StatusRezervacije;
  ukupnaCijena: number;
  datumKreiranja: string;
  usluge: RezervacijaUslugaDto[];
  placanja: PlacanjeDto[];
}

export interface RezervacijaInsertRequest {
  korisnikId?: number;
  sobaId: number;
  datumOd: string;
  datumDo: string;
  brojOsoba: number;
  uslugeIds: number[];
}

export interface RezervacijaUpdateRequest {
  status?: StatusRezervacije;
  datumOd?: string;
  datumDo?: string;
  brojOsoba?: number;
}

export interface RezervacijaSearchObject {
  korisnikId?: number;
  sobaId?: number;
  status?: StatusRezervacije;
  datumOd?: string;
  datumDo?: string;
}
