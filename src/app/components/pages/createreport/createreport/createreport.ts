import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Reportservice } from '../../../service/reports/reportservice';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-createreport',
  imports: [RouterModule,FormsModule,CommonModule],
  templateUrl: './createreport.html',
  styleUrl: './createreport.css'
})
export class Createreport implements OnInit {


  constructor(
    private reportService: Reportservice,
    private cdr: ChangeDetectorRef
  ) {}



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

  if (report.id && typeof report.id === 'string') {
    this.reportService.DeleteReport(report.id).subscribe({
      next: () => {
        alert("Report deleted successfully.");

        // Remove from list
        this.reports.splice(index, 1);

        // Refresh UI immediately
        this.reports = [...this.reports];

        // 🔥 Force Angular to update view
        this.cdr.detectChanges();

        localStorage.setItem('reports', JSON.stringify(this.reports));
      },
      error: (err) => {
        console.error("Backend delete failed:", err);

        alert("Failed to delete from server, removing locally.");

        this.reports.splice(index, 1);

        this.reports = [...this.reports];

        // 🔥 Force Angular to update UI
        this.cdr.detectChanges();

        localStorage.setItem('reports', JSON.stringify(this.reports));
      }
    });
  } else {

    this.reports.splice(index, 1);
    this.reports = [...this.reports];

    // 🔥 UI update
    this.cdr.detectChanges();

    localStorage.setItem('reports', JSON.stringify(this.reports));
    alert("Report deleted locally.");
  }
}




  //   ✅ ADD THIS METHOD
  // deleteReport(index: number) {
  //   this.reports.splice(index, 1);
  //   localStorage.setItem('reports', JSON.stringify(this.reports));
  // }


// deleteReport(id: string) {
//   if (!confirm("Are you sure you want to delete this report?")) return;

//   this.reportService.DeleteReport(id).subscribe({
//     next: () => {
//       alert("Report deleted successfully.");

//       // Refresh list after delete (optional)
//       // this.loadReports();
//     },
//     error: (err) => {
//       console.error("Delete error:", err);
//       alert("Failed to delete report.");
//     }
//   });
// }

//   viewReport(report: any) {
//   localStorage.setItem('selectedReport', JSON.stringify(report));
// }

}
