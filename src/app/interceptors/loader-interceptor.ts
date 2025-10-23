import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoaderService } from '../services/loader-service';
import { finalize } from 'rxjs';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoaderService);
  loadingService.addRequest();
  console.log("istek başlıyor..")

  // RxJs pipe
  return next(req).pipe(
    finalize(() => {
      console.log("istek bitti..")
      loadingService.removeRequest();
    })
  );
};