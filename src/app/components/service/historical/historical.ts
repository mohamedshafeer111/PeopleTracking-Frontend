import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class Historical {

  constructor(private http:HttpClient){}

  private baseUrl = environment.apiUrl;

  getHistorical(){
    return this.http.get(`${this.baseUrl}Asset/asset-device-history`)
  }
   
  getOverviw(assetId:any){
    return this.http.get(`${this.baseUrl}Reports/by-device?id=${assetId}`)
  }
  
  getZone(){
    return this.http.get(`${this.baseUrl}zones/all`)
  }

  getZoneDetailsBasedOnFilter(zoneId:string,startDate:string,endDate:string){
    return this.http.get(`${this.baseUrl}Reports/zone/events?zoneId=${zoneId}&startDate=${startDate}$endDate=${endDate}`)
  }
}
