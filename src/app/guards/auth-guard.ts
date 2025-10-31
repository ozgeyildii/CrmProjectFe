import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  console.log("Auth Guard çalıştı");

  if (authService.loggedIn()) {
    console.log("Auth Guard izin verdi");
    return true;
  } else {
    console.log("Auth Guard logine gönderiyor");
    authService.logout();
    router.navigateByUrl('/login');
    return false;
  }
};
