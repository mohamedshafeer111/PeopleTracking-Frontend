import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Reportservice } from '../../../service/reports/reportservice';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-createreport',
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './createreport.html',
  styleUrl: './createreport.css'
})
export class Createreport implements OnInit {


  constructor(
    private reportService: Reportservice, private cdr: ChangeDetectorRef) { }



  frequency = {
    monthly: false,
    weekly: false,
    daily: false,
    once: false
  };
  selectedFrequency: string = '';
  // ✅ Declare reports property to remove the warning


  ngOnInit() {
    const savedReports = localStorage.getItem('reports');
    this.reports = savedReports ? JSON.parse(savedReports) : [];
  }
  reports: any[] = [];



  deleteReport(index: number) {
    const report = this.reports[index];
    if (!report) return;

    if (!confirm("Are you sure you want to delete this report?")) return;

    // support id OR _id
    const id = report.id || report._id;

    if (!id) {
      alert("No valid report ID found.");
      return;
    }

    this.reportService.DeleteReport(id).subscribe({
      next: () => {

        alert("Report deleted successfully.");

        // remove from list only on success
        this.reports.splice(index, 1);
        this.reports = [...this.reports];

        // 🔥 Force Angular UI refresh
        this.cdr.detectChanges();

        localStorage.setItem('reports', JSON.stringify(this.reports));
      },

      error: (err) => {
        console.error("Delete failed:", err);
        alert("Server delete failed. Report was NOT removed from list.");
      }
    });
  }







  showColumnPicker = false;

  columns = [
    { key: 'slno', label: 'Sl No', visible: true },
    { key: 'reportName', label: 'Reports', visible: true },
    { key: 'timeRange', label: 'Time Range', visible: true },
    { key: 'recurrence', label: 'Recurrence', visible: true },
    { key: 'createdOn', label: 'Created On', visible: true },
    { key: 'template', label: 'Type', visible: true },
    { key: 'shareWith', label: 'Share With', visible: true },
    // { key: 'action', label: 'Action', visible: true }
  ];

  toggleColumnPicker() {
    this.showColumnPicker = !this.showColumnPicker;
  }



  startDate: string = '';
  endDate: string = '';

  reportList: any[] = [];

  createPersonReport() {

    const reqBody = {
      startDate: this.startDate,
      endDate: this.endDate
    };

    this.reportService.createReport(reqBody).subscribe({
      next: (res: any) => {
        console.log(res);
        this.reportList = res;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log(err);
      }
    });

  }

downloadCSV(): void {

  if (!this.reportList || this.reportList.length === 0) {
    return;
  }

  const headers = [
    'Person ID',
    'Person Name',
    'Check In',
    'Check Out',
    'Time Spent (Minutes)'
  ];

  const rows = this.reportList.map((report: any) => [
    report.personId,
    report.personName,
    report.checkIn,
    report.checkOut,
    report.timeSpentMinutes
  ]);

  const csvContent =
    [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;'
  });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'employee-report.csv');

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

}
