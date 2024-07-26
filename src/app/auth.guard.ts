import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AppService } from './app.service';
import { map, catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private appService: AppService, private router: Router) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    console.log('canActivate');
    return this.appService.getImei().pipe(
      switchMap(imei => this.appService.allowAccess(imei)),
      map(response => {
        console.log('whitelist', response);
        if (response.message === 'success') {
          return true; // IMEI or IP is whitelisted
        } else {
          this.router.navigate(['/access']); // Redirect to access-denied component
          return false;
        }
      }),
      catchError(error => {
        this.router.navigate(['/access']); // Redirect to access-denied component on error
        return of(false); // Use 'of' to return an Observable with the value 'false'
      })
    );
  }
}
