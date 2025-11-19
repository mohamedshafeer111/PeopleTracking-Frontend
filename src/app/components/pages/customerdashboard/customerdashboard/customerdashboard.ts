import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-customerdashboard',
  imports: [RouterModule,CommonModule,FormsModule],
  templateUrl: './customerdashboard.html',
  styleUrl: './customerdashboard.css'
})
export class Customerdashboard {

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


}
