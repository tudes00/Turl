import {
  Component,
  HostListener,
  signal,
  HostBinding,
  inject,
  OnInit,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';
import { CookieService } from '../cookie.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  isDropdownOpen = false;
  darkMode = signal<boolean>(false);
  auth = inject(AuthService);
  login: boolean | null = null;
  userProfileImg: string | null = null;
  isListOpen = false;

  isHovered = false;

  constructor(private cookieService: CookieService) {}

  ngOnInit(): void {
    this.login = this.cookieService.checkLoginStatus();
    const loggedInUserCookie = this.cookieService.getCookie('loggedInUser');
    if (loggedInUserCookie) {
      const loggedInUser = JSON.parse(loggedInUserCookie);
      this.userProfileImg = loggedInUser.picture;
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedInsideDropDown = target.closest('.dropDown');
    const clickedInsideList = target.closest('.list');
    if (!clickedInsideDropDown) {
      this.isDropdownOpen = false;
    }
    if (!clickedInsideList && this.isListOpen) {
      this.isListOpen = false;
      document.body.classList.remove('no-scroll');
    }
  }

  signOut() {
    this.auth.signOut();
  }

  showList() {
    this.isListOpen = !this.isListOpen;
    document.body.classList.add('no-scroll');
  }
}
