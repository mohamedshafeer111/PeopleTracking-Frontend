import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Roleservice } from '../../../service/role/roleservice';
// import L from 'leaflet';
import * as L from 'leaflet';

import { FormsModule } from '@angular/forms';
import { Device } from '../../../service/device/device';
import 'leaflet/dist/leaflet.css'; 

@Component({
  selector: 'app-live',
  imports: [CommonModule, FormsModule],
  templateUrl: './live.html',
  styleUrl: './live.css'
})
export class Live implements OnInit, AfterViewInit {



  constructor(private role: Roleservice, private cdr: ChangeDetectorRef, private device: Device) { }


  selectedTimeRange: string = 'day';
  hours: string[] = [];
  selectedHour: string = '';
  showHourInputs: boolean = false;
  savedMappingId: string = '';
  // hourMap: { [key: string]: number } = {
  //   // 'Live': 0,
  //   '1 Hour': 1,
  //   '2 Hours': 2,
  //   '8 Hours': 8,
  //   '24 Hours': 24,
  //   '1 Day': 24,
  //   '2 Days': 48,
  //   '5 Days': 120,
  //   '7 Days': 168,
  //   '15 Days': 360,
  //   '30 Days': 720
  // };

    hourMap: { [key: string]: number } = {
    // Day options
    // 'Live': 0,
    '1 Hour': 1,
    '2 Hours': 2,
    '8 Hours': 8,
    '24 Hours': 24,

    // Week options
    '1 Day': 1,
    '2 Days': 2,
    '5 Days': 5,
    '7 Days': 7,
    '15 Days': 15,
    '30 Days': 30
  };


  ngOnInit(): void {
    this.loadProject();
    this.setDefaultTimeRange();
    this.savedMappingId = localStorage.getItem("savedMappingId") || "";
    this.connectWebSocket();
  }

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
  private map: any;


  // moveToLocation(lat: number, lng: number, zoom: number = 10, name?: string): void {
  //   if (this.map) {
  //     this.map.flyTo([lat, lng], zoom, { animate: true, duration: 1.5 });
  //     L.marker([lat, lng])
  //       .addTo(this.map)
  //       .bindPopup(name ? `<b>${name}</b>` : `Lat: ${lat}, Lng: ${lng}`)
  //       .openPopup();
  //   }
  // }

moveToLocation(lat: number, lng: number, zoom: number = 10, name?: string): void {
  if (!this.map) return;

  this.map.flyTo([lat, lng], zoom, { animate: true, duration: 1.5 });

  L.marker([lat, lng])
    .addTo(this.map)
    .bindPopup(name ? `<b>${name}</b>` : `Lat: ${lat}, Lng: ${lng}`)
    .openPopup();
}



  // async ngAfterViewInit() {
  //   if (typeof window === 'undefined') return; // skip SSR

  //   // Option 1: Direct approach (recommended)
  //   const L = await import('leaflet');
  //   this.map = L.map('map').setView([13.0827, 80.2707], 13);

  //   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //     maxZoom: 19
  //   }).addTo(this.map);

