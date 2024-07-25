import { Component } from '@angular/core';
import { AppService } from '../app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-access',
  templateUrl: './access.component.html',
  styleUrl: './access.component.scss'
})
export class AccessComponent {

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.navigate(['/admin/sales']); 
  }

}
