import { Component } from '@angular/core';
import { SalesService } from '../../services/sales.service';
import { ExpensesService } from '../../services/expenses.service';
import { DashboardService } from '../../services/dashboard.service';
import Chart from 'chart.js/auto';
import 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  mostOrdered: any[] = [];
  products: any[] = [];
  expenses: any[] = [];
  totalSalesSum: number = 0;
  totalExpenses: number = 0;
  net: number = 0;
  totalCups: number = 0;
  
  chart: any;

  constructor(
    private dashboardService: DashboardService,
    private salesService: SalesService,
    private expensesService: ExpensesService
  ) {}

  ngOnInit() {
    this.salesService.sales$.subscribe((products: any) => {
      if (products && products.length > 0) {
        this.totalCups = this.calculateTotalCups(products);
      }
    });

    this.expensesService.expenses$.subscribe((products: any) => {
      if (products && products.length > 0) {
        this.expenses = products;
        this.totalExpenses = this.calculateTotalExpenses(products);
      }
    });

    this.salesService.getTotalSalesSum().subscribe(
      totalSum => {
        this.totalSalesSum = totalSum;
        this.net = this.totalSalesSum - this.totalExpenses;
        // this.updateBarChart();
      },
      error => {
        console.error('Error fetching total sales sum:', error);
      }
    );

    this.dashboardService.products$.subscribe(
      (data: any) => {
        if (data && data.length > 0 && data[0]) {
          this.mostOrdered = data[0].mostOrdered;
        }
      },
      error => {
        console.error('Error fetching most ordered products:', error);
      }
    );

    this.dashboardService.getStat().subscribe(
      (stats: any[]) => {
        if (stats && stats.length > 0) {
          // Transform stats into suitable format for the chart
          const dates = stats.map(stat => this.formatDate(stat.date)); // Format date here
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
  }

  updateBarChart(labels: string[], sales: number[], expenses: number[], net: number[]) {
    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = sales;
      this.chart.data.datasets[1].data = expenses;
      this.chart.data.datasets[2].data = net;
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
              data: expenses,
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1
            },
            {
              label: 'Net',
              data: net,
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 30,
              },
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

  private calculateTotalExpenses(products: any[]): number {
    return products.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  }

  private calculateTotalCups(products: any[]): number {
    return products.reduce((acc, curr) => acc + parseFloat(curr.qty), 0);
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns "YYYY-MM-DD"
  }
}