  //   this.initializeCanvas();
  // }
ngAfterViewInit(): void {
  if (typeof window === 'undefined') return; // SSR safe

  this.map = L.map('map').setView([13.0827, 80.2707], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(this.map);

  this.initializeCanvas();
}

  // Store parent-level coordinates for reverse movement
  locationCache: {
    project?: { lat: number, lng: number, zoom: number, name?: string };
    country?: { lat: number, lng: number, zoom: number, name?: string };
    area?: { lat: number, lng: number, zoom: number, name?: string };
    building?: { lat: number, lng: number, zoom: number, name?: string };
  } = {};

  loadCountries(projectId: string) {
    this.selectedProjectId = projectId;
    if (this.expandedProjects.has(projectId)) {
      this.expandedProjects.delete(projectId);

      // 🧭 Move back to last project location
      const loc = this.locationCache.project;
      if (loc) this.moveToLocation(loc.lat, loc.lng, loc.zoom, loc.name);
      return;
    }

    this.role.countryGetById(projectId).subscribe({
      next: (res: any) => {
        this.countriesByProject[projectId] = Array.isArray(res) ? res : [];

        if (res?.length > 0) {
          const { latitude, longitude, zoomLevel, countryName } = res[0];
          this.locationCache.country = { lat: latitude, lng: longitude, zoom: zoomLevel || 10, name: countryName };
          this.moveToLocation(latitude, longitude, zoomLevel || 10, countryName);
        }

        // Save project location if not already
        if (!this.locationCache.project && res?.length > 0) {
          this.locationCache.project = { lat: res[0].latitude, lng: res[0].longitude, zoom: res[0].zoomLevel || 8, name: res[0].countryName };
        }

        this.activeLevel = 'project';
        this.devicesGetByProjectId(projectId);

        this.expandedProjects.add(projectId);
        this.cdr.detectChanges();
      },
      error: err => console.error("Error loading countries:", err)
    });
  }



  // Cache areas per country
  areaByCountry: { [countryId: string]: any[] } = {};

  expandedCountry: Set<string> = new Set();

  loadArea(countryId: string) {
    this.selectedCountryId = countryId;
    if (this.expandedCountry.has(countryId)) {
      this.expandedCountry.delete(countryId);

      // ⬅️ Move back to country location
      const loc = this.locationCache.country;
      if (loc) this.moveToLocation(loc.lat, loc.lng, loc.zoom, loc.name);
      return;
    }

    this.role.getSummary(countryId).subscribe({
      next: (res: any) => {
        this.areaByCountry[countryId] = Array.isArray(res) ? res : [];

        if (res?.length > 0) {
          const { latitude, longitude, zoomLevel, areaName } = res[0];
          this.locationCache.area = { lat: latitude, lng: longitude, zoom: zoomLevel || 10, name: areaName };
          this.moveToLocation(latitude, longitude, zoomLevel || 10, areaName);
        }
        this.activeLevel = 'country';
        this.devicesGetByCountryId(this.selectedProjectId, countryId);


        this.expandedCountry.add(countryId);
        this.cdr.detectChanges();
      },
      error: () => console.error("Error loading areas")
    });
  }


  // Store building per area
  buildingByArea: { [areaId: string]: any[] } = {};

  expandedArea: Set<string> = new Set();

  loadBuilding(areaId: string) {
    this.selectedAreaId = areaId;
    if (this.expandedArea.has(areaId)) {
      this.expandedArea.delete(areaId);

      // ⬅️ Move back to area
      const loc = this.locationCache.area;
      if (loc) this.moveToLocation(loc.lat, loc.lng, loc.zoom, loc.name);
      return;
    }

    this.role.getBuilding(areaId).subscribe({
      next: (res: any) => {
        this.buildingByArea[areaId] = Array.isArray(res) ? res : [];

        if (res?.length > 0) {
          const { latitude, longitude, zoomLevel, buildingName } = res[0];
          this.locationCache.building = { lat: latitude, lng: longitude, zoom: zoomLevel || 10, name: buildingName };
          this.moveToLocation(latitude, longitude, zoomLevel || 10, buildingName);
        }

        this.activeLevel = 'area';
        this.devicesGetByAreaId(this.selectedProjectId, this.selectedCountryId, areaId);


        this.expandedArea.add(areaId);
        this.cdr.detectChanges();
      },
      error: () => console.error("Error loading building")
    });
  }

  floors: any[] = [];
  floorByBuilding: { [buildingId: string]: any[] } = {};
  expandedBuilding: Set<string> = new Set();
  floorImage: string | null = null;
  zoneImage: string | null = null;
  subZoneImage: string | null = null;




  loadFloor(buildingId: string) {
    // 🟡 Collapse logic (reverse)
    this.selectedBuildingId = buildingId;
    if (this.expandedBuilding.has(buildingId)) {
      this.expandedBuilding.delete(buildingId);
      this.floorImage = null;
      this.clearPolygons();

      // 🔁 Move map back to building's location
      for (const areaBuildings of Object.values(this.buildingByArea)) {
        const parentBuilding = (areaBuildings as any[]).find(b => b.id === buildingId);
        if (parentBuilding?.latitude && parentBuilding?.longitude) {
          this.moveToLocation(
            parentBuilding.latitude,
            parentBuilding.longitude,
            parentBuilding.zoomLevel || 10,
            parentBuilding.buildingName
          );
          break; // stop once found
        }
      }

      this.activeLevel = 'building';
      this.devicesGetByBuildingId(
        this.selectedProjectId!,
        this.selectedCountryId!,
        this.selectedAreaId!,
        buildingId
      );

      this.cdr.detectChanges();
      return;
    }

    // 🟢 Expand logic (forward)
    this.role.getFloor(buildingId).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        this.floorByBuilding[buildingId] = data;
        this.expandedBuilding.add(buildingId);

        // 🟢 Show floor image
        this.floorImage = data.length ? data[0].uploadMap : null;
        this.zoneImage = null;
        this.subZoneImage = null;
        this.clearPolygons();

        // 🔁 Move to floor (optional if lat/lng exists)
        if (data.length && data[0].latitude && data[0].longitude) {
          this.moveToLocation(
            data[0].latitude,
            data[0].longitude,
            data[0].zoomLevel || 10,
            data[0].floorName
          );
        }

        this.activeLevel = 'floor';

        // ✅ Use actual floor ID from response
        const floorId = data.length ? data[0].id : null;
        if (floorId) {
          this.devicesGetByFloorId(
            this.selectedProjectId!,
            this.selectedCountryId!,
            this.selectedAreaId!,
            this.selectedBuildingId!,
            floorId
          );
        }

        this.cdr.detectChanges();
      },
      error: () => console.error('Error loading floor'),
    });
  }


  zones: any[] = [];
  zoneByFloor: { [floorId: string]: any[] } = {};
  expandedFloor: Set<string> = new Set();


  loadZones(floorId: string) {
    this.selectedFloorId = floorId;


    // 🟡 COLLAPSE LOGIC (go back from zone → floor)
    if (this.expandedFloor.has(floorId)) {
      this.expandedFloor.delete(floorId);
      this.zoneImage = null;
      this.clearPolygons();

      // 🔁 Restore floor image
      for (const floors of Object.values(this.floorByBuilding)) {
        const parentFloor = (floors as any[]).find(f => f.id === floorId);
        if (parentFloor?.uploadMap) {
          this.floorImage = parentFloor.uploadMap;
          break;
        }
      }

      this.activeLevel = 'floor';

      // ✅ Load devices for this floor (when collapsing zones)
      this.devicesGetByFloorId(
        this.selectedProjectId!,
        this.selectedCountryId!,
        this.selectedAreaId!,
        this.selectedBuildingId!,
        floorId
      );
      this.loadPolygonsByFloor(floorId);
      this.loadDevicesByFloor(floorId);

      this.cdr.detectChanges();
      return;
    }

    // 🟢 EXPAND LOGIC (load zones for floor)
    this.role.getZones(floorId).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : [];

        // 🗂️ Store zones grouped by floor
        this.zoneByFloor[floorId] = data;
        this.zoneByFloor = { ...this.zoneByFloor }; // force change detection

        // ✅ Mark this floor as expanded
        this.expandedFloor.add(floorId);

        // 🖼️ Update map images
        this.zoneImage = data.length ? data[0].uploadMap : null;
        this.floorImage = null;
        this.subZoneImage = null;
        this.clearPolygons();

        // 🏷️ Update active level
        this.activeLevel = 'zone';

        // ✅ Fetch devices for this floor (after zones load)
        this.devicesGetByFloorId(
          this.selectedProjectId!,
          this.selectedCountryId!,
          this.selectedAreaId!,
          this.selectedBuildingId!,
          floorId
        );
        this.loadPolygonsByFloor(floorId);
        
        this.loadDevicesByFloor(floorId);

        this.cdr.detectChanges();

      },
      error: (err) => {
        console.error('Error loading zones:', err);
      },
    });
  }


  subZones: any[] = [];

  subZoneByZone: { [zoneId: string]: any[] } = {};

  expandedZone: Set<string> = new Set();

  selectedZoneId: string = "";
  selectedZoneName: string = "";


  loadSubZones(zoneId: string) {
    const zone = this.zoneByFloor[this.selectedFloorId]?.find(z => z.id === zoneId);
    this.selectedZoneId = zoneId;
    this.selectedZoneName = zone?.zoneName || '';

    // ------------------- COLLAPSE LOGIC -------------------
    if (this.expandedZone.has(zoneId)) {
      this.expandedZone.delete(zoneId);
      this.subZoneImage = null;

      this.clearPolygons();

      // 🔄 Load parent zone map (fresh map from API)
      this.getZoneImageByZoneid(zoneId);

      this.activeLevel = 'zone';
      this.loadSavedPolygonsForZone(zoneId);
      this.loadDevicesByZone(zoneId);
      this.fetchZoneMapping(zoneId);
      this.cdr.detectChanges();
      return;
    }

    // ------------------- EXPAND LOGIC -------------------
    this.role.getSubZones(zoneId).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : [];

        this.subZoneByZone[zoneId] = data;
        this.expandedZone.add(zoneId);

        this.clearPolygons();

        if (data.length > 0) {
          // 🟢 SHOW SUB-ZONE IMAGE
          this.subZoneImage = data[0].uploadMap;
          this.floorImage = null;
          this.zoneImage = null;
        } else {
          // 🟠 NO SUBZONES → USE ZONE MAP API
          this.getZoneImageByZoneid(zoneId);
          this.loadDevicesByZone(zoneId);
          this.cdr.detectChanges();
        }

        this.activeLevel = 'zone';
        this.loadSavedPolygonsForZone(zoneId);
        this.fetchZoneMapping(zoneId);
      },

      error: () => {
        // 🟠 API FAILED → still try to load zone map
        this.getZoneImageByZoneid(zoneId);
        this.loadDevicesByZone(zoneId);
        this.loadSavedPolygonsForZone(zoneId);
        this.fetchZoneMapping(zoneId);
        this.cdr.detectChanges();
      }
    });
  }


  // selectedTimeRange: string = 'day';
  // showHourInputs: boolean = true;
  // hours: string[] = [];
  // selectedHour: string = '';


  setDefaultTimeRange() {
    switch (this.selectedTimeRange) {
      case 'day':
        this.hours = ['Live', '1 Hour', '2 Hours', '8 Hours', '24 Hours'];
        this.selectedHour = 'Live';
        break;

      case 'week':
        this.hours = ['1 Day', '2 Days', '5 Days', '7 Days'];
        this.selectedHour = '1 Day';
        break;

      case 'month':
        this.hours = ['15 Days', '30 Days'];
        this.selectedHour = '15 Days';
        break;
    }
    this.showHourInputs = true;
  }

  // onTimeRangeChange() {
  //   switch (this.selectedTimeRange) {
  //     case 'day':
  //       this.hours = ['Live', '1 Hour', '2 Hours', '8 Hours', '24 Hours'];
  //       this.selectedHour = 'Live';
  //       break;

  //     case 'week':
  //       this.hours = ['1 Day', '2 Days', '5 Days', '7 Days'];
  //       this.selectedHour = '1 Day';
  //       break;

  //     case 'month':
  //       this.hours = ['15 Days', '30 Days'];
  //       this.selectedHour = '15 Days';
  //       break;

  //     default:
  //       this.showHourInputs = false;
  //       break;
  //   }

  //   this.showHourInputs = true;
  // }

  onHourChange() {
    console.log(`Selected: ${this.selectedTimeRange} → ${this.selectedHour}`);
    // 🔥 You can load map data dynamically here
  }

  @ViewChild('drawingCanvas') drawingCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private polygons: {
    points: { x: number; y: number }[]; color: string; label?: string;
    zoneId?: string;
  }[] = [];
  private tempPoints: { x: number; y: number }[] = [];
  currentColor: string = '#ff0000';

  // Initialize canvas
  initializeCanvas() {
    setTimeout(() => {
      const canvas = this.drawingCanvas?.nativeElement;
      if (!canvas) return;
      this.ctx = canvas.getContext('2d')!;
      canvas.width = this.getImageWidth();
      canvas.height = this.getImageHeight();
      this.redrawCanvas();
    }, 200);
  }

  onImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    const canvas = this.drawingCanvas.nativeElement;
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;
    this.ctx = canvas.getContext('2d')!;
    this.redrawCanvas();

  }



  // Double-click to complete polygon
  @HostListener('dblclick', ['$event'])
  onDoubleClick(event: MouseEvent) {
    if (this.tempPoints.length >= 3) {
      this.polygons.push({
        points: [...this.tempPoints],
        color: this.currentColor,
      });
    }
    this.tempPoints = [];
    this.redrawCanvas();
  }

  // Clear all
  clearPolygons() {
    this.polygons = [];
    this.tempPoints = [];
    this.redrawCanvas();
  }

  setColor(event: any) {
    this.currentColor = event.target.value;
    this.redrawCanvas();
  }



  redrawCanvas() {
    if (!this.ctx) return;
    const canvas = this.drawingCanvas.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw saved polygons
    this.polygons.forEach((poly) => {
      // Draw polygon
      this.ctx.fillStyle = poly.color + '40';
      this.ctx.strokeStyle = poly.color;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(poly.points[0].x, poly.points[0].y);
      for (let i = 1; i < poly.points.length; i++) {
        this.ctx.lineTo(poly.points[i].x, poly.points[i].y);
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      if (poly.label) {
        // Calculate centroid
        const centroid = poly.points.reduce(
          (acc, pt) => {
            acc.x += pt.x;
            acc.y += pt.y;
            return acc;
          },
          { x: 0, y: 0 }
        );
        centroid.x /= poly.points.length;
        centroid.y /= poly.points.length;

        const zoneText = poly.label;
        const visitorText = `Total Visitors: ${this.zoneVisitorCounts[zoneText] || 0}`;

        this.ctx.font = '10px Arial';
        const zoneTextWidth = this.ctx.measureText(zoneText).width;
        const visitorTextWidth = this.ctx.measureText(visitorText).width;
        const padding = 2;
        const rectWidth = Math.max(zoneTextWidth, visitorTextWidth) + padding * 4;
        const rectHeight = 40;


        const offsetX = 20;  // 👉 move right side

        const boxX = centroid.x - rectWidth / 2 + offsetX;
        const boxY = centroid.y - rectHeight / 4;

        this.ctx.fillStyle = '#cb99f1ff';
        this.ctx.strokeStyle = '#7030a0';
        this.ctx.lineWidth = 1;
        this.ctx.fillRect(boxX, boxY, rectWidth, rectHeight);
        this.ctx.strokeRect(boxX, boxY, rectWidth, rectHeight);

        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(zoneText, centroid.x + offsetX, centroid.y - 4);
        this.ctx.fillText(visitorText, centroid.x + offsetX, centroid.y + 10)
      }
    });

    // Draw points while creating polygon
    this.tempPoints.forEach((p) => {
      this.ctx.fillStyle = this.currentColor;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
      this.ctx.fill();
    });
  }




  // Helpers
  getImageWidth(): number {
    const img = document.querySelector('.map-image') as HTMLImageElement;
    return img ? img.clientWidth : 0;
  }

  getImageHeight(): number {
    const img = document.querySelector('.map-image') as HTMLImageElement;
    return img ? img.clientHeight : 0;
  }


  projectDevices: any[] = [];

  devicesGetByProjectId(projectId: any) {
    this.device.getDevicesByProject(projectId).subscribe({
      next: (res: any) => {
        this.projectDevices = res;
        this.areaDevices = [];
        this.countryDevices = []; // clear old country data
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("error loading devicesbyproject")
      }
    })

  }


  countryDevices: any[] = []
  devicesGetByCountryId(projectId: any, countryId: any) {
    this.device.getDevicesByCountry(projectId, countryId).subscribe({
      next: (res: any) => {
        this.countryDevices = res;
        this.areaDevices = [];
        this.projectDevices = []; // clear project devices
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("error loading devicesbyCountry")
      }
    })
  }

  areaDevices: any[] = [];

  devicesGetByAreaId(projectId: string, countryId: string, areaId: string) {
    this.device.getDevicesByArea(projectId, countryId, areaId).subscribe({
      next: (res: any) => {
        this.areaDevices = res;
        this.projectDevices = [];
        this.countryDevices = [];
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("error loading devicesbyCountry")
      }
    })
  }

  buildingDevices: any[] = [];

  devicesGetByBuildingId(projectId: string, countryId: string, areaId: string, buildingId: string) {
    this.device.getDevicesByBuilding(projectId, countryId, areaId, buildingId).subscribe({
      next: (res: any) => {
        this.buildingDevices = res;
        // Clear other levels
        this.projectDevices = [];
        this.countryDevices = [];
        this.areaDevices = [];
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("Error loading devices by building");
      }
    });
  }


  floorDevices: any[] = [];
  devicesGetByFloorId(
    projectId: string,
    countryId: string,
    areaId: string,
    buildingId: string,
    floorId: string
  ) {
    this.device
      .getDevicesByFloor(projectId, countryId, areaId, buildingId, floorId)
      .subscribe({
        next: (res: any) => {
          console.log('✅ Floor devices API response:', res);

          // Your API returns [{ deviceId, deviceName }]
          this.floorDevices = res.map((d: any) => ({
            id: d.deviceId, // 👈 match dropdown [value]
            deviceName: d.deviceName,
          }));

          console.log('✅ Transformed floorDevices:', this.floorDevices);

          this.activeLevel = 'floor'; // 👈 ensure correct switch case
          this.cdr.detectChanges();   // 👈 force UI refresh
        },
        error: (err) => {
          console.error('❌ Error loading devices by floor', err);
        },
      });
  }


  zoneDevices: any[] = [];

  devicesGetByZoneId(
    projectId: string,
    countryId: string,
    areaId: string,
    buildingId: string,
    floorId: string,
    zoneId: string
  ) {
    this.device.getDevicesByZone(projectId, countryId, areaId, buildingId, floorId, zoneId).subscribe({
      next: (res: any) => {
        console.log('✅ Devices by Zone:', res);

        // 🧩 Ensure response is an array and mapped correctly
        this.zoneDevices = (Array.isArray(res) ? res : []).map(d => ({
          id: d.id || d.deviceId, // handle either field name
          deviceName: d.deviceName || d.name,
        }));

        // 🧹 Clear other device lists
        this.projectDevices = [];
        this.countryDevices = [];
        this.areaDevices = [];
        this.buildingDevices = [];
        this.floorDevices = [];

        // 🧠 Important: Update active level
        this.activeLevel = 'zone';

        // 🔁 Trigger UI refresh
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error loading devices by zone:', err);
      }
    });
  }




  selectedDeviceId: string | null = null;
  activeLevel: string = 'project'; // or dynamically set this value based on user selection

  onDeviceSelect(event: Event) {

    const selectedId = (event.target as HTMLSelectElement).value;
    this.selectedDeviceId = selectedId;

    // Find selected device object
    let selectedDevice: any;
    switch (this.activeLevel) {
      case 'project':
        selectedDevice = this.projectDevices.find(d => d.id === selectedId);
        break;
      case 'country':
        selectedDevice = this.countryDevices.find(d => d.id === selectedId);
        break;
      case 'area':
        selectedDevice = this.areaDevices.find(d => d.id === selectedId);
        break;
      case 'building':
        selectedDevice = this.buildingDevices.find(d => d.id === selectedId);
        break;
      case 'floor':
        selectedDevice = this.floorDevices.find(d => d.id === selectedId);
        break;
      case 'zone':
        selectedDevice = this.zoneDevices.find(d => d.id === selectedId);
        break;
    }

    if (selectedDevice) {
      console.log('✅ Selected Device:', selectedDevice);
      // You can handle logic like showing map or updating UI here
    }
  }


  selectedProjectId: string = '';
  selectedCountryId: string = '';
  selectedAreaId: string = '';
  selectedBuildingId: string = '';
  selectedFloorId: string = '';




  placingDevice: boolean = false;
  placedDevices: any[] = []; // stores placed devices {id, name, x, y}
  drawing = false;


  enableDrawing() {
    this.drawing = true;
    this.placingDevice = false;
  }


  onMapImageClick(event: MouseEvent) {

    if (!this.placingDevice || !this.selectedDeviceId) return;

    const imgElement = event.target as HTMLElement;
    const rect = imgElement.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Get selected device by active level
    let selectedDevice: any = null;
    switch (this.activeLevel) {
      case 'project': selectedDevice = this.projectDevices.find(d => d.id === this.selectedDeviceId); break;
      case 'country': selectedDevice = this.countryDevices.find(d => d.id === this.selectedDeviceId); break;
      case 'area': selectedDevice = this.areaDevices.find(d => d.id === this.selectedDeviceId); break;
      case 'building': selectedDevice = this.buildingDevices.find(d => d.id === this.selectedDeviceId); break;
      case 'floor': selectedDevice = this.floorDevices.find(d => d.id === this.selectedDeviceId); break;
      case 'zone': selectedDevice = this.zoneDevices.find(d => d.id === this.selectedDeviceId); break;
    }

    if (!selectedDevice) return;

    // ✅ Create zone bucket if not created
    if (!this.placedDevicesByZone[this.selectedZoneId]) {
      this.placedDevicesByZone[this.selectedZoneId] = [];
    }

    // ✅ Push device only for this zone
    this.placedDevicesByZone[this.selectedZoneId].push({
      id: selectedDevice.id,
      name: selectedDevice.deviceName,
      x,
      y
    });

    console.log(
      "Placed devices for this zone:",
      this.placedDevicesByZone[this.selectedZoneId]
    );

    // ✅ Update UI to show only current zone devices
    this.placedDevices = [...this.placedDevicesByZone[this.selectedZoneId]];

    // Stop placing device
    this.placingDevice = false;

    if (this.drawingCanvas?.nativeElement) {
      this.drawingCanvas.nativeElement.style.pointerEvents = "auto";
    }

    this.showDevicePopup = true;
  }


  polygonPoints: any[] = [];
  showPolygonPopup = false;
  polygonCompleted = false;
  firstPointThreshold = 10;  // pixels


  addPolygonPoint(event: MouseEvent) {


    if (this.placingDevice) return;

    if (this.polygonCompleted) return;

    const rect = this.drawingCanvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 🔵 If user tries to close polygon
    if (this.tempPoints.length >= 3) {
      const first = this.tempPoints[0];
      const distance = Math.sqrt((x - first.x) ** 2 + (y - first.y) ** 2);

      if (distance <= 3) {
        this.polygonCompleted = true;
        this.showPolygonPopup = true;

        return;
      }
    }

    // Normal point adding
    this.tempPoints.push({ x, y });
    this.redrawCanvas();

    if (this.tempPoints.length > 1) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineWidth = 2;
      this.ctx.moveTo(this.tempPoints[0].x, this.tempPoints[0].y);

      for (let i = 1; i < this.tempPoints.length; i++) {
        this.ctx.lineTo(this.tempPoints[i].x, this.tempPoints[i].y);
      }
      this.ctx.stroke();
    }
  }


  cancelPolygon() {
    this.showPolygonPopup = false;
    this.polygonCompleted = false;
    this.tempPoints = [];
  }


  //savedMappingId: string = "";

  applyPolygon() {
    if (this.tempPoints.length < 3) return;

    const geoJson = this.convertPointsToGeoJSON(this.tempPoints,
      this.selectedZoneName,
      this.currentColor);

    const body = {
      id: "",
      areaId: this.selectedAreaId,
      assemblyPoint: false,
      buildingId: this.selectedBuildingId,
      clientId: '',
      countryId: this.selectedCountryId,
      createdAt: new Date(),
      createdBy: "admin",
      exit: "",
      floorId: this.selectedFloorId,
      geoJsonData: geoJson,
      priority: "High",
      projectId: this.selectedProjectId,
      status: true,
      topZone: "",
      zoneId: this.selectedZoneId,
      zoneName: this.selectedZoneName,
    };

    this.device.saveZoneMapping(body).subscribe({
      next: (res: any) => {
        console.log("Zone Saved Successfully", res);
        this.savedMappingId = res.id;
        localStorage.setItem("savedMappingId", res.id);

        this.showPolygonPopup = false;
        this.loadPolygonsByFloor(this.selectedFloorId);
        this.loadSavedPolygonsForZone(this.selectedZoneId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error saving zone", err);
      }
    });

  }




  convertPointsToGeoJSON(points: any[], zoneName: string, color: string) {
    const coordinates = points.map(p => [p.x, p.y]);
    coordinates.push([points[0].x, points[0].y]); // close polygon

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [coordinates]
          },
          properties: {
            additionalProp1: zoneName,  // Zone Name
            additionalProp2: color,     // Selected Color Code
            additionalProp3: ""
          }
        }
      ]
    };
  }


  onZoneSelect(zoneId: string) {
    this.selectedZoneId = zoneId;

    // Show only this zone’s devices
    if (this.placedDevicesByZone[zoneId]) {
      this.placedDevices = [...this.placedDevicesByZone[zoneId]];
    } else {
      this.placedDevices = [];  // VERY IMPORTANT
    }

    // Load from API if exists
    this.fetchZoneMapping(zoneId);
  }


  drawSavedPolygon(data: any) {
    this.clearPolygons(); // remove old drawings

    const feature = data.geoJsonData.features[0];
    const coords = feature.geometry.coordinates[0];
    const color = feature.properties.additionalProp2; // "#613583"

    this.currentColor = color;

    // Create a fresh polygon
    this.currentPolygon = coords.map((point: any) => ({
      x: point[0],
      y: point[1]
    }));

    this.renderPolygonOnCanvas(this.currentPolygon, this.currentColor);
  }
  @ViewChild('drawingCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  renderPolygonOnCanvas(points: any[], color: string) {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    points.forEach(p => {
      ctx.lineTo(p.x, p.y);
    });

    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.fillStyle = color + "55"; // transparent fill
    ctx.fill();
    ctx.stroke();
  }

  currentPolygon: any[] = [];

  polygonsByZone: { [zoneId: string]: any[] } = {};

  loadSavedPolygonsForZone(zoneId: string) {
    if (!zoneId) return;

    this.device.getZoneMappingById(zoneId).subscribe({
      next: (res: any) => {

        const mapping = Array.isArray(res) ? res[0] : res;
        if (!mapping?.geoJsonData?.features?.[0]) return;

        const feature = mapping.geoJsonData.features[0];
        const coords = feature.geometry.coordinates[0];
        const color = feature.properties?.additionalProp2 || this.currentColor;
        const label = feature.properties?.additionalProp1 || this.selectedZoneName;

        const points = coords.map((pt: any) => ({ x: pt[0], y: pt[1] }));

        // 🟢 Initialize zone polygon list if empty
        if (!this.polygonsByZone[zoneId]) {
          this.polygonsByZone[zoneId] = [];
        }

        // 🟢 Replace only this zone’s polygons
        this.polygonsByZone[zoneId] = [{
          points,
          color,
          label,
          zoneId
        }];

        // 🟢 Set ACTIVE polygon list for UI
        this.polygons = this.polygonsByZone[zoneId];

        this.redrawCanvas();
        this.cdr.detectChanges();
      }
    });
  }



  enableDevicePlacement() {
    this.placingDevice = true;

    // Disable canvas clicks temporarily
    if (this.drawingCanvas && this.drawingCanvas.nativeElement) {
      this.drawingCanvas.nativeElement.style.pointerEvents = "none";
    }
  }

  disableDevicePlacement() {
    this.placingDevice = false;

    // Enable drawing clicks again
    if (this.drawingCanvas && this.drawingCanvas.nativeElement) {
      this.drawingCanvas.nativeElement.style.pointerEvents = "auto";
    }
  }



  showDevicePopup: boolean = false;



  cancelDevice() {
    // Remove the last placed device (the one just clicked on the map)
    if (this.placedDevices.length > 0) {
      this.placedDevices.pop();
    }

    // Close the popup
    this.showDevicePopup = false;

    // Re-enable device placement if needed
    this.placingDevice = false;
  }


  selectedDevice: any = null;
  deviceClickX: number = 0;
  deviceClickY: number = 0;



  // applyDevice() {
  //   if (!this.selectedDeviceId || this.placedDevices.length === 0) return;

  //   let selectedDevice: any = null;
  //   switch (this.activeLevel) {
  //     case 'project': selectedDevice = this.projectDevices.find(d => d.id === this.selectedDeviceId); break;
  //     case 'country': selectedDevice = this.countryDevices.find(d => d.id === this.selectedDeviceId); break;
  //     case 'area': selectedDevice = this.areaDevices.find(d => d.id === this.selectedDeviceId); break;
  //     case 'building': selectedDevice = this.buildingDevices.find(d => d.id === this.selectedDeviceId); break;
  //     case 'floor': selectedDevice = this.floorDevices.find(d => d.id === this.selectedDeviceId); break;
  //     case 'zone': selectedDevice = this.zoneDevices.find(d => d.id === this.selectedDeviceId); break;
  //   }

  //   if (!selectedDevice) return;

  //   this.placedDevices.forEach(d => {
  //     const payload = {
  //       id: "",
  //       areaId: this.selectedAreaId,
  //       assemblyPoint: false,
  //       buildingId: this.selectedBuildingId,
  //       clientId: "YOUR_CLIENT_ID",
  //       countryId: this.selectedCountryId,
  //       createdAt: new Date().toISOString(),
  //       createdBy: "admin",
  //       deviceGeoJsonData: {
  //         type: "FeatureCollection",
  //         features: [
  //           {
  //             type: "Feature",
  //             geometry: { type: "Point", coordinates: [d.x, d.y] },
  //             properties: {}
  //           }
  //         ]
  //       },
  //       deviceName: d.name,
  //       deviceReferenceId: d.id,
  //       exit: "",
  //       floorId: this.selectedFloorId,
  //       priority: "normal",
  //       projectId: this.selectedProjectId,
  //       status: true,
  //       topZone: "",
  //       userId: "loggedInUserId",
  //       zoneId: this.selectedZoneId,
  //       zoneName: ""
  //     };

  //     this.device.saveDeviceGeoJson(payload).subscribe({
  //       next: (res: any) => {
  //         console.log("Device saved", res)
  //         this.fetchZoneMapping(this.selectedZoneId);

  //       },

  //       error: err => console.error("Error saving device", err)
  //     });
  //   });

  //   this.placedDevices = [];
  //   this.showDevicePopup = false;
  // }

