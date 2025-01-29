import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError } from 'rxjs';
import { environment } from './../../environments/environment';
import { LoginRequest } from '../login/login-request';
import { LoginResult } from '../login/login-result';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}

  private tokenKey: string = "auth_token";

  private _authStatusSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  public authStatus$ = this._authStatusSubject.asObservable();

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  init(): void {
    if (this.isAuthenticated())
      this.setAuthStatus(true);
  }

  login(loginRequest: LoginRequest): Observable<LoginResult> {
    const url = environment.baseUrl + 'api/Account/Login';
    console.log('Login endpoint is: ' + url);
    return this.http.post<LoginResult>(url, loginRequest)
    .pipe(tap(loginResult => {
      if (loginResult.success && loginResult.token) {
        localStorage.setItem(this.tokenKey, loginResult.token);
        this.setAuthStatus(true);
        console.log('Logged in');
      }
    }),
    catchError(error => {
      this.setAuthStatus(false);
      throw error;
    })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.setAuthStatus(false);
    console.log('Logged out');
  }

  private setAuthStatus(isAuthenticated: boolean): void {
    this._authStatusSubject.next(isAuthenticated);
  }
}
