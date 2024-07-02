import { Component } from '@angular/core';
import { SalesService } from '../../services/sales.service';
import { ExpensesService } from '../../services/expenses.service';
import { DashboardService } from '../../services/dashboard.service';
import Chart from 'chart.js/auto';
import 'chartjs-plugin-datalabels';
import { format, toZonedTime } from 'date-fns-tz';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  mostOrderedToday: any[] = [];
  mostOrdered: any[] = [];
  products: any[] = [];
  expenses: any[] = [];
  totalSalesSum: number = 0;
  totalExpenses: number = 0;
  net: number = 0;
  computer: number = 0;
  foodDrinks: number = 0;
  totalCups: number = 0;
  topSpenders: any[] = [];
  topSpendersToday: any[] = [];
  
  chart: any;

  constructor(
    private dashboardService: DashboardService,
    private salesService: SalesService,
    private expensesService: ExpensesService
  ) {}

  ngOnInit() {
    this.salesService.getSales().subscribe((res: any) => {
      console.log('res', res, res.sales);
      this.totalSalesSum = res.sales.income;
      this.totalExpenses = res.sales.expenses;
      this.net = res.sales.net;
      this.computer = res.sales.computer;
      this.foodDrinks = res.sales.food_and_drinks;
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
        if (data && data.length > 0 && data[0]) {
          console.log('dashboard', data, data[0].topSpenders);
          this.mostOrderedToday = data[0].mostOrderedToday;
          this.mostOrdered = data[0].mostOrdered;
          this.topSpenders = data[0].topSpenders;
        }
      },
      error => {
        console.error('Error fetching most ordered products:', error);
      }
    );

    this.dashboardService.getStat().subscribe(
      (stats: any[]) => {
        if (stats && stats.length > 0) {
          // Sort stats by date in ascending order
          stats.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          // Transform stats into suitable format for the chart
          const timeZone = 'Asia/Manila';
          const dates = stats.map(stat => this.formatDateInTimeZone(stat.date, timeZone)); // Format date here
          const sales = stats.map(stat => parseFloat(stat.total_sales) || 0);
          const expenses = stats.map(stat => parseFloat(stat.total_expenses) || 0);
          const net = stats.map(stat => parseFloat(stat.net) || 0);
          this.updateBarChart(dates, sales, expenses, net);
        }
      },
      error => {
        console.error('Error fetching statistics:', error);
      }
    );

    this.dashboardService.getTopSpendersToday().subscribe((res: any) => {
      console.log('res', res);
      this.topSpendersToday = res;
    });
  }

  formatDateInTimeZone(dateString: string, timeZone: string): string {
    const date = new Date(dateString);
    const zonedDate = toZonedTime(date, timeZone);
    return format(zonedDate, 'yyyy-MM-dd', { timeZone });
  }

  updateBarChart(labels: string[], sales: number[], expenses: number[], net: number[]) {
    // Adjust expenses and net only for bar height visualization
    const adjustedExpenses = expenses.map((expense, index) => {
      return expense > sales[index] ? sales[index] : expense;
    });
  
    const adjustedNet = net.map((netValue, index) => {
      return netValue > sales[index] ? -1 : (netValue < 0 ? -1 : netValue);
    });
  
    console.log('net', adjustedNet);
  
    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = sales;
      this.chart.data.datasets[1].data = adjustedExpenses;
      this.chart.data.datasets[2].data = adjustedNet;
      this.chart.data.datasets[3].data = expenses; // Add actual expenses for display
      this.chart.data.datasets[4].data = net; // Add actual net for display
      this.chart.update();
    } else {
      this.chart = new Chart('canvas', {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Total Sales',
              data: sales,
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            },
            {
              label: 'Total Expenses',
              data: adjustedExpenses,
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            },
            {
              label: 'Net',
              data: adjustedNet,
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 30,
              },
            },
            tooltip: {
              callbacks: {
                label: function (tooltipItem: any) {
                  const datasetIndex = tooltipItem.datasetIndex;
                  const dataIndex = tooltipItem.dataIndex;
                  if (datasetIndex === 1) { // Adjusted Expenses
                    return `Total Expenses: ${expenses[dataIndex]}`;
                  } else if (datasetIndex === 2) { // Adjusted Net
                    return `Net: ${net[dataIndex]}`;
                  } else {
                    return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
                  }
                }
              }
            },
            datalabels: {
              color: '#fff',
              formatter: (value: any, ctx: any) => {
                return value;
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              }
            },
            y: {
              beginAtZero: true
            }
          }
        },
      });
    }
  }
  
  
  private calculateTotalCups(products: any[]): number {
    return products.reduce((acc, curr) => acc + parseFloat(curr.qty), 0);
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns "YYYY-MM-DD"
  }
}
