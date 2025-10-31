import { HttpInterceptorFn } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from '../services/auth-service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const jwt = localStorage.getItem("token");
  const jwtHelper = new JwtHelperService();
  const authService = inject(AuthService);
  const router = inject(Router);
  console.log("Auth Interceptor çalıştı. Token:", jwt);

  let request = req;
  if (jwt) {
    request = req.clone({
      setHeaders: { Authorization: `Bearer ${jwt}` },
    });
  }

  // 2️⃣ Token süresi dolmuşsa logout ve login’e yönlendir
  if (jwt && jwtHelper.isTokenExpired(jwt)) {
    console.warn('Token süresi dolmuş, kullanıcı çıkış yapıyor...');
    authService.logout();
    router.navigateByUrl('/login');
    return throwError(() => new Error('Token expired'));
  }

  return next(req);
};