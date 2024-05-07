import { Component } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent {

  inventory: any[] = [];

  constructor(private appService: AppService) {}

  ngOnInit() {
    this.appService.getInventory().subscribe((res: any) => {
      console.log('res', res)
      this.inventory = res;
    })
  }

}
