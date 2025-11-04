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
  console.log('%c[INTERCEPTOR] Token in localStorage:', 'color: #f39c12', jwt);

  if (jwt && !jwtHelper.isTokenExpired(jwt)) {
    console.log('%c[INTERCEPTOR] Token is valid. Attaching Authorization header...', 'color: #27ae60');
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${jwt}` },
    });
  } else if (jwt && jwtHelper.isTokenExpired(jwt)) {
    console.warn('%c[INTERCEPTOR] Token expired!', 'color: #e74c3c');
    authService.logout();
    router.navigateByUrl('/login');
    return throwError(() => new Error('Token expired'));
  } else {
    console.warn('%c[INTERCEPTOR] No token found in localStorage', 'color: #e67e22');
  }

  return next(req).pipe(
    catchError((error) => {
      console.error('%c[INTERCEPTOR] HTTP error caught:', 'color: #c0392b', error.status, error.statusText);
      if (error.status === 401 || error.status === 403) {
        console.log('%c[INTERCEPTOR] Logging out due to forbidden/unauthorized response', 'color: #9b59b6');
        authService.logout();
        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    })
  );
};
