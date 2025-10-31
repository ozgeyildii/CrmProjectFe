import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
 
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtHelper = new JwtHelperService();
  const authService = inject(AuthService);
  const router = inject(Router);
 
  const jwt = localStorage.getItem('token');
 
  let request = req;
  if (jwt) {
    request = req.clone({
      setHeaders: { Authorization: `Bearer ${jwt}` },
    });
  }
 
  if (jwt && jwtHelper.isTokenExpired(jwt)) {
    authService.logout();
    router.navigateByUrl('/login');
    return throwError(() => new Error('Token expired'));
  }
 
  return next(request).pipe(
    catchError((error) => {
      if (error.status === 401 || error.status === 403) {
        authService.logout();
        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    })
  );
};