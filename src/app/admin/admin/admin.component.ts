import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  @HostListener('window: resize', ['$event'])
  onResize(event: any) {
    this.isMobile = this.getIsMobile();
  }

  isMobile = false;
  isOpen: boolean = false;

  ngOnInit(): void {
    this.isMobile = this.getIsMobile();
    window.onresize = () => {
      this.isMobile = this.getIsMobile();
    };
  }

  getIsMobile(): boolean {
    const w = document.documentElement.clientWidth;
    const breakpoint = 992;
    console.log(w);
    if (w < breakpoint) {
      return true;
    } else {
      return false;
    }
  }

  toggleDrawer() {
    this.isOpen = !this.isOpen;
  }
}
