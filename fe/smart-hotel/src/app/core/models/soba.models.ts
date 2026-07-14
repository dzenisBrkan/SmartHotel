export interface VrstaSobeDto {
  vrstaId: number;
  naziv: string;
  opis: string;
  kapacitet: number;
  cijena: number;
}

export interface VrstaSobeInsertRequest {
  naziv: string;
  opis: string;
  kapacitet: number;
  cijena: number;
}

export interface VrstaSobeUpdateRequest extends VrstaSobeInsertRequest {}

export interface SobaDto {
  sobeId: number;
  naziv: string;
  sifra: string;
  vrstaId: number;
  vrstaNaziv: string;
  kapacitet: number;
  cijena: number;
  status?: boolean;
  stateMachine: string;
}

export interface SobaSearchObject {
  naziv?: string;
  vrstaId?: number;
  status?: boolean;
}

export interface SobaInsertRequest {
  naziv: string;
  sifra: string;
  vrstaId: number;
  kapacitet: number;
  cijena: number;
}

export interface SobaUpdateRequest extends SobaInsertRequest {}
