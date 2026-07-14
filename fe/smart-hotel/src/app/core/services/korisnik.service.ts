import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KorisnikDto, KorisnikProfilUpdateRequest, ChangePasswordRequest } from '../models/korisnik.models';
import { API_BASE_URL } from '../constants/app.constants';

@Injectable({ providedIn: 'root' })
export class KorisnikService {
  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<KorisnikDto> {
    return this.http.get<KorisnikDto>(`${API_BASE_URL}/Korisnik/me`);
  }

  updateProfile(request: KorisnikProfilUpdateRequest): Observable<KorisnikDto> {
    return this.http.patch<KorisnikDto>(`${API_BASE_URL}/Korisnik/me`, request);
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.patch<void>(`${API_BASE_URL}/Korisnik/me/password`, request);
  }
}
