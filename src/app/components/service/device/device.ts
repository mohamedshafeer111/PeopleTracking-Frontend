import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Device {
  
constructor(private http: HttpClient) { }

  private baseUrl = 'http://172.16.100.26:5202/api';

  getDevicesByProject(projectId: string) {
    return this.http.get(`${this.baseUrl}/deviceadd/project/${projectId}`)
  }

  getDevicesByCountry(projectId: string, countryId: string) {
    return this.http.get(`${this.baseUrl}/deviceadd/project/${projectId}/country/${countryId}`)
  }

  getDevicesByArea(projectId: string, countryId: string, areaId: string) {
    return this.http.get(`${this.baseUrl}/deviceadd/project/${projectId}/country/${countryId}/area/${areaId}`)
  }

  getDevicesByBuilding(projectId: string, countryId: string, areaId: string, buildingId: string) {
    return this.http.get(`${this.baseUrl}/deviceadd/project/${projectId}/country/${countryId}/area/${areaId}/building/${buildingId}`);
  }
 getDevicesByFloor(projectId: string, countryId: string, areaId: string, buildingId: string, floorId: string) {
    return this.http.get(`${this.baseUrl}/deviceadd/project/${projectId}/country/${countryId}/area/${areaId}/building/${buildingId}/floor/${floorId}`);
  }
getDevicesByZone(
  projectId: string,
  countryId: string,
  areaId: string,
  buildingId: string,
  floorId: string,
  zoneId: string
) {
  const url = `http://172.16.100.26:5202/api/deviceadd/project/${projectId}/country/${countryId}/area/${areaId}/building/${buildingId}/floor/${floorId}/zone/${zoneId}`;
  return this.http.get(url);
}



getAllDeviceParameters() {
  const url = 'http://172.16.100.26:5202/api/device-parameters/all';
  return this.http.get(url);
}

addNewPara(payload: any) {
  return this.http.post(`${this.baseUrl}/device-parameters/create`, payload);
}

updateDeviceParametersById(id:string,payload:any){
  return this.http.put(`${this.baseUrl}/device-parameters/update/${id}`,payload)
}

deleteDevicePara(id:string){
  return this.http.delete(`${this.baseUrl}/device-parameters/delete/${id}`, { responseType: 'text' })
}


getDeviceParametersByDeviceId(deviceId: string) {
  return this.http.get(`${this.baseUrl}/device-parameters/bydevice/${deviceId}`);
}

getAllZoneSensors(){
    return this.http.get(`${this.baseUrl}/zonesensor/all`)
  }

  createZoneSensor(payload: any) {
    return this.http.post(`${this.baseUrl}/zonesensor/create`, payload);
  }


  private apiUrl = "http://172.16.100.26:5202/api/ZoneMapping";

  saveZoneMapping(data: any) {
    return this.http.post(this.apiUrl, data);
  }


  getZoneMappingById(zoneId: string) {
  return this.http.get(`${this.baseUrl}/ZoneMapping/by-zone/${zoneId}`);
}

// device.service.ts
saveDeviceGeoJson(payload: any) {
  return this.http.post(`http://172.16.100.26:5202/api/DeviceGeoJsonMapping`, payload);
}
 

getZoneMapping(zoneId: string) {
  return this.http.get(`http://172.16.100.26:5202/api/DeviceGeoJsonMapping/zone/${zoneId}`);
}


getZoneMappingByFloor(floorId: string) {
  return this.http.get<any[]>(`${this.baseUrl}/ZoneMapping/by-Floor/${floorId}`);
}

getZoneImageByZoneId(zoneId: string) {
  return this.http.get(`http://172.16.100.26:5202/api/zones/${zoneId}/map`);
}

getDevicesByZoneId(zoneId: string) {
  return this.http.get(`${this.baseUrl}/deviceadd/by-zone/${zoneId}`);
}

getDeviceGeoJsonByFloor(floorId: string) {
  return this.http.get(`${this.baseUrl}/DeviceGeoJsonMapping/Floor/${floorId}`);
}


}
