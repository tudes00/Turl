declare var google: any;
import { CommonModule } from '@angular/common';
import { Component, inject, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from '../cookie.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private router = inject(Router);
    auth = inject(AuthService);
  constructor(
    private cookieService: CookieService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    if (this.cookieService.checkLoginStatus()) {
      this.router.navigate(['/dashboard']).finally(() => window.location.reload());
    }

    this.loadGoogleScript().then(() => {
      google.accounts.id.initialize({
        client_id: '14627223126-5ei3fgrp306pda0ftfuhckvmttp6u1me.apps.googleusercontent.com',
        callback: (resp: any) => this.auth.handleLogin(resp),
      });
  
      google.accounts.id.renderButton(document.getElementById("google-btn"), {
        theme: 'filled_black',
        text: 'continue_with',
        shape: 'circle',
      });
    });
  }

  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('google-script')) {
        resolve();
        return;
      };

      const script = this.renderer.createElement('script');
      script.id = 'google-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject('Erreur lors du chargement du script Google');

      document.body.appendChild(script);
    });
  };
}
