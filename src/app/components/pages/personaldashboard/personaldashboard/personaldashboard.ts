import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-personaldashboard',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './personaldashboard.html',
  styleUrl: './personaldashboard.css'
})
export class Personaldashboard {



   isAddWidgetPopup: boolean = false;

  openAddWidgetPopup() {
    this.isAddWidgetPopup = true;
  }
  closeAddWidgetPopup() {
    this.isAddWidgetPopup = false;
  }


   personalWidgets = [
    { name: 'Worked This Week', selected: false },
    { name: 'Worked Today', selected: false },
    { name: 'Battery Status', selected: false },
    { name: 'Type of People', selected: false },
    { name: 'Building and Floor', selected: false },
    { name: 'Average Hours / Member', selected: false },
    { name: 'Field Status', selected: false },
    { name: 'Total No.of Zone', selected: false },
    { name: 'Recent Activity', selected: false },
    { name: 'Projects', selected: false },
    { name: 'Alerts', selected: false },
    { name: 'Time Sheet', selected: false },
    { name: 'Man Down', selected: false },
    { name: 'Reader Status', selected: false },
    { name: 'Reader Type', selected: false },
    { name: 'SOS', selected: false },
    { name: 'Evacuation and Mustering', selected: false },
    { name: 'Top Exit Point', selected: false }
  ];

}
