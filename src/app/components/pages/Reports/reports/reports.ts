import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Roleservice } from '../../../service/role/roleservice';
import { Reportservice } from '../../../service/reports/reportservice';

@Component({
  selector: 'app-reports',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class Reports implements OnInit {

  activeTab: string = 'project'; // 👈 default tab
  selectedTimeRange: string = 'day';


  constructor(private role: Roleservice, private cdr: ChangeDetectorRef, private api: Reportservice, private router: Router) { }

  ngOnInit(): void {
    this.selectedTimeRange = 'day';
    this.loadProject();
    this.setDefaultHours();
  }

  // ... rest of your code unchanged ...






  projects: any[] = [];

  loadProject() {
    this.role.getProject().subscribe({
      next: (res: any) => {
        this.projects = res;
        this.cdr.detectChanges();

      },
      error: () => {
        console.log("error loading project")
      }
    })
  }



  countriesByProject: { [projectId: string]: any[] } = {};
  expandedProjects: Set<string> = new Set();

  toggleProject(projectId: string) {
    if (this.expandedProjects.has(projectId)) {
      this.expandedProjects.delete(projectId);
    } else {
      this.expandedProjects.add(projectId);
      this.loadCountries(projectId);
    }
  }

  loadCountries(projectId: string) {
    if (this.expandedProjects.has(projectId)) {
      this.expandedProjects.delete(projectId);
      return;
    }

    this.role.countryGetById(projectId).subscribe({
      next: (res: any) => {
        this.countriesByProject[projectId] = Array.isArray(res) ? res : [];
        this.expandedProjects.add(projectId);
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("Error loading countries");
      }
    });
  }

  areaByCountry: { [countryId: string]: any[] } = {};
  expandedCountry: Set<string> = new Set();
  toggleCountry(countryId: string) {
    if (this.expandedCountry.has(countryId)) {
      this.expandedCountry.delete(countryId);
    } else {
      this.expandedCountry.add(countryId);
      this.loadArea(countryId);
    }
  }


  loadArea(countryId: string) {
    if (this.expandedCountry.has(countryId)) {
      this.expandedCountry.delete(countryId);
      return;
    }

    if (!this.areaByCountry[countryId]) {
      this.role.getSummary(countryId).subscribe({
        next: (res: any) => {
          this.areaByCountry[countryId] = Array.isArray(res) ? res : [];
          this.expandedCountry.add(countryId);
          this.cdr.detectChanges();
        },
        error: () => {
          console.log("Error loading areas");
        }
      });
    } else {
      this.expandedCountry.add(countryId);
      this.cdr.detectChanges();
    }
  }


  buildingByArea: { [areaId: string]: any[] } = {};
  expandedArea: Set<string> = new Set(); // track open dropdowns

  toggleArea(areaId: string) {
    if (this.expandedArea.has(areaId)) {
      this.expandedArea.delete(areaId);
    } else {
      this.expandedArea.add(areaId);
      this.loadBuilding(areaId);
    }
  }


  loadBuilding(areaId: string) {
    if (this.expandedArea.has(areaId)) {
      this.expandedArea.delete(areaId);
      return;
    }

    this.role.getBuilding(areaId).subscribe({
      next: (res: any) => {
        this.buildingByArea[areaId] = Array.isArray(res) ? res : [];
        this.expandedArea.add(areaId);
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("Error loading building");
      }
    });
  }


  floors: any[] = [];
  floorByBuilding: { [buildingId: string]: any[] } = {};
  expandedBuilding: Set<string> = new Set();

  toggleBuilding(buildingId: string) {
    if (this.expandedBuilding.has(buildingId)) {
      this.expandedBuilding.delete(buildingId);
    } else {
      this.expandedBuilding.add(buildingId);
      this.loadFloor(buildingId);
    }
  }

  loadFloor(buildingId: string) {
    if (this.expandedBuilding.has(buildingId)) {
      this.expandedBuilding.delete(buildingId);
      return;
    }
    this.role.getFloor(buildingId).subscribe({
      next: (res: any) => {
        console.log("Floors for building:", buildingId, res);
        this.floors = res;
        this.floorByBuilding[buildingId] = Array.isArray(res) ? res : [];
        this.expandedBuilding.add(buildingId);
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("Error loading floor");
      }
    });
  }



  zones: any[] = [];
  zoneByFloor: { [floorId: string]: any[] } = {};
  expandedFloor: Set<string> = new Set();

  toggleFloor(floorId: string) {
    if (this.expandedFloor.has(floorId)) {
      this.expandedFloor.delete(floorId);
    } else {
      this.expandedFloor.add(floorId);
      this.loadZones(floorId);
    }
  }

  loadZones(floorId: string) {
    if (this.expandedFloor.has(floorId)) {
      this.expandedFloor.delete(floorId);
      return;
    }
    this.role.getZones(floorId).subscribe({
      next: (res: any) => {
        console.log("Zones for floor:", floorId, res);
        this.zones = res;
        this.zoneByFloor[floorId] = Array.isArray(res) ? res : [];
        this.expandedFloor.add(floorId);
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("Error loading zones");
      }
    });
  }


  subZones: any[] = [];
  subZoneByZone: { [zoneId: string]: any[] } = {};
  expandedZone: Set<string> = new Set();

  toggleZone(zoneId: string) {
    if (this.expandedZone.has(zoneId)) {
      this.expandedZone.delete(zoneId);
    } else {
      this.expandedZone.add(zoneId);
      this.loadSubZones(zoneId);
    }
  }

  loadSubZones(zoneId: string) {
    if (this.expandedZone.has(zoneId)) {
      this.expandedZone.delete(zoneId);
      return;
    }
    this.role.getSubZones(zoneId).subscribe({
      next: (res: any) => {
        console.log("SubZones for zone:", zoneId, res);
        this.subZones = res;
        this.subZoneByZone[zoneId] = Array.isArray(res) ? res : [];
        this.expandedZone.add(zoneId);
        this.cdr.detectChanges();
      },
      error: () => {
        console.error("Error loading subzones");
      }
    });
  }

  selectedItemId: string | number | null = null; // to store the clicked item's ID

  selectItem(id: string | number) {
    this.selectedItemId = id;
  }




  hours: string[] = [];
  selectedHour = 'Live';

  reportName = '';
  selectedTemplate = '';
  selectedFormat = 'URL';
  includeCSV = false;

  recurrence = 'Once';
  shareEmails = '';

  // 🆕 For custom date range
  customStartDate: string = '';
  customEndDate: string = '';
  isCustomStartFocused: boolean = false;
isCustomEndFocused: boolean = false;


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
      case 'custom':
        this.hours = []; // hide hour buttons for custom
        this.selectedHour = '';
        break;
      default:
        this.hours = [];
    }

    if (this.selectedTimeRange !== 'custom') {
      this.selectedHour = this.hours[0];
      this.customStartDate = '';
      this.customEndDate = '';
    }
  }

  cancel() {
    this.reportName = '';
    this.selectedTemplate = '';
    this.selectedFormat = 'URL';
    this.includeCSV = false;
    this.recurrence = 'Once';
    this.shareEmails = '';
    this.selectedTimeRange = 'day';
    this.setDefaultHours();
  }


















selectedZoneName: string | null = null;
 // ✅ Keep this inside the class
  private saveReport(reportDetails: any) {
    const existingReports = JSON.parse(localStorage.getItem('reports') || '[]');
    existingReports.push(reportDetails);
    localStorage.setItem('reports', JSON.stringify(existingReports));
    console.log('Saved report:', reportDetails);
  }


generateReport() {
  if (this.selectedTimeRange === 'custom') {
    // 🛑 Validate required fields
    if (!this.customStartDate || !this.customEndDate) {
      alert('⚠️ Please select both From and To dates before generating a report.');
      return;
    }

    if (!this.reportName || this.reportName.trim() === '') {
      alert('⚠️ Please enter a report name.');
      return;
    }

    // ✅ Decide which API to call
    let apiCall;
    if (this.selectedZoneName) {
      // Zone-based report
      apiCall = this.api.getGenerateReportZone(
        this.customStartDate,
        this.customEndDate,
        this.selectedZoneName,
        this.reportName
      );
      console.log('📡 Calling Zone Report API with zone:', this.selectedZoneName);
    } else {
      // General report
      apiCall = this.api.getGenerateReport(
        this.customStartDate,
        this.customEndDate,
        this.reportName
      );
      console.log('📡 Calling General Report API');
    }

    // ✅ Subscribe to the chosen API
    apiCall.subscribe({
      next: (res: any) => {
        console.log('Report API Response:', res);

        const reportDetails: any = {
          id: res.id || Date.now(),
          reportName: this.reportName.trim(),
          timeRange: this.selectedTimeRange,
          template: this.selectedTemplate,
          format: this.selectedFormat,
          includeCSV: this.includeCSV,
          recurrence: this.recurrence,
          shareWith: this.shareEmails,
          createdOn: new Date().toLocaleString(),
          customRange: {
            from: this.customStartDate,
            to: this.customEndDate,
          },
          ...(this.selectedZoneName ? { zoneName: this.selectedZoneName } : {})
        };

        // ✅ Save report locally
        this.saveReport(reportDetails);

        if (res && res.visits && res.visits.length > 0) {
          alert(`✅ Report "${this.reportName}" generated successfully!`);
        } else {
          alert(`ℹ️ Report "${this.reportName}" generated.`);
        }

        this.router.navigate(['/createreport']);
      },
      error: (err) => {
        console.error('Error while generating report:', err);
        alert('⚠️ Failed to generate report. Please try again.');
      }
    });

  } else {
    // Handle non-custom (day, week, month)
    if (!this.reportName || this.reportName.trim() === '') {
      alert('⚠️ Please enter a report name.');
      return;
    }

    const reportDetails: any = {
      id: Date.now(),
      reportName: this.reportName.trim(),
      timeRange: this.selectedTimeRange,
      template: this.selectedTemplate,
      format: this.selectedFormat,
      includeCSV: this.includeCSV,
      recurrence: this.recurrence,
      shareWith: this.shareEmails,
      createdOn: new Date().toLocaleString(),
    };

    this.saveReport(reportDetails);
    alert(`✅ Report "${this.reportName}" generated successfully!`);
    this.router.navigate(['/createreport']);
  }
}







selectZone(zone: any) {
  this.selectedItemId = zone.id;
  this.selectedZoneName = zone.zoneName;
  console.log('✅ Selected Zone:', this.selectedZoneName);
}


today: string = new Date().toISOString().split('T')[0];



















  // ADD THIS METHOD
  selectHour(hour: string) {
    this.selectedHour = hour;
  }













  
dailyTime: string = "";
  isDailyTimeFocused: boolean = false;  // ✅ ADD THIS



weeklyDay: string = '';
weeklyTime: string = '';
isWeeklyDayFocused: boolean = false;
isWeeklyTimeFocused: boolean = false;



monthlyDay: number | null = null;
monthlyTime: string = "";
isMonthlyDateFocused: boolean = false;
isMonthlyTimeFocused: boolean = false;


}










