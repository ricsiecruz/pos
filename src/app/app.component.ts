import { Component } from '@angular/core';
import { AppService } from './app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'pos-new';

  constructor(
    private appService: AppService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('ey')
    this.appService.checkIp().subscribe(
      response => {
        console.log('===================')
      },
      error => {
        // this.message = `Access denied: ${error.error}`;
        this.router.navigate(['/access']); // Redirect to access-denied component
      }
    );
  }
}
