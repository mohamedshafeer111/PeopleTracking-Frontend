import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Roleservice } from '../../../service/role/roleservice';
import { RouterLink, RouterModule } from '@angular/router';
import { Device } from '../../../service/device/device';
import { HttpClient } from '@angular/common/http';
import { Websocket } from '../../../service/websocket/websocket';
import { environment } from '../../../../../environments/environment.prod';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, NgIf, NgFor, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {

private wsUrl = environment.wsUrl;

  ngOnInit(): void {
    this.loadProject();
    this.loadZoneSensors();
    this.connectWebSocket();
  }

  constructor(private cdr: ChangeDetectorRef, private role: Roleservice, private device: Device, private http: HttpClient, private zoneSocket: Websocket) { }

  isAddWidgetPopup: boolean = false;

  openAddWidgetPopup() {
    this.resetPopupData();
    this.isAddWidgetPopup = true;
  }
  closeAddWidgetPopup() {
    this.isAddWidgetPopup = false;
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

  toggleProject(projectId: string) {
    if (this.expandedProjects.has(projectId)) {
      this.expandedProjects.delete(projectId);
    } else {
      this.expandedProjects.add(projectId);
      this.loadCountries(projectId);
    }
  }

  loadCountries(projectId: string) {
    this.resetDeviceSelection();
    this.selectedProjectId = projectId;
    if (this.expandedProjects.has(projectId)) {
      this.expandedProjects.delete(projectId);
      return;
    }

    this.role.countryGetById(projectId).subscribe({
      next: (res: any) => {
        this.countriesByProject[projectId] = Array.isArray(res) ? res : [];
        this.expandedProjects.add(projectId);

        this.cdr.detectChanges();
        this.selectedProjectId = projectId;
        this.devicesGetByProjectId(projectId);

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


  // loadArea(countryId: string) {
  //   if (this.expandedCountry.has(countryId)) {
  //     this.expandedCountry.delete(countryId);
  //     return;
  //   }

  //   if (!this.areaByCountry[countryId]) {
  //     this.role.getSummary(countryId).subscribe({
  //       next: (res: any) => {
  //         this.areaByCountry[countryId] = Array.isArray(res) ? res : [];
  //         this.expandedCountry.add(countryId);
  //         this.cdr.detectChanges();
  //       },
  //       error: () => {
  //         console.log("Error loading areas");
  //       }
  //     });
  //   } else {
  //     this.expandedCountry.add(countryId);
  //     this.cdr.detectChanges();
  //   }
  // }

  selectedProjectId: string = '';
  loadArea(countryId: string, projectId?: string) {
    this.resetDeviceSelection();
    this.selectedCountryId = countryId;
    // Collapse if already expanded
    if (this.expandedCountry.has(countryId)) {
      this.expandedCountry.delete(countryId);
      return;
    }

    // Call your area summary API (existing logic)
    if (!this.areaByCountry[countryId]) {
      this.role.getSummary(countryId).subscribe({
        next: (res: any) => {
          this.areaByCountry[countryId] = Array.isArray(res) ? res : [];
          this.expandedCountry.add(countryId);
          this.cdr.detectChanges();

          // ✅ Call devices API for this country
          if (this.selectedProjectId) {
            this.devicesGetByCountryId(this.selectedProjectId, countryId);
          }
        },
        error: () => {
          console.log("Error loading areas");
        }
      });
    } else {
      this.expandedCountry.add(countryId);
      this.cdr.detectChanges();

      // ✅ Also call devices API when re-expanding
      if (this.selectedProjectId) {
        this.devicesGetByCountryId(this.selectedProjectId, countryId);
      }
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

  selectedCountryId: string = '';

  loadBuilding(areaId: string) {
    this.resetDeviceSelection();
    this.selectedAreaId = areaId;
    if (this.expandedArea.has(areaId)) {
      this.expandedArea.delete(areaId);
      return;
    }
    this.role.getBuilding(areaId).subscribe({
      next: (res: any) => {
        this.buildingByArea[areaId] = Array.isArray(res) ? res : [];
        this.expandedArea.add(areaId);
        this.cdr.detectChanges();

        console.log("Before calling devicesGetByAreaId", this.selectedProjectId, this.selectedCountryId, areaId);
        this.devicesGetByAreaId(this.selectedProjectId, this.selectedCountryId, areaId);
      },
      error: () => {
        console.log("Error loading buildings");
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

  selectedAreaId: string = '';
  loadFloor(buildingId: string) {
    this.resetDeviceSelection();
    this.selectedBuildingId = buildingId;
    if (this.expandedBuilding.has(buildingId)) {
      this.expandedBuilding.delete(buildingId);
      return;
    }

    this.role.getFloor(buildingId).subscribe({
      next: (res: any) => {
        this.floorByBuilding[buildingId] = Array.isArray(res) ? res : [];
        this.expandedBuilding.add(buildingId);
        this.cdr.detectChanges();

        // ✅ Fetch devices for this building
        if (this.selectedProjectId && this.selectedCountryId && this.selectedAreaId) {
          this.devicesGetByBuildingId(
            this.selectedProjectId,
            this.selectedCountryId,
            this.selectedAreaId,
            buildingId
          );
        }
      },
      error: () => {
        console.log("Error loading floors");
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

  selectedBuildingId: string = '';
  loadZones(floorId: string) {
    this.resetDeviceSelection();
    this.selectedFloorId = floorId;
    if (this.expandedFloor.has(floorId)) {
      this.expandedFloor.delete(floorId);
      return;
    }

    this.role.getZones(floorId).subscribe({
      next: (res: any) => {
        this.zoneByFloor[floorId] = Array.isArray(res) ? res : [];
        this.expandedFloor.add(floorId);
        this.cdr.detectChanges();

        // ✅ Fetch devices for this floor
        if (this.selectedProjectId && this.selectedCountryId && this.selectedAreaId && this.selectedBuildingId) {
          this.devicesGetByFloorId(
            this.selectedProjectId,
            this.selectedCountryId,
            this.selectedAreaId,
            this.selectedBuildingId,
            floorId
          );
        }
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
  selectedFloorId: string = '';
  loadSubZones(zoneId: string) {
    this.resetDeviceSelection();
    if (this.expandedZone.has(zoneId)) {
      this.expandedZone.delete(zoneId);
      return;
    }

    // ✅ 1. Always fetch subzones
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

    // ✅ 2. Always fetch devices for this zone
    if (
      this.selectedProjectId &&
      this.selectedCountryId &&
      this.selectedAreaId &&
      this.selectedBuildingId &&
      this.selectedFloorId
    ) {
      this.devicesGetByZoneId(
        this.selectedProjectId,
        this.selectedCountryId,
        this.selectedAreaId,
        this.selectedBuildingId,
        this.selectedFloorId,
        zoneId
      );
    }
  }




  selectedItemId: string | number | null = null; // to store the clicked item's ID

  selectItem(id: string | number) {
    this.selectedItemId = id;
  }

  activeLevel: 'project' | 'country' | 'area' | 'building' | 'floor' | 'zone' | null = null;

  projectDevices: any[] = [];

  devicesGetByProjectId(projectId: any) {
    this.device.getDevicesByProject(projectId).subscribe({
      next: (res: any) => {
        this.projectDevices = res;
        this.areaDevices = [];
        this.countryDevices = []; // clear old country data
        this.activeLevel = 'project';
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
        this.activeLevel = 'country';
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
        this.activeLevel = 'area';
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
        this.activeLevel = 'building';
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("Error loading devices by building");
      }
    });
  }


  floorDevices: any[] = [];

  devicesGetByFloorId(projectId: string, countryId: string, areaId: string, buildingId: string, floorId: string) {
    this.device.getDevicesByFloor(projectId, countryId, areaId, buildingId, floorId).subscribe({
      next: (res: any) => {
        this.floorDevices = res;

        // clear other device arrays
        this.projectDevices = [];
        this.countryDevices = [];
        this.areaDevices = [];
        this.buildingDevices = [];

        this.activeLevel = 'floor';
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("Error loading devices by floor");
      }
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
        this.zoneDevices = res;
        this.projectDevices = [];
        this.countryDevices = [];
        this.areaDevices = [];
        this.buildingDevices = [];
        this.floorDevices = [];
        this.activeLevel = 'zone';
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("Error loading devices by zone");
      }
    });
  }




  selectedDeviceId: string = '';
  deviceParameters: any[] = []; // holds API response parameters
  selectedParameters: Set<string> = new Set(); // to track checked boxes



  selectDevice(device: any) {
    this.selectedDeviceId = device.id;
    this.loadDeviceParametersByDevice(device.id);
  }


  loadDeviceParametersByDevice(deviceId: string) {
    this.device.getDeviceParametersByDeviceId(deviceId).subscribe({
      next: (res: any) => {
        if (res && res.length > 0) {
          this.deviceParameters = res[0].deviceParameters || [];
        } else {
          this.deviceParameters = [];
        }
        this.cdr.detectChanges();
        console.log('Loaded Parameters:', this.deviceParameters);
      },
      error: (err) => {
        console.error('Error loading device parameters:', err);
        this.deviceParameters = [];
      }
    });
  }


  // toggleParameterSelection(param: any) {
  //   if (this.selectedParameters.has(param.id)) {
  //     this.selectedParameters.delete(param.id);
  //   } else {
  //     this.selectedParameters.add(param.id);
  //   }

  //   console.log('Selected Parameters:', Array.from(this.selectedParameters));
  // }
  toggleParameterSelection(param: any) {
    if (this.selectedParameters.has(param.id)) {
      this.selectedParameters.delete(param.id);
    } else {
      if (this.selectedParameters.size >= 3) {
        alert('⚠️ You can select a maximum of 3 parameters only.');
        return;
      }
      this.selectedParameters.add(param.id);
    }

    console.log('Selected Parameters:', Array.from(this.selectedParameters));
  }




  widgets: any[] = [];



  // loadZoneSensors() {
  //   this.device.getAllZoneSensors().subscribe(
  //     (response: any) => {
  //       const dataArray = Array.isArray(response) ? response : [response];

  //       // ✅ Step 1: Flatten all zoneSensors from all zones
  //       const allSensors = dataArray.flatMap(zone => zone.zoneSensors || []);

  //       // ✅ Step 2: Group sensors by deviceId (avoid duplicates)
  //       const deviceMap = new Map<string, any>();

  //       for (const sensor of allSensors) {
  //         if (!deviceMap.has(sensor.deviceId)) {
  //           deviceMap.set(sensor.deviceId, {
  //             deviceId: sensor.deviceId,
  //             deviceName: sensor.deviceName,
  //             params: new Set<string>()
  //           });
  //         }

  //         const current = deviceMap.get(sensor.deviceId);
  //         (sensor.params || []).forEach((p: any) => current.params.add(p.paramName));
  //       }

  //       // ✅ Step 3: Convert grouped data to widget array
  //       this.widgets = Array.from(deviceMap.values()).map(d => ({
  //         deviceName: d.deviceName,
  //         params: Array.from(d.params)
  //       }));

  //       console.log('🟢 Widgets:', this.widgets);
  //       this.cdr.detectChanges();
  //     },
  //     (error) => {
  //       console.error('❌ Error fetching zone sensors:', error);
  //     }
  //   );
  // }



  getDeviceNameById(deviceId: string): string {
    const allDevices = [
      ...this.projectDevices,
      ...this.countryDevices,
      ...this.areaDevices,
      ...this.buildingDevices,
      ...this.floorDevices,
      ...this.zoneDevices
    ];
    const device = allDevices.find(d => d.id === deviceId);
    return device ? device.deviceName : '';
  }



  selectedDeviceName: string = '';

  onDeviceCheckboxChange(event: any, device: any) {
    if (event.target.checked) {
      // ✅ When checkbox is checked
      this.selectedDeviceId = device.id;
      this.selectedDeviceName = device.deviceName;

      console.log("✅ Selected Device:", device.deviceName);
      this.loadDeviceParametersByDevice(device.id);
    } else {
      // ✅ When checkbox is unchecked
      if (this.selectedDeviceId === device.id) {
        this.selectedDeviceId = '';
        this.selectedDeviceName = '';
      }
    }
  }


  resetDeviceSelection() {
    this.selectedDeviceId = '';
    this.selectedDeviceName = '';
    this.deviceParameters = [];
  }


  createWidgets() {
    if (!this.selectedDeviceId || this.selectedParameters.size === 0) {
      alert("Please select at least one device and one parameter.");
      return;
    }

    const selectedDeviceName = this.getDeviceNameById(this.selectedDeviceId);

    const selectedParams = Array.from(this.selectedParameters)
      .map(paramId => this.deviceParameters.find(p => p.id === paramId))
      .filter(p => !!p)
      .map(p => ({ paramId: p!.id, paramName: p!.name }));

    // ✅ Build one widget that contains up to 3 parameters
    this.widgets = [
      {
        deviceName: selectedDeviceName,
        params: selectedParams
      }
    ];

    // ✅ Build payload for API
    const payload = {
      id: "",
      projectId: this.selectedProjectId,
      countryId: this.selectedCountryId,
      areaId: this.selectedAreaId,
      buildingId: this.selectedBuildingId,
      floorId: this.selectedFloorId,
      zoneId: this.selectedFloorId ?? "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      zoneSensors: [
        {
          deviceId: this.selectedDeviceId,
          deviceName: selectedDeviceName,
          params: selectedParams
        }
      ]
    };

    console.log("🟢 Zone Sensor Payload:", payload);

    this.device.createZoneSensor(payload).subscribe({
      next: (res) => {
        console.log("✅ ZoneSensor Created Successfully:", res);
        alert("Zone Sensor created successfully!");
        this.closeAddWidgetPopup();
        this.loadZoneSensors();
      },
      error: (err) => {
        console.error("❌ Error creating zone sensor:", err);
        alert("Failed to create zone sensor");
      }
    });
  }

  resetPopupData() {
    // Clear selected items
    this.selectedItemId = "";
    this.selectedDeviceId = "";
    this.selectedParameters = new Set();

    // Clear device lists
    this.projectDevices = [];
    this.countryDevices = [];
    this.areaDevices = [];
    this.buildingDevices = [];
    this.floorDevices = [];
    this.zoneDevices = [];
    this.deviceParameters = [];

    // Clear expansions
    this.expandedProjects.clear();
    this.expandedCountry.clear();
    this.expandedArea.clear();
    this.expandedBuilding.clear();
    this.expandedFloor.clear();
    this.expandedZone.clear();

    // Clear nested data
    this.countriesByProject = {};
    this.areaByCountry = {};
    this.buildingByArea = {};
    this.floorByBuilding = {};
    this.zoneByFloor = {};
    this.subZoneByZone = {};

    // Reset active level
    this.activeLevel = null;
  }


  private ws!: WebSocket;
// private wsUrl = 'ws://172.16.100.26:5202/ws/ZoneCount';

 //private wsUrl = 'wss://phcc.purpleiq.ai/ws/ZoneCount';

  ngOnDestroy() {
    if (this.ws) this.ws.close();
  }

  // ✅ Fetch all widgets (from API)
  // loadZoneSensors() {
  //   this.device.getAllZoneSensors().subscribe(
  //     (response: any) => {
  //       const dataArray = Array.isArray(response) ? response : [response];
  //       const allSensors = dataArray.flatMap(zone => zone.zoneSensors || []);

  //       const deviceMap = new Map<string, any>();

  //       for (const sensor of allSensors) {
  //         if (!deviceMap.has(sensor.deviceId)) {
  //           deviceMap.set(sensor.deviceId, {
  //             deviceId: sensor.deviceId,
  //             deviceName: sensor.deviceName,
  //             params: sensor.params.map((p: any) => ({
  //               name: p.paramName,
  //               value: '-' // default placeholder until updated
  //             }))
  //           });
  //         }
  //       }

  //       this.widgets = Array.from(deviceMap.values());
  //       this.cdr.detectChanges();
  //     },
  //     (error) => console.error('❌ Error fetching zone sensors:', error)
  //   );
  // }

  loadZoneSensors() {
  this.device.getAllZoneSensors().subscribe(
    (response: any) => {
      const dataArray = Array.isArray(response) ? response : [response];

      // Attach mainId to every zonesensor
      const allSensors = dataArray.flatMap(zone =>
        (zone.zoneSensors || []).map((sensor: any) => ({
          ...sensor,
          mainId: zone.id     // <-- ADD mainId from parent
        }))
      );

      const deviceMap = new Map<string, any>();

      for (const sensor of allSensors) {
        if (!deviceMap.has(sensor.deviceId)) {
          deviceMap.set(sensor.deviceId, {
            deviceId: sensor.deviceId,
            deviceName: sensor.deviceName,
            mainId: sensor.mainId,    // <-- ADD mainId HERE
            params: sensor.params.map((p: any) => ({
              name: p.paramName,
              value: '-'  // your default logic remains
            }))
          });
        }
      }

      this.widgets = Array.from(deviceMap.values());
      this.cdr.detectChanges();
    },
    (error) => console.error('❌ Error fetching zone sensors:', error)
  );
}


  //✅ Connect to WebSocket and update matching widgets
  //   connectWebSocket() {
  //   this.ws = new WebSocket(this.wsUrl);

  //   this.ws.onopen = () => console.log('✅ WebSocket Connected');

  //   this.ws.onmessage = (event) => {
  //     try {
  //       const data = JSON.parse(event.data);
  //       const updates = Array.isArray(data) ? data : [data];

  //       updates.forEach((update: any) => {
  //         const zoneId = (update.ZoneId || '').trim().toLowerCase();
  //         const count = update.Count;

  //         console.log('📨 Received update:', update);

  //         const widget = this.widgets.find(
  //           (w) => w.deviceName.trim().toLowerCase() === zoneId
  //         );

  //         if (!widget?.params) return;

  //         // update or add params dynamically
  //         let zoneParam = widget.params.find((p: any) => p.name.toLowerCase() === 'zonename');
  //         let countParam = widget.params.find((p: any) => p.name.toLowerCase() === 'peoplecount');

  //         if (zoneParam) zoneParam.value = update.ZoneId;
  //         else widget.params.push({ name: 'ZoneName', value: update.ZoneId });

  //         if (countParam) countParam.value = count;
  //         else widget.params.push({ name: 'PeopleCount', value: count });


  //       });

  //       this.cdr.detectChanges();
  //     } catch (err) {
  //       console.error('⚠️ WebSocket message parse error:', err);
  //     }
  //   };

  //   this.ws.onerror = (err) => console.error('❌ WebSocket Error:', err);

  //   this.ws.onclose = () => {
  //     console.warn('🔌 WebSocket Disconnected — retrying in 1s...');
  //     setTimeout(() => this.connectWebSocket(), 1000);
  //   };
  // }



  // connectWebSocket() {
  //   this.ws = new WebSocket(this.wsUrl);

  //   this.ws.onopen = () => console.log('✅ WebSocket Connected');

  //   this.ws.onmessage = (event) => {
  //     try {
  //       const data = JSON.parse(event.data);

  //       // 🔥 If empty array -> set default PeopleCount = 0
  //       if (Array.isArray(data) && data.length === 0) {
  //         console.log("📭 Empty update received. Setting PeopleCount = 0");

  //         this.widgets.forEach((widget) => {
  //           let countParam = widget.params.find(
  //             (p: any) => p.name.toLowerCase() === 'peoplecount'
  //           );

  //           if (countParam) countParam.value = 0;
  //           else widget.params.push({ name: 'PeopleCount', value: 0 });
  //         });

  //         this.cdr.detectChanges();
  //         return;
  //       }

  //       const updates = Array.isArray(data) ? data : [data];

  //       updates.forEach((update: any) => {
  //         const zoneId = (update.ZoneId || '').trim().toLowerCase();
  //         const count = update.Count ?? 0; // default 0

  //         const widget = this.widgets.find(
  //           (w) => w.deviceName.trim().toLowerCase() === zoneId
  //         );

  //         if (!widget?.params) return;

  //         let zoneParam = widget.params.find(
  //           (p: any) => p.name.toLowerCase() === 'zonename'
  //         );
  //         let countParam = widget.params.find(
  //           (p: any) => p.name.toLowerCase() === 'peoplecount'
  //         );

  //         if (zoneParam) zoneParam.value = update.ZoneId;
  //         else widget.params.push({ name: 'ZoneName', value: update.ZoneId });

  //         if (countParam) countParam.value = count;
  //         else widget.params.push({ name: 'PeopleCount', value: count });
  //       });

  //       this.cdr.detectChanges();
  //     } catch (err) {
  //       console.error('⚠️ WebSocket message parse error:', err);
  //     }
  //   };

  // }


  connectWebSocket() {
    this.ws = new WebSocket(this.wsUrl);

    this.ws.onopen = () => {
      console.log('✅ WebSocket Connected');

      // 🔥 HARD-CODE status = online for all widgets
      this.widgets.forEach((widget) => {
        let statusParam = widget.params.find(
          (p: any) => p.name.toLowerCase() === 'status'
        );

        if (statusParam) {
          statusParam.value = 'online';
        } else {
          widget.params.push({ name: 'Status', value: 'online' });
        }
      });

      this.cdr.detectChanges();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // 🔥 Empty array → PeopleCount = 0 for all widgets
        if (Array.isArray(data) && data.length === 0) {
          console.log("📭 Empty update received. Setting PeopleCount = 0");

          this.widgets.forEach((widget) => {
            let countParam = widget.params.find(
              (p: any) => p.name.toLowerCase() === 'peoplecount'
            );

            if (countParam) countParam.value = 0;
            else widget.params.push({ name: 'PeopleCount', value: 0 });
          });

          this.cdr.detectChanges();
          return;
        }

        const updates = Array.isArray(data) ? data : [data];

        updates.forEach((update: any) => {
          const zoneId = (update.ZoneId || '').trim().toLowerCase();
          const count = update.Count ?? 0; // default 0

          console.log('📨 Received update:', update);

          const widget = this.widgets.find(
            (w) => w.deviceName.trim().toLowerCase() === zoneId
          );

          if (!widget?.params) return;

          // ZoneName
          let zoneParam = widget.params.find(
            (p: any) => p.name.toLowerCase() === 'zonename'
          );
          if (zoneParam) zoneParam.value = update.ZoneId;
          else widget.params.push({ name: 'ZoneName', value: update.ZoneId });

          // PeopleCount
          let countParam = widget.params.find(
            (p: any) => p.name.toLowerCase() === 'peoplecount'
          );
          if (countParam) countParam.value = count;
          else widget.params.push({ name: 'PeopleCount', value: count });

          // 🔥 HARD-CODE status = online (always)
          let statusParam = widget.params.find(
            (p: any) => p.name.toLowerCase() === 'status'
          );
          if (statusParam) statusParam.value = 'online';
          else widget.params.push({ name: 'Status', value: 'online' });
        });

        this.cdr.detectChanges();
      } catch (err) {
        console.error('⚠️ WebSocket message parse error:', err);
      }
    };

    this.ws.onerror = (err) => console.error('❌ WebSocket Error:', err);

    this.ws.onclose = () => {
      console.warn('🔌 WebSocket Disconnected — retrying in 1s...');
      setTimeout(() => this.connectWebSocket(), 1000);
    };
  }

  selectedWidgetId = ""
  showDeleteWidjet: boolean = false;
  cancelDelete() {
    this.showDeleteWidjet = false;
  }
  openDeleteWidget(widget: any) {
    this.selectedWidgetId = widget.mainId;
    this.showDeleteWidjet = true;
  }



deleteWidget() {
  this.device.deleteWidget(this.selectedWidgetId).subscribe({
    next: (res: any) => {
      console.log('Response:', res);

      // Accept both text and JSON
      if (typeof res === 'string' || res?.message === 'Deleted successfully') {
        alert("Deleted successfully");
        this.showDeleteWidjet = false;
        this.loadZoneSensors();
      }
    },
    error: (err) => {
      console.error(err);

      // Sometimes backend returns 200 with empty body → Angular treats as error
      if (err.status === 200) {
        alert("Deleted successfully");
        this.showDeleteWidjet = false;
        this.loadZoneSensors();
        return;
      }

      alert("Error deleting widget");
    }
  });
}




}