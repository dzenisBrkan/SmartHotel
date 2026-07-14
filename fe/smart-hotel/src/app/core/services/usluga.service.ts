import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DodatnaUslugaDto,
  DodatnaUslugaInsertRequest,
  DodatnaUslugaUpdateRequest,
} from '../models/usluga.models';
import { API_BASE_URL } from '../constants/app.constants';

@Injectable({ providedIn: 'root' })
export class UslugaService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<DodatnaUslugaDto[]> {
    return this.http.get<DodatnaUslugaDto[]>(`${API_BASE_URL}/Usluga`);
  }

  getById(id: number): Observable<DodatnaUslugaDto> {
    return this.http.get<DodatnaUslugaDto>(`${API_BASE_URL}/Usluga/${id}`);
  }

  insert(request: DodatnaUslugaInsertRequest): Observable<DodatnaUslugaDto> {
    return this.http.post<DodatnaUslugaDto>(`${API_BASE_URL}/Usluga`, request);
  }

  update(id: number, request: DodatnaUslugaUpdateRequest): Observable<DodatnaUslugaDto> {
    return this.http.put<DodatnaUslugaDto>(`${API_BASE_URL}/Usluga/${id}`, request);
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${API_BASE_URL}/Usluga/${id}`);
  }
}
