declare var google: any;
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from './cookie.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  router = inject(Router);

  constructor(private cookieService: CookieService) {}

  signOut() {
    google.accounts.id.disableAutoSelect();
    this.cookieService.deleteCookie('loggedInUser');
    this.cookieService.deleteCookie('token');
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }

  handleLogin(response: any) {
    if (response) {
      const token = response.credential;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const time = payload.exp;

      this.cookieService.setCookie(
        'loggedInUser',
        JSON.stringify(payload),
        time
      );
      this.cookieService.setCookie('token', token, time);

      fetch('http://localhost:4200/api/addUser', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Error');
          }
          return response.json();
        })
        .then((data) => {
          this.router.navigate(['/dashboard']).then(() => {
            setTimeout(() => {
              window.location.reload();
            }, 100);
          });
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  }
}
