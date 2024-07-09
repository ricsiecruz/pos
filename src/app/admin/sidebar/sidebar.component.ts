import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ExpensesService } from '../../services/expenses.service';
import { NavigationEnd, Router } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() isOpen = false; // Input to receive isOpen value from parent
  @Output() menuClicked = new EventEmitter<void>();

  credit_count: number = 0;
  inventory: number = 0;

  constructor(
    private inventoryService: InventoryService,
    private expensesService: ExpensesService,
    private router: Router
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Close the sidebar when navigating
        this.isOpen = false;
      }
    });

    this.inventoryService.inventory$.subscribe((inventory: any[]) => {
      if (inventory && inventory.length > 0) {
        this.inventory = inventory[0].low;
      }
    });

    this.expensesService.getExpenses().subscribe((res: any) => {
      this.credit_count = res.total_credit_amount.creditCount;
    });
  }

  onMenuClick() {
    this.menuClicked.emit();
  }
}
