import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})

export class Peopleservice {


  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getPerson(pageNumber: number = 1, pageSize: number = 10) {
    return this.http.get(`${this.apiUrl}Person/summary?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  }

  createNewPerson(createPerson: any) {
    return this.http.post(`${this.apiUrl}Person/create`, createPerson)
  }



  updatePerson(updatePerson: any, id: string) {
    return this.http.put(`${this.apiUrl}Person/update/${id}`, updatePerson)
  }

  DeletePerson(PersonId: string) {
    return this.http.delete(`${this.apiUrl}Person/delete/${PersonId}`)
  }

  getPersonVisits() {
    return this.http.get(`${this.apiUrl}DeviceEvent/person-visits`)
  }

  getTotalEmployees() {
    return this.http.get(`${this.apiUrl}Person/employees-all`)
  }

  getMalefemaleCount() {
    return this.http.get(`${this.apiUrl}DeviceEvent/gender-count`)
  }

  employeeInCount() {
    return this.http.get(`${this.apiUrl}Person/latest`)
  }
  alertCount() {
    return this.http.get(`${this.apiUrl}Person/latest-beyond-threshold`)
  }
  getTotalVisitor() {
    return this.http.get(`${this.apiUrl}Visitor/unique-in-count`)
  }

  getDeviceEvents() {
    return this.http.get(`${this.apiUrl}DeviceEvent/time-outside`)
  }

}
