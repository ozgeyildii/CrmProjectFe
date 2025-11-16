import { Injectable, signal } from '@angular/core';
import { UserState } from '../models/userStateModel';
import { UserJwtModel } from '../models/userJwtModel';
import { jwtDecode } from 'jwt-decode';
import { LoginRequest } from '../models/requests/loginRequest';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public userState = signal<UserState>({ isLoggedIn: false });
  private jwtHelper = new JwtHelperService();

  constructor(private httpClient: HttpClient) {
    this.loadInitialState();
  }

  loadInitialState() {
    const token = localStorage.getItem('token');

    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decodedJwt = jwtDecode<UserJwtModel>(token);
      this.userState.set({
        isLoggedIn: true,
        user: { sub: decodedJwt.sub!, roles: decodedJwt.roles },
      });
    } else {
-      this.logout();
    }
  }

  sendLoginRequest(loginRequest: LoginRequest): Observable<{ token: string }> {
    return this.httpClient.post<{ token: string }>(
      `http://localhost:8091/authservice/api/auth/login`,
      loginRequest
    );
  }

  loggedIn(): boolean {
    const token = localStorage.getItem('token');
    // Token yoksa veya expired ise false döner
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  logout() {
    this.userState.set({ isLoggedIn: false, user: undefined });
    localStorage.removeItem('token');
  }
}
