import { Component } from '@angular/core';
import { AppService } from '../app.service';

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.scss'
})
export class PosComponent {

  drinks: any[] = [];

  constructor(private appService: AppService) {}

  ngOnInit() {
    this.appService.getProducts().subscribe((res: any) => {
      this.drinks = res;
    })
  }

}
