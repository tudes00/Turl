import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class CookieService {
  setCookie(name: string, value: string, time: number): void {
    const date = new Date();
    date.setTime(time * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(
      value
    )}; ${expires}; path=/; Secure; SameSite=None`;
  }

  getCookie(name: string): string | null {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      let c = cookie.trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  }

  deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure; SameSite=None`;
  }

  checkLoginStatus() {
    const user = this.getCookie("loggedInUser");
    return !!user;
  }
}
