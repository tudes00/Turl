import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonModule } from "@angular/common";

import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-redirect",
  imports: [CommonModule, FormsModule],
  templateUrl: "./redirect.component.html",
  styleUrl: "./redirect.component.css",
})
export class RedirectComponent implements OnInit {
  message: string = "Redirecting...";
  passwordMessage: string = "";
  dataPass: any = {};
  password: string = "";
  shortLink: any = "";

  constructor(private route: ActivatedRoute, private router: Router) {}
  async ngOnInit(): Promise<void> {
    this.shortLink = this.route.snapshot.paramMap.get("shortLink");
    if (!this.shortLink) {
      this.message = "Invalid short link";
      return;
    }
    try {
      const hasPassword = await fetch(
        `https://eturlb.vercel.app/checkIfPassord?short_link=${this.shortLink}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!hasPassword.ok) throw new Error("Error fetching URL");

      this.dataPass = await hasPassword.json();
      if (!this.dataPass.success) {
        this.message = "Invalid short link";
        return;
      } else if (this.dataPass.hasPassword) {
        this.message = "Enter password";
      } else {
        this.redirect();
      }
    } catch (error) {
      console.error("Error:", error);
      this.message = "Error retrieving link";
    }
  }

  submitPassword() {
    this.passwordMessage = "";
    if (!this.password) {
      this.passwordMessage = "Please enter a password";
      return;
    }

    this.redirect();
  }

  async redirect() {
    const url = new URL("https://eturlb.vercel.app/getUrl?short_link=salut_");
    url.searchParams.append("password", this.password);
    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Error fetching URL");

      const data = await response.json();
      if (this.dataPass.hasPassword && !data.success) {
        this.passwordMessage = "Invalid password";
        return;
      }
      if (!data.success || data.message.length === 0) {
        this.message = "Invalid short link";
        return;
      }

      const originalUrl = data.message;
      this.message = "Redirecting...";

      try {
        await fetch("https://eturlb.vercel.app/addClick", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ short_link: this.shortLink }),
        });
      } catch {
        console.warn("Failed to register click");
      }

      window.location.href = originalUrl;
    } catch (error) {
      console.error("Error:", error);
      this.message = "Error retrieving link";
    }
  }
}