applyDevice() {
  if (!this.selectedDeviceId || this.placedDevices.length === 0) return;

  let selectedDevice = null;

  switch (this.activeLevel) {
    case 'project': selectedDevice = this.projectDevices.find(d => d.id === this.selectedDeviceId); break;
    case 'country': selectedDevice = this.countryDevices.find(d => d.id === this.selectedDeviceId); break;
    case 'area': selectedDevice = this.areaDevices.find(d => d.id === this.selectedDeviceId); break;
    case 'building': selectedDevice = this.buildingDevices.find(d => d.id === this.selectedDeviceId); break;
    case 'floor': selectedDevice = this.floorDevices.find(d => d.id === this.selectedDeviceId); break;
    case 'zone': selectedDevice = this.zoneDevices.find(d => d.id === this.selectedDeviceId); break;
  }

  if (!selectedDevice) return;

  // Save only last dropped device
  const d = this.placedDevices[this.placedDevices.length - 1];

  const payload = {
    id: "",
    areaId: this.selectedAreaId,
    assemblyPoint: false,
    buildingId: this.selectedBuildingId,
    clientId: "YOUR_CLIENT_ID",
    countryId: this.selectedCountryId,
    createdAt: new Date().toISOString(),
    createdBy: "admin",
    deviceGeoJsonData: {
      type: "FeatureCollection",
      features: [
        { type: "Feature", geometry: { type: "Point", coordinates: [d.x, d.y] }, properties: {} }
      ]
    },
    deviceName: d.name,
    deviceReferenceId: d.id,
    exit: "",
    floorId: this.selectedFloorId,
    priority: "normal",
    projectId: this.selectedProjectId,
    status: true,
    topZone: "",
    userId: "loggedInUserId",
    zoneId: this.selectedZoneId,
    zoneName: ""
  };

  this.device.saveDeviceGeoJson(payload).subscribe({
    next: (res) => {
      console.log("Device saved", res);
      this.fetchZoneMapping(this.selectedZoneId);
    },
    error: err => console.error("Error saving device", err)
  });

  this.placedDevices = [];
  this.showDevicePopup = false;
}

  placedDevicesByZone: { [zoneId: string]: any[] } = {};

  // fetchZoneMapping(zoneId: string) {
  //   this.device.getZoneMapping(zoneId).subscribe({
  //     next: (zoneData: any) => {

  //       const devices = zoneData?.deviceGeoJsonData?.features?.map((f: any) => ({
  //         id: zoneData.deviceReferenceId,
  //         name: zoneData.deviceName,
  //         x: f.geometry.coordinates[0],
  //         y: f.geometry.coordinates[1]
  //       })) || [];

  //       this.placedDevicesByZone[zoneId] = devices;
  //       this.placedDevices = devices;

  //       this.cdr.detectChanges();
  //     }
  //   });
  // }


  fetchZoneMapping(zoneId: string) {
  this.device.getZoneMapping(zoneId).subscribe({
    next: (response: any[]) => {

      if (!Array.isArray(response)) {
        console.warn("Invalid response format");
        return;
      }

      // Flatten all devices
      const devices = response.flatMap((item: any) =>
        item.deviceGeoJsonData?.features?.map((f: any) => ({
          id: item.deviceReferenceId,
          name: item.deviceName,
          x: f.geometry.coordinates[0],
          y: f.geometry.coordinates[1]
        })) || []
      );

      this.placedDevicesByZone[zoneId] = devices;
      this.placedDevices = devices;

      console.log("🟢 All devices loaded:", devices);

      this.cdr.detectChanges();
    }
  });
}




  zoneVisitorCounts: { [zoneName: string]: number } = {};

  ws!: WebSocket;
  connectWebSocket() {
    this.ws = new WebSocket('wss://phcc.purpleiq.ai/ws/ZoneCount');

    //this.ws = new WebSocket('ws://172.16.100.26:5202/ws/ZoneCount');

    this.ws.onopen = () => console.log('✅ WebSocket Connected');

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const updates = Array.isArray(data) ? data : [data];

        updates.forEach((update: any) => {
          // Store visitor count based on ZoneId
          if (update.ZoneId && typeof update.Count === 'number') {
            this.zoneVisitorCounts[update.ZoneId] = update.Count;
          }
        });

        // Redraw canvas with updated counts
        this.redrawCanvas();
      } catch (err) {
        console.error('WebSocket parse error', err);
      }
    };

    this.ws.onclose = () => console.log('WebSocket Closed');
    this.ws.onerror = (err) => console.error('WebSocket Error', err);
  }


  selectedItemId: string | number | null = null; // to store the clicked item's ID

  selectItem(id: string | number) {
    this.selectedItemId = id;
  }

  activeLevels: 'project' | 'country' | 'area' | 'building' | 'floor' | 'zone' | null = null;



  loadPolygonsByFloor(floorId: string) {
    if (!floorId) return;

    this.device.getZoneMappingByFloor(floorId).subscribe({
      next: (res: any[]) => {
        console.log("🟩 Floor polygon response:", res);

        // Clear old polygons
        this.polygons = [];

        // Loop all zone mappings
        res.forEach((mapping: any) => {
          const feature = mapping.geoJsonData?.features?.[0];
          if (!feature) return;

          const coords = feature.geometry?.coordinates?.[0];
          if (!coords) return;

          const color = feature.properties?.additionalProp2 || '#ff0000';
          const label = feature.properties?.additionalProp1 || '';
          const zoneId = mapping.id;

          const points = coords.map((pt: any) => ({ x: pt[0], y: pt[1] }));

          // Insert polygon
          this.polygons.push({
            points,
            color,
            label,
            zoneId
          });
        });

        // Redraw once after adding all polygons
        this.redrawCanvas();
      },
      error: (err) => {
        console.error("❌ Error loading polygons for floor", err);
      }
    });
  }




  getZoneImageByZoneid(zoneId: string) {
    this.device.getZoneImageByZoneId(zoneId).subscribe({
      next: (res: any) => {

        console.log("🔥 ZONE MAP URL RECEIVED:", res.mapUrl);

        this.zoneImage = res.mapUrl;
        this.subZoneImage = null;
        this.floorImage = null;

        this.activeLevel = 'zone';

        setTimeout(() => {
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }, 50);
      },
      error: () => {
        console.warn("Zone map API failed");

        const zone = this.zoneByFloor[this.selectedFloorId]
          ?.find(z => z.id === zoneId);

        if (zone?.uploadMap) this.zoneImage = zone.uploadMap;

        setTimeout(() => {
          this.cdr.detectChanges();
        }, 50);
      }
    });
  }


  loadDevicesByZone(zoneId: string) {
    this.device.getDevicesByZoneId(zoneId).subscribe({
      next: (res: any) => {
        console.log("Zone devices:", res);
        this.zoneDevices = res; // store for UI
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error loading devices for zone", err);
      }
    });
  }



  loadDevicesByFloor(floorId: string) {
    if (!floorId) return;

    this.device.getDeviceGeoJsonByFloor(floorId).subscribe({
      next: (res: any) => {
        console.log("🟩 Floor device mapping response:", res);

        // Clear old device markers
        this.placedDevices = [];

        res.forEach((mapping: any) => {
          const feature = mapping.deviceGeoJsonData?.features?.[0];
          if (!feature) return;

          const coords = feature.geometry?.coordinates;
          if (!coords || feature.geometry.type !== "Point") return;

          const x = coords[0];
          const y = coords[1];

          this.placedDevices.push({
            id: mapping.deviceReferenceId,
            name: mapping.deviceName,
            x,
            y
          });
        });
        this.cdr.detectChanges();

        console.log("📌 Loaded devices:", this.placedDevices);
      },

      error: (err) => {
        console.error("❌ Error loading device mapping for floor", err);
      }
    });
  }


