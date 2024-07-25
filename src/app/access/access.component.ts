import { Component } from '@angular/core';
import { AppService } from '../app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-access',
  templateUrl: './access.component.html',
  styleUrl: './access.component.scss'
})
export class AccessComponent {

  constructor(
    private appService: AppService,
    private router: Router
  ) {}

  ngOnInit() {
    this.appService.checkIp().subscribe(
      response => {
        console.log('===================')
        this.router.navigate(['/admin/sales']);
      },
      error => {
        // this.message = `Access denied: ${error.error}`;
        this.router.navigate(['/access']); // Redirect to access-denied component
      }
    );
  }

}
