import { Component, inject, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { CookieService } from "../cookie.service";
import { FormsModule } from "@angular/forms";

import { PopUpComponent } from "../pop-up/pop-up.component";

const webhookRegex =
  /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[A-z0-9_-]+$/;

@Component({
  selector: "app-settings",
  standalone: true,
  imports: [CommonModule, PopUpComponent, FormsModule],
  templateUrl: "./settings.component.html",
  styleUrl: "./settings.component.css",
})
export class SettingsComponent {
  @ViewChild(PopUpComponent) Popup!: PopUpComponent;
  private router = inject(Router);

  errorMessage: string = "";
  message: string = "Loading...";
  success: boolean = false;

  webhook: string = "";

  constructor(private cookieService: CookieService) {}

  ngOnInit(): void {
    if (!this.cookieService.checkLoginStatus()) {
      this.router.navigate(["/login"]).finally();
    } else {
      this.getUserData();
    }
  }

  getUserData(): void {
    fetch("https://eturlb.vercel.app/getUserData", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error");
        }
        return response.json();
      })
      .then((data) => {
        this.message = "";
        this.success = true;
        if (data.success) {
          this.webhook = data.message.webhook || "";
        }
      })
      .catch((error) => {
        this.errorMessage = "Error getting user data, please try again later.";
        this.message = "";
        console.error("Error:", error);
      });
  }

  save(): void {
    this.message = "";
    this.errorMessage = "";
    if (this.webhook && !webhookRegex.test(this.webhook)) {
      this.errorMessage = "Please enter a valid webhook URL.";
      return;
    }
    this.message = "Please wait...";
    fetch("https://eturlb.vercel.app/editWebhook", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        webhook: this.webhook,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error");
        }
        return response.json();
      })
      .then((data) => {
        this.message = "Webhook successfully edited.";
      })
      .catch((error) => {
        this.errorMessage = "Error editing user data, please try again later.";
        this.message = "";
        console.error("Error:", error);
      });
  }

  deleteAccount() {
    this.Popup.togglePopup("deleteAccount");
  }
}
