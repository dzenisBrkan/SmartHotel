import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  RecenzijaDto,
  RecenzijaInsertRequest,
  RecenzijaSearchObject,
  RecenzijaUpdateRequest,
} from '../models/recenzija.models';
import { API_BASE_URL } from '../constants/app.constants';

@Injectable({ providedIn: 'root' })
export class RecenzijaService {
  constructor(private http: HttpClient) {}

  getAll(search?: RecenzijaSearchObject): Observable<RecenzijaDto[]> {
    let params = new HttpParams();
    if (search?.sobaId != null) params = params.set('sobaId', search.sobaId.toString());
    if (search?.korisnikId != null) params = params.set('korisnikId', search.korisnikId.toString());
    return this.http.get<RecenzijaDto[]>(`${API_BASE_URL}/Recenzija`, { params });
  }

  getBySoba(sobaId: number): Observable<RecenzijaDto[]> {
    return this.http.get<RecenzijaDto[]>(`${API_BASE_URL}/Recenzija/by-soba/${sobaId}`);
  }

  getAverageRating(sobaId: number): Observable<number> {
    return this.http.get<number>(`${API_BASE_URL}/Recenzija/prosjek/${sobaId}`);
  }

  insert(request: RecenzijaInsertRequest): Observable<RecenzijaDto> {
    return this.http.post<RecenzijaDto>(`${API_BASE_URL}/Recenzija`, request);
  }

  update(id: number, request: RecenzijaUpdateRequest): Observable<RecenzijaDto> {
    return this.http.put<RecenzijaDto>(`${API_BASE_URL}/Recenzija/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/Recenzija/${id}`);
  }
}
