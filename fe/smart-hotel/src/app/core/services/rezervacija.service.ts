import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  RezervacijaDto,
  RezervacijaInsertRequest,
  RezervacijaSearchObject,
  RezervacijaUpdateRequest,
} from '../models/rezervacija.models';
import { API_BASE_URL } from '../constants/app.constants';

@Injectable({ providedIn: 'root' })
export class RezervacijaService {
  constructor(private http: HttpClient) {}

  getAll(search?: RezervacijaSearchObject): Observable<RezervacijaDto[]> {
    let params = new HttpParams();
    if (search?.status != null) params = params.set('status', search.status.toString());
    if (search?.sobaId != null) params = params.set('sobaId', search.sobaId.toString());
    if (search?.korisnikId != null) params = params.set('korisnikId', search.korisnikId.toString());
    if (search?.datumOd) params = params.set('datumOd', search.datumOd);
    if (search?.datumDo) params = params.set('datumDo', search.datumDo);
    return this.http.get<RezervacijaDto[]>(`${API_BASE_URL}/Rezervacije`, { params });
  }

  getById(id: number): Observable<RezervacijaDto> {
    return this.http.get<RezervacijaDto>(`${API_BASE_URL}/Rezervacije/${id}`);
  }

  getMyReservations(): Observable<RezervacijaDto[]> {
    return this.http.get<RezervacijaDto[]>(`${API_BASE_URL}/Rezervacije/me`);
  }

  insert(request: RezervacijaInsertRequest): Observable<RezervacijaDto> {
    return this.http.post<RezervacijaDto>(`${API_BASE_URL}/Rezervacije`, request);
  }

  update(id: number, request: RezervacijaUpdateRequest): Observable<RezervacijaDto> {
    return this.http.put<RezervacijaDto>(`${API_BASE_URL}/Rezervacije/${id}`, request);
  }

  cancel(id: number): Observable<RezervacijaDto> {
    return this.http.patch<RezervacijaDto>(`${API_BASE_URL}/Rezervacije/${id}/otkazi`, {});
  }

  checkIn(id: number): Observable<RezervacijaDto> {
    return this.http.post<RezervacijaDto>(`${API_BASE_URL}/Rezervacije/${id}/checkin`, {});
  }

  checkOut(id: number): Observable<RezervacijaDto> {
    return this.http.post<RezervacijaDto>(`${API_BASE_URL}/Rezervacije/${id}/checkout`, {});
  }
}
