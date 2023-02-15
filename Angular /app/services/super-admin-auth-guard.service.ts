import { Injectable } from "@angular/core";
import { CanActivate, Router, RouterStateSnapshot, ActivatedRouteSnapshot } from "@angular/router";
import { HelperService } from "./helper.service";

@Injectable({
  providedIn: "root"
})
export class SuperAdminAuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private helper: HelperService,
    ) {
  }

    canActivate(route: ActivatedRouteSnapshot, routerStateSnapshot: RouterStateSnapshot): boolean {
        const user = this.helper.loggedUser;
        if (user && user.token) {
            if (user.isSuperAdmin) {
                return true;
            } else {
                this.router.navigate(["auth/sign-in"]);
                return false;
            }
        } else if (routerStateSnapshot.url.includes("/auth")) {
            return true;
        } else {
            this.router.navigate(["auth/sign-in"]);
            return false;
        }
      }
}
