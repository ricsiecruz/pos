import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
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
    return w < breakpoint;
  }

  toggleDrawer() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
  }

  closeSidebar() {
    this.isOpen = false;
    document.body.classList.remove('no-scroll');
  }
}