selectedDays: number = 1;  // default 1 day
daysOptions: number[] = [1, 2, 5, 7, 15, 30]; // example options

//   loadZoneCounts() {
//   if (!this.selectedZoneName) return;

//   const numericHour = this.hourMap[this.selectedHour];
//   if (numericHour == null) return;

//   this.device.ProcessedEvetbyHours(this.selectedZoneName, numericHour)
//     .subscribe({
//       next: (res: any) => {
//         // ✅ Update zoneVisitorCounts from API
//         this.zoneVisitorCounts = {};
//         this.zoneVisitorCounts[res.zone] = res.count;

//         // ✅ Redraw canvas with updated values
//         this.redrawCanvas();
//       },
//       error: (err) => console.error('API Error:', err)
//     });
// }



loadZoneCounts() {
  if (!this.selectedZoneName) return;

  const numericHour = this.hourMap[this.selectedHour];
  if (numericHour == null) return;

  this.device.ProcessedEvetbyHours(this.selectedZoneName, numericHour)
    .subscribe({
      next: (res: any) => {

        // 👇 Store the response using zoneName as the key
        this.zoneVisitorCounts[res.zoneName] = res.totalCount;

        this.redrawCanvas();
      },
      error: (err) => console.error('API Error:', err)
    });
}


// loadZoneCountsByDate() {
//   if (!this.selectedZoneName) {
//     console.warn("No zone selected");
//     return;
//   }

