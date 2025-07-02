import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { AppService } from "./app.service";
import { map, catchError, switchMap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(private appService: AppService, private router: Router) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    return this.appService.getImei().pipe(
      switchMap((res) => this.appService.allowAccess(res.imei)), // <-- res.imei is now a string
      map((response) => {
        if (response.message === "success") {
          return true;
        } else {
          this.router.navigate(["/access"]);
          return false;
        }
      }),
      catchError((error) => {
        this.router.navigate(["/access"]);
        return of(false);
      })
    );
  }
}
