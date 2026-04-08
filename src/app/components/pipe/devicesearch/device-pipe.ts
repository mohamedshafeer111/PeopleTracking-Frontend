import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'device'
})
export class DevicePipe implements PipeTransform {

transform(devices: any[], searchText: string): any[] {
    if (!devices || !searchText) return devices;

    searchText = searchText.toLowerCase();

    return devices.filter(device =>
      (device.deviceName?.toLowerCase().includes(searchText)) ||
      (device.uniqueId?.toLowerCase().includes(searchText)) ||
      (device.deviceType?.toLowerCase().includes(searchText)) ||
      (device.projectName?.toLowerCase().includes(searchText)) ||
      (device.countryName?.toLowerCase().includes(searchText)) ||
      (device.zoneName?.toLowerCase().includes(searchText))
    );
  }

}
