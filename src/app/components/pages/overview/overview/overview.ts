import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Historical } from '../../../service/historical/historical';

@Component({
  selector: 'app-overview',
  imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule],
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

    this.loadZone();
    this.route.queryParams.subscribe(params => {
      const assetId = params['id'];
      if (assetId) {
        this.loadOverview(assetId);
      }
    });


    this.setDefaultHours();

    this.filterForm = this.fb.group({
      fromDate: [''],
      toDate: [''],
      zone: ['Zone A']
    });
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




  filterForm!: FormGroup;

  zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];

  tableData = [
    { name: 'Vishak', zone: 'Zone A', timeOut: '10:55 AM', timeSpend: '00:20:25', timeIn: '10:15 AM' },
    { name: 'Vishak', zone: 'Zone A', timeOut: '11:40 AM', timeSpend: '00:20:25', timeIn: '11:30 AM' },
    { name: 'Vishak', zone: 'Zone A', timeOut: '01:40 PM', timeSpend: '00:20:25', timeIn: '01:10 PM' }
  ];

  constructor(private fb: FormBuilder, private http: HttpClient, private route: ActivatedRoute, private historical: Historical,
    private cdr: ChangeDetectorRef
  ) { }







  overviewData: any[] = [];
  loadOverview(assetId: string) {
    this.historical.getOverviw(assetId).subscribe({
      next: (res: any) => {
        this.overviewData = res;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Failed to load overview:', err);
      }
    });
  }

  zoneList: any[] = [];
  loadZone() {
    this.historical.getZone().subscribe({
      next: (res: any) => {
        this.zoneList = res;
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("error getting Zone")
      }
    })
  }

  applyFilter(){
    this
  }
}


