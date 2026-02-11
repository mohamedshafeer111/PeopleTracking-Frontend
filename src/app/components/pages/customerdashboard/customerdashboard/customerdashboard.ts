import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { User } from '../../../service/user/user';

@Component({
  selector: 'app-customerdashboard',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './customerdashboard.html',
  styleUrl: './customerdashboard.css'
})
export class Customerdashboard {





  constructor(private userService: User, private cdr: ChangeDetectorRef ) { }





  ngOnInit(): void {
  this.loadTechnologyByCount();
}



  isAddWidgetPopup: boolean = false;

  openAddWidgetPopup() {
    this.isAddWidgetPopup = true;
  }
  closeAddWidgetPopup() {
    this.isAddWidgetPopup = false;
  }


  personalWidgets = [
    { name: 'Top Zone', selected: false },
    { name: 'Peak Time', selected: false },
    { name: 'Peak Day', selected: false },
    { name: 'Total Visitors', selected: false },
    { name: 'Total Employees', selected: false },
    { name: 'Total Contractors', selected: false },
    { name: 'Number of Appearances', selected: false },
    { name: 'Number of Bounced Visitors', selected: false },
    { name: 'Visitors Bounce Rate', selected: false },
    { name: 'Unique Visitors', selected: false },
    { name: 'Repeat Visitors', selected: false },
    { name: 'Male Visitors', selected: false },
    { name: 'Female Visitors', selected: false },
  ];





















  // 7-2-26





  technologyCount: any[] = [];
  isTechnologyLoading = false;

  
loadTechnologyByCount() {
  this.isTechnologyLoading = true;

  this.userService.technologyByCount().subscribe({
    next: (res: any) => {
      console.log('📊 Technology count response:', res);

      // ✅ Bind API data
      this.technologyCount = res?.data || [];

      this.isTechnologyLoading = false;

      // ✅ FORCE UI UPDATE
      this.cdr.detectChanges();
    },
    error: (err: any) => {
      console.error('❌ Error loading technology count', err);
      this.isTechnologyLoading = false;

      // ✅ Ensure UI updates even on error
      this.cdr.detectChanges();
    }
  });
}





// 9-2-26










// Asset details popup
  isAssetDetailsPopup: boolean = false;
  selectedTechnology: string = '';
  assetDetails: any[] = [];
  assetDetailsLoading: boolean = false;

  openAssetDetailsPopup(technology: string) {
    this.selectedTechnology = technology;
    this.isAssetDetailsPopup = true;
    this.loadAssetsByTechnology(technology);
  }

  closeAssetDetailsPopup() {
    this.isAssetDetailsPopup = false;
    this.assetDetails = [];
    this.selectedTechnology = '';
  }

  loadAssetsByTechnology(technology: string) {
    this.assetDetailsLoading = true;

    this.userService.getAssetByTechnology(technology).subscribe({
      next: (res: any) => {
        console.log('📦 Assets by technology response:', res);
        this.assetDetails = res?.data || [];
        this.assetDetailsLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error loading assets by technology', err);
        this.assetDetailsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }




}
