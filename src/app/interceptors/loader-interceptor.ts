import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from '../services/loader-service';
import { finalize } from 'rxjs';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoaderService);
  loadingService.addRequest();

  return next(req).pipe(
    finalize(() => {
      loadingService.removeRequest();
    })
  );
};
