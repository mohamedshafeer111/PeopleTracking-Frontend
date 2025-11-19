import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-overview',
  imports: [RouterModule, CommonModule,FormsModule],
  templateUrl: './overview.html',
  styleUrl: './overview.css'
})
export class Overview {

    selectedItemId: string | number | null = null; // to store the clicked item's ID


selectItem(id: string | number) {
  this.selectedItemId = id;
}


hours: string[] = [];
selectedTimeRange = 'day';
selectedHour = 'Live';

ngOnInit() {
  this.setDefaultHours();
}

onTimeRangeChange() {
  this.setDefaultHours();
}

setDefaultHours() {
  switch (this.selectedTimeRange) {
    case 'day':
      this.hours = ['Live', '1 Hour', '2 Hours', '8 Hours', '24 Hours'];
      break;
    case 'week':
      this.hours = ['1 Day', '2 Days', '5 Days', '7 Days'];
      break;
    case 'month':
      this.hours = ['1 Week', '2 Weeks', '3 Weeks', '4 Weeks'];
      break;
    default:
      this.hours = [];
  }

  // Set default selected hour
  this.selectedHour = this.hours[0] || '';
}

selectHour(hour: string) {
  this.selectedHour = hour;
  console.log('Selected Hour:', hour);
}



}
