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

  if (jwt && !jwtHelper.isTokenExpired(jwt)) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${jwt}` },
    });
  } else if (jwt && jwtHelper.isTokenExpired(jwt)) {
    authService.logout();
    router.navigateByUrl('/login');
    return throwError(() => new Error('Token expired'));
  } else {
    console.warn('%c[INTERCEPTOR] No token found in localStorage');
  }

  return next(req).pipe(
    catchError((error) => {
      console.error('%c[INTERCEPTOR] HTTP error caught:', error.status, error.statusText);
      if (error.status === 401 || error.status === 403) {
        console.log('%c[INTERCEPTOR] Logging out due to forbidden/unauthorized response');
        authService.logout();
        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    })
  );
};
