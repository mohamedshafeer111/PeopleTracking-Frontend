import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class Reportservice {

  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  // downloadReport() {
  //   return this.http.get(`${this.apiUrl}BleTimeReport/download`)
  // }


//   downloadReport(reportId: string) {
//   return this.http.get(`${this.apiUrl}BleTimeReport/download/${reportId}`, {
//     responseType: 'blob'
//   });
// }






  private reports: any[] = [];

  addReport(report: any) {
    this.reports.push(report);
  }

  getReports() {
    return this.reports;
  }






  // ✅ reportservice.ts
  getGenerateReport(startTime: string, endTime: string, reportName: string) {
    const params: any = {
      startTime,
      endTime,
      reportName
    };

    return this.http.get(`${this.apiUrl}Reports/generate`, { params });
  }


  getGenerateReportZone(startTime: string, endTime: string, zoneName: string, reportName: string) {
    const params = { startTime, endTime, zoneName, reportName };
    return this.http.get(`${this.apiUrl}Reports/generate/zone`, { params });
  }



  getReportByID(id: string, page: number = 1, pageSize: number = 100) {
    const params = { page, pageSize };
    return this.http.get(`${this.apiUrl}Reports/${id}/full`, { params });
  }


  DeleteReport(id: string) {
    return this.http.delete(`${this.apiUrl}Reports/${id}`);
  }


}
