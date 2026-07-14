import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KorisnikDto, ZaposlenikInsertRequest, ZaposlenikUpdateRequest } from '../models/korisnik.models';
import { API_BASE_URL } from '../constants/app.constants';

@Injectable({ providedIn: 'root' })
export class ZaposlenikService {
  constructor(private http: HttpClient) {}

  getEmployees(search?: string): Observable<KorisnikDto[]> {
    let params = new HttpParams();
    if (search) params = params.set('imePrezime', search);
    return this.http.get<KorisnikDto[]>(`${API_BASE_URL}/Zaposlenik/zaposlenik`, { params });
  }

  getGuests(search?: string): Observable<KorisnikDto[]> {
    let params = new HttpParams();
    if (search) params = params.set('imePrezime', search);
    return this.http.get<KorisnikDto[]>(`${API_BASE_URL}/Zaposlenik/gost`, { params });
  }

  getById(id: number): Observable<KorisnikDto> {
    return this.http.get<KorisnikDto>(`${API_BASE_URL}/Zaposlenik/${id}`);
  }

  insert(request: ZaposlenikInsertRequest): Observable<KorisnikDto> {
    return this.http.post<KorisnikDto>(`${API_BASE_URL}/Zaposlenik`, request);
  }

  update(id: number, request: ZaposlenikUpdateRequest): Observable<KorisnikDto> {
    return this.http.put<KorisnikDto>(`${API_BASE_URL}/Zaposlenik/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/Zaposlenik/${id}`);
  }
}
