export interface DodatnaUslugaDto {
  uslugaId: number;
  naziv: string;
  cijena: number;
}

export interface DodatnaUslugaInsertRequest {
  naziv: string;
  cijena: number;
}

export interface DodatnaUslugaUpdateRequest extends DodatnaUslugaInsertRequest {}
