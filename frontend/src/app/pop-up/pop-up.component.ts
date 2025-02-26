import {
  Component,
  HostListener,
  Input,
  inject,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import Chart from "chart.js/auto";

import { AuthService } from "../auth.service";
import { CookieService } from "../cookie.service";

interface ClickData {
  id: number;
  link_id: number;
  country: string;
  clicked_date: string;
}
const webhookRegex =
  /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[A-z0-9_-]+$/;

const shortValidCharacters = /^[a-zA-Z0-9_-]+$/;
const shortValidLength = /^.{2,20}$/;

const countryColors: { [key: string]: string } = {
  France: "rgba(255, 99, 132, 1)",
  Japan: "rgba(54, 162, 235, 1)",
  "United States": "rgba(255, 206, 86, 1)",
  Germany: "rgba(75, 192, 192, 1)",
  "United Kingdom": "rgba(153, 102, 255, 1)",
  Canada: "rgba(255, 159, 64, 1)",
  Australia: "rgba(0, 128, 128, 1)",
  India: "rgba(255, 0, 255, 1)",
  Brazil: "rgba(0, 255, 0, 1)",
  Italy: "rgba(128, 0, 0, 1)",
  Spain: "rgba(255, 140, 0, 1)",
  China: "rgba(0, 191, 255, 1)",
};

@Component({
  selector: "app-pop-up",
  imports: [CommonModule, FormsModule],
  templateUrl: "./pop-up.component.html",
  styleUrl: "./pop-up.component.css",
})
export class PopUpComponent {
  @Input() popupType: string = "";
  private reloadLinksCallback: (() => void) | null = null;

  constructor(private cookieService: CookieService) {}

  auth = inject(AuthService);

  showPopup: boolean = false;

  shortLink: string = "";
  shortLinkEdit: string = "";
  linkURL: string = "";
  webhook: string = "";
  defaultWebhook: string = "";
  password: string = "";
  errorMessage: string = "";
  message: string = "";
  linkData: any = {};
  newPassword: string = "";

  defaultClick = [
    {
      clicked_date: new Date().toLocaleDateString("en-GB"),
      count: 0,
      country: "",
    },
  ];
  clickData: ClickData[] = [];
  chart: Chart | null = null;
  chartCountry: Chart | null = null;
  chartLoaded: boolean = false;

  ngOnInit(): void {
    if (this.cookieService.checkLoginStatus()) {
      this.getWebhook();
    }
  }

  Random() {
    const chars =
      "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    this.shortLink = "";

    for (let i = 0; i < 5; i++) {
      const randIdx = Math.floor(Math.random() * chars.length);
      this.shortLink += chars[randIdx];
    }
  }

  ResetPassword() {
    this.errorMessage = "Please, wait...";
    this.message = "";

    fetch("https://eturlb.vercel.app/resetPassword", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        short_link: this.shortLink,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error");
        }
        return response.json();
      })
      .then((data) => {
        this.errorMessage = data.message;
        if (data.success) {
          this.errorMessage = "";
          this.message = "Password has been reset successfully!";
        }
      })
      .catch((error) => {
        this.errorMessage = "Something went wrong, please try again later.";
        console.error("Error:", error);
      });
  }

  isValidHttpUrl(Url: string) {
    try {
      const url = new URL(Url);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (err) {
      return false;
    }
  }

  Create() {
    this.errorMessage = "";
    this.shortLink = this.shortLink.replace(/\s+/g, "");

    if (!this.linkURL || !this.isValidHttpUrl(this.linkURL)) {
      this.errorMessage = "Please enter a valid URL with http(s)://.";
      return;
    } else if (!shortValidLength.test(this.shortLink)) {
      this.errorMessage =
        "Short link must be between 2 and 20 characters long.";
      return;
    } else if (!shortValidCharacters.test(this.shortLink)) {
      this.errorMessage =
        "Short link may only contain alphanumeric characters, underscores, and hyphens.";
      return;
    } else if (this.webhook && !webhookRegex.test(this.webhook)) {
      this.errorMessage = "Please enter a  valid webhook URL.";
      return;
    }

    this.errorMessage = "Please, wait...";

    fetch("https://eturlb.vercel.app/createNewLink", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        original_url: this.linkURL,
        short_link: this.shortLink,
        webhook: this.webhook,
        password: this.password,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error");
        }
        return response.json();
      })
      .then((data) => {
        this.errorMessage = data.message;
        if (data.success) {
          this.shortLink = "";
          this.linkURL = "";
          this.webhook = "";
          this.password = "";

          this.togglePopup("", null, null, true);
          this.togglePopup("success");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        this.errorMessage = "Error creating link, please try again later.";
      });
  }

  delete() {
    this.errorMessage = "Please, wait...";
    fetch("https://eturlb.vercel.app/deleteLink", {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        short_link: this.linkData.short_link,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error");
        }
        return response.json();
      })
      .then((data) => {
        this.errorMessage = data.message;
        if (data.success) {
          this.togglePopup("", null, null, true);
          this.togglePopup("successDelete");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  deleteAccount() {
    this.errorMessage = "Please, wait...";
    fetch("https://eturlb.vercel.app/deleteUser", {
      method: "DELETE",
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
        this.errorMessage = data.message;
        if (data.success) {
          this.auth.signOut();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  groupByDateAndCountry(): {
    clicked_date: string;
    country: string;
    count: number;
  }[] {
    const dateCountryCountMap: { [key: string]: { [key: string]: number } } =
      {};

    const countries = Array.from(
      new Set(this.clickData.map((item) => item.country))
    );

    this.clickData.forEach((item) => {
      if (!dateCountryCountMap[item.clicked_date]) {
        dateCountryCountMap[item.clicked_date] = {};
      }

      if (dateCountryCountMap[item.clicked_date][item.country]) {
        dateCountryCountMap[item.clicked_date][item.country]++;
      } else {
        dateCountryCountMap[item.clicked_date][item.country] = 1;
      }
    });

    const result: { clicked_date: string; country: string; count: number }[] =
      [];

    Object.keys(dateCountryCountMap).forEach((date) => {
      countries.forEach((country) => {
        const count = dateCountryCountMap[date][country] || 0;
        result.push({
          clicked_date: date,
          country: country,
          count: count,
        });
      });
    });

    return result;
  }

  groupByCountry(): { country: string; count: number }[] {
    const countryCountMap: { [key: string]: number } = {};

    this.clickData.forEach((item) => {
      if (countryCountMap[item.country]) {
        countryCountMap[item.country]++;
      } else {
        countryCountMap[item.country] = 1;
      }
    });

    return Object.keys(countryCountMap).map((country) => ({
      country,
      count: countryCountMap[country],
    }));
  }

  createChart(noData: boolean = false) {
    const canvas = document.getElementById("clickChart") as HTMLCanvasElement;
    const canvasCountry = document.getElementById(
      "clickChartCountry"
    ) as HTMLCanvasElement;
    let groupedData;
    let groupedDataByCountry;

    if (!canvas || !canvasCountry) {
      return;
    }

    if (noData) {
      groupedData = this.defaultClick;
      groupedDataByCountry = this.defaultClick;
    } else {
      groupedData = this.groupByDateAndCountry();
      groupedDataByCountry = this.groupByCountry();
    }

    if (this.chart) {
      this.chart.destroy();
    }
    if (this.chartCountry) {
      this.chartCountry.destroy();
    }

    const countries = Array.from(
      new Set(groupedData.map((row) => row.country))
    );

    const datasets = countries.map((country) => {
      return {
        label: country,
        data: groupedData
          .filter((row) => row.country === country)
          .map((row) => row.count),
        borderColor: countryColors[country] || "rgba(128, 128, 128, 1)",
        backgroundColor: countryColors[country] || "rgba(128, 128, 128, 1)",
        borderWidth: 2,
      };
    });

    this.chart = new Chart(canvas, {
      type: "line",
      data: {
        labels: Array.from(new Set(groupedData.map((row) => row.clicked_date))),
        datasets: datasets.map((dataset) => ({
          ...dataset,
          hidden: true,
        })),
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              callback: function (value: string | number): string | number {
                if (typeof value === "number") {
                  if (Number.isInteger(value)) {
                    return value;
                  }
                  return value.toFixed(0);
                }
                return value;
              },
            },
          },
        },
      },
    });
    this.chartLoaded = true;

    this.chartCountry = new Chart(canvasCountry, {
      type: "bar",
      data: {
        labels: groupedDataByCountry.map((row) => row.country),
        datasets: [
          {
            label: "Clicks",
            data: groupedDataByCountry.map((row) => row.count),
            backgroundColor: groupedDataByCountry.map(
              (row) => countryColors[row.country] || "rgba(128, 128, 128, 1)"
            ),
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              callback: function (value: string | number): string | number {
                if (typeof value === "number") {
                  if (Number.isInteger(value)) {
                    return value;
                  }
                  return value.toFixed(0);
                }
                return value;
              },
            },
          },
        },
      },
    });
  }

  toggleChartCountry() {
    const toggleBtn = document.getElementById("toggleBtn") as HTMLButtonElement;

    if (this.chart && this.chartCountry) {
      if (toggleBtn.innerHTML === "Show all") {
        toggleBtn.innerHTML = "Hide all";
        this.chart.data.datasets.forEach((dataset, index) => {
          if (this.chart) {
            this.chart.getDatasetMeta(index).hidden = false;
          }
        });
      } else {
        toggleBtn.innerHTML = "Show all";
        this.chart.data.datasets.forEach((dataset, index) => {
          if (this.chart) {
            this.chart.getDatasetMeta(index).hidden = true;
          }
        });
      }
      this.chart.update();
    } else {
      console.error("Chart is not defined");
    }
  }

  clickInfo() {
    this.message = "Loading...";
    fetch(
      `https://eturlb.vercel.app/GetClickInfo?short_link=${this.linkData.short_link}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error");
        }
        return response.json();
      })
      .then((data) => {
        if (data.message === "noClick") {
          this.message =
            "No one has clicked on your link yet, come back later!";
          this.createChart(true);
        } else {
          this.clickData = data.message;
          this.message = "Total clicks: " + this.clickData.length;
          this.createChart();
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        this.message = "";
        this.errorMessage = "Failed to load click data. Try again later.";
      });
  }

  edit() {
    this.errorMessage = "";

    if (!this.linkURL || !this.isValidHttpUrl(this.linkURL)) {
      this.errorMessage = "Please enter a valid URL with http(s)://.";
      return;
    } else if (!shortValidLength.test(this.shortLinkEdit)) {
      this.errorMessage =
        "Short link must be between 2 and 20 characters long.";
      return;
    } else if (!shortValidCharacters.test(this.shortLinkEdit)) {
      this.errorMessage =
        "Short link may only contain alphanumeric characters, underscores, and hyphens.";
      return;
    } else if (this.webhook && !webhookRegex.test(this.webhook)) {
      this.errorMessage = "Please enter a  valid webhook URL.";
      return;
    }

    this.errorMessage = "Please, wait...";

    fetch("https://eturlb.vercel.app/editLink", {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        original_url: this.linkURL,
        short_link: this.shortLink,
        short_link_edit: this.shortLinkEdit,
        webhook: this.webhook,
        password: this.newPassword,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error");
        }
        return response.json();
      })
      .then((data) => {
        this.errorMessage = data.message;
        if (data.success) {
          this.togglePopup("", null, null, true);
          this.togglePopup("successEdit");
        }
      })
      .catch((error) => {
        this.errorMessage = "Something went wrong, please try again later.";
        console.error("Error:", error);
      });
  }

  getWebhook() {
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
        if (data.success) {
          this.defaultWebhook = data.message.webhook || "";
        }
      })
      .catch((error) => {
        this.errorMessage = "Error getting user data, please try again later.";
        console.error("Error:", error);
      });
  }

  togglePopup(
    popupType: string = "",
    reloadLinksCallback: (() => void) | null = null,
    linkData: any[] | null = null,
    reloadLinks: boolean = false
  ) {
    this.showPopup = !this.showPopup;
    this.errorMessage = "";
    this.message = "";
    this.newPassword = "";
    this.clickData = [];

    this.linkData = linkData || this.linkData;
    this.webhook = this.defaultWebhook;

    if (this.showPopup) {
      document.body.classList.add("no-scroll");
      this.popupType = popupType || this.popupType;
      this.reloadLinksCallback = reloadLinksCallback;
      if (popupType === "clickinfo") {
        this.clickInfo();
      } else if (popupType === "settings") {
        this.webhook = this.linkData.webhook;
        this.linkURL = this.linkData.original_url;
        this.shortLink = this.linkData.short_link;
        this.shortLinkEdit = this.linkData.short_link;
      }
    } else {
      document.body.classList.remove("no-scroll");
      if (this.reloadLinksCallback && reloadLinks) {
        this.reloadLinksCallback();
        this.reloadLinksCallback = null;
      }
      this.chartLoaded = false;
      if (popupType === "settings") {
        this.webhook = "";
        this.linkURL = "";
        this.shortLink = "";
        this.shortLinkEdit = "";
      }
    }
  }

  private clickStartedOutside = false;

  @HostListener("document:mousedown", ["$event"])
  onMouseDown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    this.clickStartedOutside = !target.closest(".popup");
  }

  @HostListener("document:mouseup", ["$event"])
  onMouseUp(event: MouseEvent) {
    if (this.showPopup && this.clickStartedOutside) {
      const target = event.target as HTMLElement;
      const clickedOutsidePopup = !target.closest(".popup");

      if (clickedOutsidePopup) {
        this.togglePopup(this.popupType);
      }
    }
  }
}
