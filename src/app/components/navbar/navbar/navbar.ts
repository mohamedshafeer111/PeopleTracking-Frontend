import { CommonModule } from '@angular/common';
import { Component,ElementRef,HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule,CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
   userid: string = '';

  ngOnInit() {
    this.userid = localStorage.getItem('userid') || '';
  }

  menuOpen = false;

constructor(private router: Router, private eRef: ElementRef) {}


  isAdminMenuOpen = false;

  toggleAdminMenu() {
    this.isAdminMenuOpen = !this.isAdminMenuOpen;

    if (this.isAdminMenuOpen) {
    this.isTrackingMenuOpen = false; // close tracking if admin opens
  }


  }
  isSidebarCollapsed = false;

  toggleSidebar() {
    console.log("click")
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
   
  }

closeAdminMenu() {
  this.isAdminMenuOpen = false;
}


isTrackingMenuOpen = false;
isLiveOpen = false;
isHistoricalsOpen = false;

toggleTrackingMenu() {
  this.isTrackingMenuOpen = !this.isTrackingMenuOpen;
  if (!this.isTrackingMenuOpen) {
    this.isLiveOpen = false;
    this.isHistoricalsOpen = false;
  }
  if (this.isTrackingMenuOpen) {
    this.isAdminMenuOpen = false; // close admin if tracking opens
  }
}

// Close submenu when clicking a nested link
toggleLiveMenu() {
  this.isLiveOpen = !this.isLiveOpen;
  this.isHistoricalsOpen = false; // optional: close the other nested menu
  this.isTrackingMenuOpen = false; // close parent submenu
}

toggleHistoricalsMenu() {
  this.isHistoricalsOpen = !this.isHistoricalsOpen;
  this.isLiveOpen = false; // optional: close the other nested menu
  this.isTrackingMenuOpen = false; // close parent submenu
}

closeTrackingMenu() {
  this.isTrackingMenuOpen = false;
  this.isLiveOpen = false;
  this.isHistoricalsOpen = false;
}






 // ✅ Close when clicking outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;


    // ✅ Ignore clicks on menu icon
  if (target.closest('.menu-icon')) {
    return;
  }

    // If click is outside sidebar or submenu
    if (!target.closest('.menu-item')) {
      this.closeTrackingMenu();
       this.closeAdminMenu();
    }
  }


















toggleDropdown(event: Event) {
  event.stopPropagation(); 
  this.menuOpen = !this.menuOpen;
}

@HostListener('document:click')
clickOutside() {
  this.menuOpen = false;
}

goToProfile() {
  this.router.navigate(['/profile']);
}

changePassword() {
  this.router.navigate(['/change-password']);
}

openHelp() {
  this.router.navigate(['/help']);
}

logout() {
  localStorage.clear();
  this.router.navigate(['/login']);
}







}





