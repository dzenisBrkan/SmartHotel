import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SobaDto, SobaInsertRequest, SobaSearchObject, SobaUpdateRequest } from '../models/soba.models';
import { VrstaSobeDto, VrstaSobeInsertRequest, VrstaSobeUpdateRequest } from '../models/soba.models';
import { API_BASE_URL } from '../constants/app.constants';

@Injectable({ providedIn: 'root' })
export class SobaService {
  constructor(private http: HttpClient) {}

  getAll(search?: SobaSearchObject): Observable<SobaDto[]> {
    let params = new HttpParams();
    if (search?.naziv) params = params.set('naziv', search.naziv);
    if (search?.vrstaId != null) params = params.set('vrstaId', search.vrstaId.toString());
    if (search?.status != null) params = params.set('status', search.status.toString());
    return this.http.get<SobaDto[]>(`${API_BASE_URL}/Sobe`, { params });
  }

  getById(id: number): Observable<SobaDto> {
    return this.http.get<SobaDto>(`${API_BASE_URL}/Sobe/${id}`);
  }

  insert(request: SobaInsertRequest): Observable<SobaDto> {
    return this.http.post<SobaDto>(`${API_BASE_URL}/Sobe`, request);
  }

  update(id: number, request: SobaUpdateRequest): Observable<SobaDto> {
    return this.http.put<SobaDto>(`${API_BASE_URL}/Sobe/${id}`, request);
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${API_BASE_URL}/Sobe/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class VrstaSobeService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<VrstaSobeDto[]> {
    return this.http.get<VrstaSobeDto[]>(`${API_BASE_URL}/VrsteSobe`);
  }

  getById(id: number): Observable<VrstaSobeDto> {
    return this.http.get<VrstaSobeDto>(`${API_BASE_URL}/VrsteSobe/${id}`);
  }

  insert(request: VrstaSobeInsertRequest): Observable<VrstaSobeDto> {
    return this.http.post<VrstaSobeDto>(`${API_BASE_URL}/VrsteSobe`, request);
  }

  update(id: number, request: VrstaSobeUpdateRequest): Observable<VrstaSobeDto> {
    return this.http.put<VrstaSobeDto>(`${API_BASE_URL}/VrsteSobe/${id}`, request);
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${API_BASE_URL}/VrsteSobe/${id}`);
  }
}
