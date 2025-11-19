import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Roleservice } from '../../../service/role/roleservice';

@Component({
  selector: 'app-createprocessautomation',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './createprocessautomation.html',
  styleUrl: './createprocessautomation.css'
})
export class Createprocessautomation {



  activeTab: string = 'project'; // 👈 default tab
  // projects: any[] = [];
  // expandedProjects = new Set<string>();
  // countriesByProject: { [projectId: string]: any[] } = {};
  // currentProjectId: string | null = null;
  // expandedCountry: Set<string> = new Set();
  // areaByCountry: { [countryId: string]: any[] } = {};
  // expandedArea: Set<string> = new Set();
  // buildingByArea: { [areaId: string]: any[] } = {};
  // expandedBuilding: Set<string> = new Set();
  // floorByBuilding: { [buildingId: string]: any[] } = {};
  // expandedFloor: Set<string> = new Set();
  // zoneByFloor: { [floorId: string]: any[] } = {};
  // expandedZone: Set<string> = new Set();
  // subZoneByZone: { [zoneId: string]: any[] } = {};



  constructor(private role: Roleservice, private cdr: ChangeDetectorRef) { }

    ngOnInit(): void {

    this.loadProject();
  }






















  // loadProject() {
  //   this.role.getProject().subscribe({
  //     next: (res: any) => {
  //       this.projects = res;
  //       this.cdr.detectChanges();

  //     },
  //     error: () => {
  //       console.log("error loading project")
  //     }
  //   })
  // }




  // loadCountries(projectId: string) {
  //   // toggle open/close
  //   if (this.expandedProjects.has(projectId)) {
  //     this.expandedProjects.delete(projectId);
  //     return;
  //   }

  //   this.role.countryGetById(projectId).subscribe({
  //     next: (res: any) => {
  //       // ✅ Only assign the array part
  //       this.countriesByProject[projectId] = Array.isArray(res) ? res : [];
  //       this.expandedProjects.add(projectId);
  //       this.cdr.detectChanges();
  //     },
  //     error: () => {
  //       console.log("Error loading countries");
  //     }
  //   });
  // }





  // loadArea(countryId: string) {
  //   // toggle open/close
  //   if (this.expandedCountry.has(countryId)) {
  //     this.expandedCountry.delete(countryId);
  //     return;
  //   }

  //   // If not cached, fetch areas
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
  //     // Already cached → just open
  //     this.expandedCountry.add(countryId);
  //     this.cdr.detectChanges();
  //   }
  // }





  // loadBuilding(areaId: string) {
  //   // toggle open/close
  //   if (this.expandedArea.has(areaId)) {
  //     this.expandedArea.delete(areaId);
  //     return;
  //   }

  //   this.role.getBuilding(areaId).subscribe({
  //     next: (res: any) => {
  //       // ✅ assign areas of this country
  //       this.buildingByArea[areaId] = Array.isArray(res) ? res : [];

  //       this.expandedArea.add(areaId);
  //       this.cdr.detectChanges();
  //     },
  //     error: () => {
  //       console.log("Error loading building");
  //     }
  //   });
  // }

  // floors: any[] = [];
  // loadFloor(buildingId: string) {

  //   if (this.expandedBuilding.has(buildingId)) {
  //     this.expandedBuilding.delete(buildingId);
  //     return;
  //   }

  //   this.role.getFloor(buildingId).subscribe({
  //     next: (res: any) => {
  //       console.log("Floors for building:", buildingId, res);
  //       this.floors = res; // ✅ store floors of this building     new 16

  //       this.floorByBuilding[buildingId] = Array.isArray(res) ? res : [];

  //       this.expandedBuilding.add(buildingId);
  //       this.cdr.detectChanges();
  //     },
  //     error: () => {
  //       console.log("Error loading floor");
  //     }
  //   });
  // }



  // zones: any[] = [];
  // loadZones(floorId: string) {
  //   if (this.expandedFloor.has(floorId)) {
  //     this.expandedFloor.delete(floorId);
  //     return;
  //   }

  //   this.role.getZones(floorId).subscribe({
  //     next: (res: any) => {
  //       console.log("Zones for floor:", floorId, res);
  //       this.zones = res; // store zones of this floor (optional, if you need flat list)

  //       this.zoneByFloor[floorId] = Array.isArray(res) ? res : [];

  //       this.expandedFloor.add(floorId);
  //       this.cdr.detectChanges();
  //     },
  //     error: () => {
  //       console.log("Error loading zones");
  //     }
  //   });
  // }




  // subZones: any[] = [];
  // loadSubZones(zoneId: string) {
  //   if (this.expandedZone.has(zoneId)) {
  //     this.expandedZone.delete(zoneId); // collapse if already open
  //     return;
  //   }

  //   this.role.getSubZones(zoneId).subscribe({
  //     next: (res: any) => {
  //       console.log("SubZones for zone:", zoneId, res);
  //       this.subZones = res; // optional flat list (like floors)

  //       this.subZoneByZone[zoneId] = Array.isArray(res) ? res : [];

  //       this.expandedZone.add(zoneId);
  //       this.cdr.detectChanges();
  //     },
  //     error: () => {
  //       console.error("Error loading subzones");
  //     }
  //   });
  // }


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


}
