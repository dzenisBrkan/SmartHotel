import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest, UserLoginInfo, UserRole } from '../models/auth.models';
import { API_BASE_URL, JWT_KEY, USER_KEY } from '../constants/app.constants';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _token = signal<string | null>(localStorage.getItem(JWT_KEY));
  private readonly _user = signal<UserLoginInfo | null>(this.loadUser());
  private readonly _roles = signal<UserRole[]>(this.loadRoles());

  readonly isAuthenticated = computed(() => !!this._token());
  readonly currentUser = computed(() => this._user());
  readonly roles = computed(() => this._roles());
  readonly isAdmin = computed(() => this._roles().includes('Admin'));
  readonly isRecepcioner = computed(() => this._roles().includes('Recepcioner'));
  readonly isGost = computed(() => this._roles().includes('Gost'));

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/Auth/login`, request).pipe(
      tap((res) => {
        if (res.success && res.token) {
          this.setSession(res);
        }
      })
    );
  }

  register(request: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/Auth/register`, request);
  }

  logout(): void {
    localStorage.removeItem(JWT_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('smart_hotel_roles');
    this._token.set(null);
    this._user.set(null);
    this._roles.set([]);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return this._token();
  }

  hasRole(role: UserRole): boolean {
    return this._roles().includes(role);
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return roles.some((r) => this._roles().includes(r));
  }

  private setSession(res: LoginResponse): void {
    localStorage.setItem(JWT_KEY, res.token!);
    if (res.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }
    if (res.roles) {
      localStorage.setItem('smart_hotel_roles', JSON.stringify(res.roles));
    }
    this._token.set(res.token!);
    this._user.set(res.user ?? null);
    this._roles.set((res.roles as UserRole[]) ?? []);
  }

  private loadUser(): UserLoginInfo | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserLoginInfo) : null;
  }

  private loadRoles(): UserRole[] {
    const raw = localStorage.getItem('smart_hotel_roles');
    return raw ? (JSON.parse(raw) as UserRole[]) : [];
  }
}