//   if (this.selectedDays == null) {
//     console.warn("No days selected");
//     return;
//   }

//   this.device.getVisitorsByDate(this.selectedZoneName, this.selectedDays)
//     .subscribe({
//       next: (res: any) => {
//         // reset old counts
//         this.zoneVisitorCounts = {};

//         // assuming API returns { zone: "...", count: 10 }
//         this.zoneVisitorCounts[res.zone] = res.count;

//         // redraw canvas
//         this.redrawCanvas();
//       },
//       error: (err) => console.error("API Error:", err)
//     });
// }

loadZoneCountsByDate() {
  if (!this.selectedZoneName) return;

  const numericDays = this.hourMap[this.selectedHour];
  if (numericDays == null) return;

  this.device.getVisitorsByDate(this.selectedZoneName, numericDays)
    .subscribe({
      next: (res: any) => {

        // 👇 Store the response
        this.zoneVisitorCounts[res.zoneName] = res.totalCount;

        this.redrawCanvas();
      },
      error: (err) => console.error("API Error:", err)
    });
}






onTimeRangeChange() {
  switch (this.selectedTimeRange) {
    case 'day':
      this.hours = ['Live', '1 Hour', '2 Hours', '8 Hours', '24 Hours'];
      this.selectedHour = 'Live';
      break;

    case 'week':
      this.hours = ['1 Day', '2 Days', '5 Days', '7 Days'];
      this.selectedHour = '1 Day';
      break;

    case 'month':
      this.hours = ['15 Days', '30 Days'];
      this.selectedHour = '15 Days';
      break;

    default:
      this.showHourInputs = false;
      return;
  }

  this.showHourInputs = true;

  // 🔥 Auto-call correct API after setting first option
  if (this.selectedTimeRange === 'day') {
    this.loadZoneCounts();   // calls hour API
  } else {
    this.loadZoneCountsByDate(); // calls day API
  }
}




}