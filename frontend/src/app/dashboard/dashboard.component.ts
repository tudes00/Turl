import {
  Component,
  inject,
  ViewChild,
  Output,
  EventEmitter,
} from "@angular/core";
import { Router } from "@angular/router";
import { CookieService } from "../cookie.service";
import { MatIconModule } from "@angular/material/icon";
import { PopUpComponent } from "../pop-up/pop-up.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-dashboard",
  imports: [MatIconModule, PopUpComponent, CommonModule, FormsModule],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.css",
})
export class DashboardComponent {
  @ViewChild(PopUpComponent) Popup!: PopUpComponent;
  @Output() reloadLinksEvent = new EventEmitter<void>();

  private router = inject(Router);
  links: any[] = [];
  errorMessage: string = "";
  message: string = "Loading...";
  loggedIn: boolean = false;

  filterText: string = "";

  constructor(private cookieService: CookieService) {}

  ngOnInit(): void {
    this.loggedIn = this.cookieService.checkLoginStatus();
    if (!this.loggedIn) {
      this.router.navigate(["/login"]);
    }
  }

  ngAfterViewInit(): void {
    if (this.loggedIn) {
      this.loadLinks();
    }
  }

  get filteredLinks() {
    return this.links.filter(
      (link) =>
        link.short_link.toLowerCase().includes(this.filterText.toLowerCase()) ||
        link.original_url.toLowerCase().includes(this.filterText.toLowerCase())
    );
  }

  loadLinks() {
    fetch("https://eturlb.vercel.app/GetUserUrl", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          this.errorMessage = "Error: " + response.status;
          this.links = [];
          this.message = "";
          throw new Error("Error");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          this.links = data.message;
          this.errorMessage = "";
          this.message = "";
        } else {
          if (data.start) {
            this.message = data.message;
          } else {
            this.errorMessage = data.message;
          }
          this.links = [];
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        this.errorMessage = "Error getting user data, please try again later.";
      });
  }

  reloadLinks() {
    this.loadLinks();
    this.reloadLinksEvent.emit();
  }

  openPopup(popupType: string, linkData: any[] | null = null) {
    this.Popup.togglePopup(popupType, () => this.reloadLinks(), linkData);
  }

  copy(link: string) {
    navigator.clipboard.writeText("http://localhost:4200/s/" + link);
    const tooltip = document.createElement("p");
    tooltip.className =
      "z-30 absolute bg-gray-950 text-white px-2 py-1 text-sm rounded opacity-0 transition-opacity duration-500 pointer-events-none rounded border border-gray-500";
    tooltip.innerText = "Copied!";

    document.body.appendChild(tooltip);
    const element = document.getElementById(`copy_${link}`);
    if (element) {
      const rect = element.getBoundingClientRect();
      tooltip.style.left = `${rect.left + window.scrollX - 22}px`;
      tooltip.style.top = `${rect.top + window.scrollY - 30}px`;

      tooltip.classList.remove("opacity-0");
      setTimeout(() => {
        tooltip.classList.add("opacity-0");
        setTimeout(() => tooltip.remove(), 500);
      }, 1000);
    }
  }
}
