import { Component } from "@angular/core";
import { SalesService } from "../../services/sales.service";
import { ExpensesService } from "../../services/expenses.service";
import { DashboardService } from "../../services/dashboard.service";
import Chart from "chart.js/auto";
import "chartjs-plugin-datalabels";
import { format, toZonedTime } from "date-fns-tz";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent {
  mostOrderedToday: any[] = [];
  mostOrdered: any[] = [];
  products: any[] = [];
  expenses: any[] = [];
  credit: number = 0;
  totalCups: number = 0;
  topSpenders: any[] = [];
  topSpendersToday: any[] = [];
  chart: any;
  salesData: any;
  all_time_low: any;
  all_time_high: any;
  start_date: any;

  constructor(
    private dashboardService: DashboardService,
    private salesService: SalesService,
    private expensesService: ExpensesService
  ) {}

  ngOnInit() {
    const payload = {
      page: 1,
      limit: 10,
    };
    this.salesService.getSales(payload).subscribe((res: any) => {
      this.salesData = res.sales;
    });

    this.expensesService.getExpenses(payload).subscribe((res: any) => {
      this.credit = res.total_credit_amount.totalCreditAmount;
    });

    this.salesService.sales$.subscribe((products: any) => {
      if (products && products.length > 0) {
        this.totalCups = this.calculateTotalCups(products);
      }
    });

    this.expensesService.expenses$.subscribe((products: any) => {
      if (products && products.length > 0) {
        this.expenses = products;
      }
    });

    this.dashboardService.products$.subscribe(
      (data: any) => {
        if (!data) return;
        this.mostOrderedToday = data.mostOrderedToday ?? this.mostOrderedToday;
        this.mostOrdered = data.mostOrdered ?? this.mostOrdered;
        this.topSpenders = data.topSpenders ?? this.topSpenders;
        this.start_date = data.startDate ?? this.start_date;
      },
      (error) => {
        console.error("Error fetching dashboard data:", error?.message || error);
      }
    );

    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    // Format dates as "yyyy-MM-dd"
    this.startDate = this.formatDate(sevenDaysAgo); // Set as END date
    this.endDate = this.formatDate(today); // Set as START date

    // Fetch default chart data
    this.dashboardService.getStat(this.startDate, this.endDate).subscribe(
      (stats: any) => {
        console.log("stats", stats, stats.data, stats.all_time_low, stats.all_time_high);
        this.all_time_low = stats.all_time_low;
        this.all_time_high = stats.all_time_high;

        if (stats.data && stats.data.length > 0) {
          stats.data.sort(
            (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          const timeZone = "Asia/Manila";
          const dates = stats.data.map((stat: any) =>
            this.formatDateInTimeZone(stat.date, timeZone)
          );
          const sales = stats.data.map((stat: any) => parseFloat(stat.total_sales) || 0);
          const expenses = stats.data.map((stat: any) => parseFloat(stat.total_expenses) || 0);
          const net = stats.data.map((stat: any) => parseFloat(stat.net) || 0);
          this.updateBarChart(dates, sales, expenses, net);
        }
      },
      (error) => {
        console.error("Error fetching statistics:", error);
      }
    );

    this.dashboardService.getTopSpendersToday().subscribe((res: any) => {
      this.topSpendersToday = res;
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  startDate: string = "";
  endDate: string = "";

  applyDateRange() {
    if (!this.startDate || !this.endDate) {
      console.error("Start date and end date are required!");
      return;
    }

    this.dashboardService.getStat(this.startDate, this.endDate).subscribe(
      (stats: any) => {
        console.log("Filtered stats:", stats);
        this.all_time_low = stats.all_time_low;
        this.all_time_high = stats.all_time_high;

        if (stats.data && stats.data.length > 0) {
          stats.data.sort(
            (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          const timeZone = "Asia/Manila";
          const dates = stats.data.map((stat: any) =>
            this.formatDateInTimeZone(stat.date, timeZone)
          );
          const sales = stats.data.map((stat: any) => parseFloat(stat.total_sales) || 0);
          const expenses = stats.data.map((stat: any) => parseFloat(stat.total_expenses) || 0);
          const net = stats.data.map((stat: any) => parseFloat(stat.net) || 0);
          this.updateBarChart(dates, sales, expenses, net);
        }
      },
      (error) => {
        console.error("Error fetching statistics:", error);
      }
    );
  }

  formatDateInTimeZone(dateString: string, timeZone: string): string {
    const date = new Date(dateString);
    const zonedDate = toZonedTime(date, timeZone);
    return format(zonedDate, "yyyy-MM-dd", { timeZone });
  }

  updateBarChart(labels: string[], sales: number[], expenses: number[], net: number[]) {
    const getDayOfWeek = (dateString: string) => {
      const date = new Date(dateString);
      const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      return daysOfWeek[date.getUTCDay()];
    };

    const adjustedExpenses = expenses.map((expense, index) => {
      return expense > sales[index] ? sales[index] : expense;
    });

    const adjustedNet = net.map((netValue, index) => {
      return netValue > sales[index] ? -1 : netValue < 0 ? -1 : netValue;
    });

    // 💥 DESTROY OLD CHART BEFORE CREATING NEW
    if (this.chart) {
      this.chart.destroy();
    }

    // 🔥 Create new chart
    this.chart = new Chart("canvas", {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Total Sales",
            data: sales,
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
          {
            label: "Total Expenses",
            data: adjustedExpenses,
            backgroundColor: "rgba(255, 99, 132, 0.5)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
          {
            label: "Net",
            data: adjustedNet,
            backgroundColor: "rgba(75, 192, 192, 0.5)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { usePointStyle: true, padding: 30 },
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem: any) => {
                const datasetIndex = tooltipItem.datasetIndex;
                const dataIndex = tooltipItem.dataIndex;
                const dayOfWeek = getDayOfWeek(labels[dataIndex]);

                if (datasetIndex === 1) {
                  return `Total Expenses: ${expenses[dataIndex]} (${dayOfWeek})`;
                } else if (datasetIndex === 2) {
                  return `Net: ${net[dataIndex]} (${dayOfWeek})`;
                } else {
                  return `${tooltipItem.dataset.label}: ${tooltipItem.raw} (${dayOfWeek})`;
                }
              },
            },
          },
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true },
        },
      },
    });
  }

  private calculateTotalCups(products: any[]): number {
    return products.reduce((acc, curr) => acc + parseFloat(curr.qty), 0);
  }
}
