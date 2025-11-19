import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Peopletype } from '../../../service/peopletype/peopletype';
import { FormsModule } from '@angular/forms';
import { Roleservice } from '../../../service/role/roleservice';

@Component({
  selector: 'app-devices',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './devices.html',
  styleUrl: './devices.css'
})


export class Devices implements OnInit {
  ngOnInit(): void {
    // ✅ Load initial data here
    // this.loadDeviceTypes();
    this.loadDevices();
    this.loadDeviceTypes();
    this.loadDeviceParameters()



    //from project component 
    this.loadProject();
  }
  constructor(private deviceService: Peopletype, private cdr: ChangeDetectorRef, private role: Roleservice) { }

  activeTab: string = 'device';
  deviceList: any[] = [];

  setActive(tab: string) {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }











  
  





  openAddDevice = false;

  createDevice: any = {
    deviceType: '',
    uniqueId: '',
    model: '',
    project: '',
    deviceName: '',
    country: '',
    area: '',
    building: '',
    floor: '',
    zone: '',
    status: false
  };

  openCreateDevicePopup() {
    this.openAddDevice = true;

    // Reset all device fields
    this.createDevice = {
      deviceType: '',
      uniqueId: '',
      model: '',
      area: '',
      building: '',
      floor: '',
      zone: '',
      deviceName: '',
      status: false
    };

    // Reset project and country selections
    this.selectedProjectId = '';
    this.selectedCountryId = '';
  }



  closeCreateDevicePopup() {
    this.openAddDevice = false;
  }

createNewDevice() {
  // 🔍 Step-by-step field validation
  if (!this.createDevice.deviceType) {
    alert("⚠️ Please select a Device Type.");
    return;
  }

  if (!this.createDevice.deviceName?.trim()) {
    alert("⚠️ Please enter the Device Name.");
    return;
  }

  if (!this.createDevice.uniqueId?.trim()) {
    alert("⚠️ Please enter the Unique ID.");
    return;
  }

  if (!this.createDevice.model?.trim()) {
    alert("⚠️ Please enter the Model.");
    return;
  }

  if (!this.selectedProjectId) {
    alert("⚠️ Please select a Project.");
    return;
  }

  if (!this.selectedCountryId) {
    alert("⚠️ Please select a Country.");
    return;
  }

  if (!this.createDevice.area) {
    alert("⚠️ Please select an Area.");
    return;
  }

  if (!this.createDevice.building) {
    alert("⚠️ Please select a Building.");
    return;
  }

  if (!this.createDevice.floor) {
    alert("⚠️ Please select a Floor.");
    return;
  }

  if (!this.createDevice.zone) {
    alert("⚠️ Please select a Zone.");
    return;
  }

  // ✅ Find related data objects for display names
  const projectObj = this.projects.find(p => p.id === this.selectedProjectId);
  const countryObj = (this.countriesByProject[this.selectedProjectId] || []).find(
    c => c.id === this.selectedCountryId
  );
  const areaObj = (this.areaByCountry[this.selectedCountryId] || []).find(
    a => a.id === this.createDevice.area
  );
  const buildingObj = (this.buildingByArea[this.createDevice.area] || []).find(
    b => b.id === this.createDevice.building
  );
  const floorObj = (this.floorByBuilding[this.createDevice.building] || []).find(
    f => f.id === this.createDevice.floor
  );
  const zoneObj = (this.zoneByFloor[this.createDevice.floor] || []).find(
    z => z.id === this.createDevice.zone
  );

  // ✅ Build the final request body
  const reqBody = {
    deviceType: this.createDevice.deviceType,
    uniqueId: this.createDevice.uniqueId,
    model: this.createDevice.model,

    projectId: this.selectedProjectId,
    projectName: projectObj?.projectName || "",

    countryId: this.selectedCountryId,
    countryName: countryObj?.countryName || "",

    areaId: this.createDevice.area,
    areaName: areaObj?.areaName || "",

    buildingId: this.createDevice.building,
    buildingName: buildingObj?.buildingName || "",

    floorId: this.createDevice.floor,
    floorName: floorObj?.floorName || "",

    zoneId: this.createDevice.zone,
    zoneName: zoneObj?.zoneName || "",

    deviceName: this.createDevice.deviceName,
    status: this.createDevice.status
  };

  console.log("🚀 Final Payload:", reqBody);

  // ✅ POST API call
  this.deviceService.createadddevice(reqBody).subscribe({
    next: (res: any) => {
      console.log("✅ Device created:", res);
      alert(res.message || "✅ Device created successfully!");
      this.openAddDevice = false;
      this.loadDevices(); // refresh list
    },
    error: (err: any) => {
      console.error("❌ Error creating device:", err);
      alert("❌ Failed to create device.");
    }
  });
}





  deviceSummary: any = {
    total: 0,
    active: 0,
    inactive: 0
  };
  deviceTypeOptions: string[] = [];

  loadDevices(): void {
    this.deviceService.getaddDevices().subscribe({
      next: (res: any) => {
        this.deviceList = res.data ? res.data : res;

        console.log("Device List:", this.deviceList);

        // ✅ Build summary
        this.deviceSummary = {
          total: this.deviceList.length,
          active: this.deviceList.filter((d: any) => d.status === true).length,
          inactive: this.deviceList.filter((d: any) => d.status === false).length
        };

        // ✅ Extract unique deviceType values for dropdown
        this.deviceTypeOptions = [
          ...new Set(this.deviceList.map((d: any) => d.deviceType))
        ];

        console.log("Device Type Options:", this.deviceTypeOptions);
        //new up

        console.log("Device Summary:", this.deviceSummary);

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error("Error loading devices", err);
      }
    });
  }



  //update add device

  openEditDevice = false;

  editDevice: any = {
    id: '',
    deviceType: '',
    uniqueId: '',
    model: '',
    projectName: '',
    deviceName: '',
    countryName: '',
    areaName: '',
    buildingName: '',
    floorName: '',
    zoneName: '',
    status: true
  };



openEditDevicePopup(device: any) {
  this.openEditDevice = true;

  // 1️⃣ Copy device data
  this.editDevice = { ...device };
  this.cdr.detectChanges();

  // 2️⃣ Map project name to ID
  const project = this.projects.find(p => p.projectName === device.projectName);
  this.editDevice.project = project?.id || '';
  this.selectedProjectId = this.editDevice.project;

  // 3️⃣ Load countries for the selected project
  if (this.editDevice.project) {
    this.role.countryGetById(this.editDevice.project).subscribe((countries: any) => {
      const countryArray = Array.isArray(countries) ? countries : [];
      this.countriesByProject[this.editDevice.project] = countryArray;

      // Map country name to ID
      const country = countryArray.find((c: any) => c.countryName === device.countryName);
      this.editDevice.country = country?.id || '';
      this.selectedCountryId = this.editDevice.country;

      // 4️⃣ Load areas for the selected country
      if (this.editDevice.country) {
        this.role.getSummary(this.editDevice.country).subscribe((areas: any) => {
          const areaArray = Array.isArray(areas) ? areas : [];
          this.areaByCountry[this.editDevice.country] = areaArray;

          const area = areaArray.find((a: any) => a.areaName === device.areaName);
          this.editDevice.area = area?.id || '';

          // 5️⃣ Load buildings for the selected area
          if (this.editDevice.area) {
            this.role.getBuilding(this.editDevice.area).subscribe((buildings: any) => {
              const buildingArray = Array.isArray(buildings) ? buildings : [];
              this.buildingByArea[this.editDevice.area] = buildingArray;

              const building = buildingArray.find((b: any) => b.buildingName === device.buildingName);
              this.editDevice.building = building?.id || '';

              // 6️⃣ Load floors for the selected building
              if (this.editDevice.building) {
                this.role.getFloor(this.editDevice.building).subscribe((floors: any) => {
                  const floorArray = Array.isArray(floors) ? floors : [];
                  this.floorByBuilding[this.editDevice.building] = floorArray;

                  const floor = floorArray.find((f: any) => f.floorName === device.floorName);
                  this.editDevice.floor = floor?.id || '';

                  // 7️⃣ Load zones for the selected floor
                  if (this.editDevice.floor) {
                    this.role.getZones(this.editDevice.floor).subscribe((zones: any) => {
                      const zoneArray = Array.isArray(zones) ? zones : [];
                      this.zoneByFloor[this.editDevice.floor] = zoneArray;

                      const zone = zoneArray.find((z: any) => z.zoneName === device.zoneName);
                      this.editDevice.zone = zone?.id || '';
                      this.cdr.detectChanges();
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  }
}






  closeEditDevicePopup() {
    this.openEditDevice = false;
  }

 updateDevice() {
  const missingFields: string[] = [];

  // ✅ Helper to detect empty, null, undefined, or string "null"/"undefined"
  const isEmpty = (value: any): boolean => {
    if (value === undefined || value === null) return true;
    const str = value.toString().trim().toLowerCase();
    return str === "" || str === "null" || str === "undefined";
  };

  // ✅ Validation
  if (isEmpty(this.editDevice.deviceType)) missingFields.push("Device Type");
  if (isEmpty(this.editDevice.deviceName)) missingFields.push("Device Name");
  if (isEmpty(this.editDevice.uniqueId)) missingFields.push("Unique ID");
  if (isEmpty(this.editDevice.model)) missingFields.push("Model");
  if (isEmpty(this.editDevice.project)) missingFields.push("Project");
  if (isEmpty(this.editDevice.country)) missingFields.push("Country");
  if (isEmpty(this.editDevice.area)) missingFields.push("Area");
  if (isEmpty(this.editDevice.building)) missingFields.push("Building");
  if (isEmpty(this.editDevice.floor)) missingFields.push("Floor");
  if (isEmpty(this.editDevice.zone)) missingFields.push("Zone");

  // ✅ Stop if any field is missing
  if (missingFields.length) {
    alert("⚠️ Please fill in the following fields: " + missingFields.join(", "));
    return;
  }

  // ✅ Stop if status is OFF
  if (!this.editDevice.status) {
    alert("⚠️ Device status is OFF. Please enable it before updating.");
    return;
  }

  // ✅ Find related objects for mapping (same as createNewDevice)
  const projectObj = this.projects.find(p => p.id === this.editDevice.project);
  const countryObj = (this.countriesByProject[this.editDevice.project] || []).find(
    c => c.id === this.editDevice.country
  );
  const areaObj = (this.areaByCountry[this.editDevice.country] || []).find(
    a => a.id === this.editDevice.area
  );
  const buildingObj = (this.buildingByArea[this.editDevice.area] || []).find(
    b => b.id === this.editDevice.building
  );
  const floorObj = (this.floorByBuilding[this.editDevice.building] || []).find(
    f => f.id === this.editDevice.floor
  );
  const zoneObj = (this.zoneByFloor[this.editDevice.floor] || []).find(
    z => z.id === this.editDevice.zone
  );

  // ✅ Prepare final payload (parallel to createNewDevice)
  const reqBody = {
    id: this.editDevice.id,

    deviceType: this.editDevice.deviceType.trim(),
    uniqueId: this.editDevice.uniqueId.trim(),
    model: this.editDevice.model.trim(),
    deviceName: this.editDevice.deviceName.trim(),

    projectId: this.editDevice.project,
    projectName: projectObj ? projectObj.projectName : '',

    countryId: this.editDevice.country,
    countryName: countryObj ? countryObj.countryName : '',

    areaId: this.editDevice.area,
    areaName: areaObj ? areaObj.areaName : '',

    buildingId: this.editDevice.building,
    buildingName: buildingObj ? buildingObj.buildingName : '',

    floorId: this.editDevice.floor,
    floorName: floorObj ? floorObj.floorName : '',

    zoneId: this.editDevice.zone,
    zoneName: zoneObj ? zoneObj.zoneName : '',

    status: this.editDevice.status
  };

  console.log('🧾 Final Update Payload:', reqBody);

  // ✅ Double-check for any empty string values
  const emptyReqKeys = Object.keys(reqBody).filter(
    key => reqBody[key as keyof typeof reqBody]?.toString().trim() === ""
  );
  if (emptyReqKeys.length) {
    alert("⚠️ Invalid data: Some required values are empty (" + emptyReqKeys.join(", ") + ")");
    return;
  }

  // ✅ PUT/UPDATE API call
  this.deviceService.updateAddDevice(reqBody, this.editDevice.id).subscribe({
    next: (res: any) => {
      alert(res.message || "✅ Device updated successfully!");
      this.closeEditDevicePopup();
      this.loadDevices();
    },
    error: (err: any) => {
      console.error("❌ Error updating device:", err);
      alert("❌ Error updating device.");
    }
  });
}






  //delete add device

  openDeleteDevice = false;
  deleteDeviceId: string = '';

  openDeleteDevicePopup(device: any) {
    // Use the correct ID field here. Example:
    this.deleteDeviceId = device.id || device._id || device.uniqueId;
    this.openDeleteDevice = true;
  }


  closeDeleteDevicePopup() {
    this.openDeleteDevice = false;
    this.deleteDeviceId = '';
  }

  confirmDeleteDevice() {
    if (!this.deleteDeviceId) return;

    this.deviceService.DeleteAddDevice(this.deleteDeviceId).subscribe({
      next: (res: any) => {
        console.log("Delete response:", res);
        alert(res.message || "Device Deleted Successfully");
        this.closeDeleteDevicePopup();
        this.loadDevices(); // refresh list
      },
      error: (err: any) => {
        console.error("Error deleting device:", err);
        alert("Error deleting device");
      }
    });
  }






  // Device Type list


  deviceTypeList: any[] = [];
  currentPage: number = 1;
pageSize: number = 10;
pageSizes: number[] = [5, 10, 20, 50];
totalPages: number = 0;



  // Load Device Types from API
loadDeviceTypes(page: number = 1) {
  if (page < 1 || (this.totalPages && page > this.totalPages)) return;

  this.currentPage = page;
  this.deviceService.getaddDeviceType(this.currentPage, this.pageSize).subscribe({
    next: (res: any) => {
      this.deviceTypeList = Array.isArray(res.data) ? res.data : [];
      this.totalPages = res.totalPages || 1;
      this.cdr.detectChanges();
    },
    error: (err: any) => console.error("Error loading device types", err)
  });
}

onPageSizeChange(size: number) {
  this.pageSize = +size;
  this.currentPage = 1;
  this.loadDeviceTypes(this.currentPage);
}

nextPage() {
  if (this.currentPage < this.totalPages) {
    this.loadDeviceTypes(this.currentPage + 1);
  }
}

prevPage() {
  if (this.currentPage > 1) {
    this.loadDeviceTypes(this.currentPage - 1);
  }
}




  // Popup control for creating a device type
  openAddDeviceType = false;

  // Form model
  createDeviceTypeData: any = {
    deviceType: '',
    description: '',
    status: true
  };


  // Open create popup
  openCreateDeviceTypePopup() {
    this.openAddDeviceType = true;
    this.createDeviceTypeData = {
      deviceType: '',
      description: '',
      status: false
    };
  }

  // Close create popup
  closeCreateDeviceTypePopup() {
    this.openAddDeviceType = false;
  }

createDeviceType() {
  // 🔍 Validate fields one by one
  if (!this.createDeviceTypeData.deviceType?.trim()) {
    alert('⚠️ Please enter the Device Type.');
    return;
  }

  if (!this.createDeviceTypeData.description?.trim()) {
    alert('⚠️ Please enter the Description.');
    return;
  }

  // ✅ Validate status
  if (!this.createDeviceTypeData.status) {
    alert('⚠️ Device type can only be created when status is active.');
    return;
  }

  // ✅ Check for duplicate device type (case-insensitive)
  const isDuplicate = this.deviceTypeList.some(
    (type: any) =>
      type.deviceType?.trim().toLowerCase() ===
      this.createDeviceTypeData.deviceType.trim().toLowerCase()
  );

  if (isDuplicate) {
    alert('⚠️ This Device Type already exists!');
    return;
  }

  // ✅ Proceed only if all validations pass
  this.deviceService.createdeviceType(this.createDeviceTypeData).subscribe({
    next: (res: any) => {
      alert(res.message || '✅ Device Type Created Successfully');
      this.closeCreateDeviceTypePopup();
      this.loadDeviceTypes(); // reload list after creation
    },
    error: (err: any) => {
      console.error('❌ Error creating device type:', err);
      alert('❌ Error creating device type');
    }
  });
}




  //update device type



  // Popup control
  openEditDeviceType = false;

  // Holds the currently selected Device Type for editing
  editDeviceType: any = {
    id: '',
    deviceType: '',
    description: '',
    status: true
  };

  // Open the edit popup and fill it with selected row data
  openEditDeviceTypePopup(type: any) {
    this.openEditDeviceType = true;
    this.editDeviceType = { ...type }; // clone the object
  }

  // Close the popup
  closeEditDeviceTypePopup() {
    this.openEditDeviceType = false;
  }

  // Update Device Type API call
 updateDeviceType() {
  // 🔍 Validate fields one by one
  if (!this.editDeviceType.deviceType?.trim()) {
    alert('⚠️ Please enter the Device Type.');
    return;
  }

  if (!this.editDeviceType.description?.trim()) {
    alert('⚠️ Please enter the Description.');
    return;
  }

  // ✅ Check if status is active
  if (!this.editDeviceType.status) {
    alert('⚠️ Device type can only be updated when status is active.');
    return;
  }

  // ✅ Proceed only if all validations pass
  console.log('Updating Device Type:', this.editDeviceType);

  this.deviceService.updateDevice(this.editDeviceType, this.editDeviceType.id).subscribe({
    next: (res: any) => {
      console.log('Update response:', res);
      alert(res.message || '✅ Device Type Updated Successfully');
      this.closeEditDeviceTypePopup();
      this.loadDeviceTypes(); // refresh list
    },
    error: (err: any) => {
      console.error('❌ Error updating Device Type:', err);
      alert('❌ Error updating Device Type');
    }
  });
}


  // Popup control
  openDeleteDeviceType = false;
  deleteDeviceTypeId: string = '';

  // Open the delete popup and store selected Device Type ID
  openDeleteDeviceTypePopup(type: any) {
    this.deleteDeviceTypeId = type.id || type._id;
    this.openDeleteDeviceType = true;
  }

  // Close the delete popup
  closeDeleteDeviceTypePopup() {
    this.openDeleteDeviceType = false;
    this.deleteDeviceTypeId = '';
  }

  // Confirm delete action
  confirmDeleteDeviceType() {
    if (!this.deleteDeviceTypeId) return;

    this.deviceService.DeleteDevicetype(this.deleteDeviceTypeId).subscribe({
      next: (res: any) => {
        console.log("Delete response:", res);
        alert(res.message || "Device Type Deleted Successfully");
        this.closeDeleteDeviceTypePopup();
        this.loadDeviceTypes(); // refresh table
      },
      error: (err: any) => {
        console.error("Error deleting Device Type:", err);
        alert("Error deleting Device Type");
      }
    });
  }










  //summary from project 


  projects: any[] = [];

  loadProject() {
    this.role.getProject().subscribe({
      next: (res: any) => {
        this.projects = res;
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("error loading project");
      }
    });
  }





  selectedProjectId: string = '';
  countriesByProject: { [projectId: string]: any[] } = {};


  onProjectChange(projectId: string) {
    this.selectedProjectId = projectId;
    this.createDevice.project = projectId; // ✅ add this
    // Fetch and cache if not already loaded
    if (!this.countriesByProject[projectId]) {
      this.role.countryGetById(projectId).subscribe({
        next: (res: any) => {
          this.countriesByProject[projectId] = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => {
          console.log("Error loading countries");
        }
      });
    }
  }





  selectedCountryId: string = '';
  areaByCountry: { [countryId: string]: any[] } = {};





  loadArea(countryId: string) {
    if (!this.areaByCountry[countryId]) {
      this.role.getSummary(countryId).subscribe({
        next: (res: any) => {
          this.areaByCountry[countryId] = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => {
          console.log("Error loading areas");
        }
      });
    }
  }


  onCountryChange(countryId: string) {
    this.selectedCountryId = countryId;
    this.createDevice.country = countryId; // ✅ add this
    this.loadArea(countryId);
  }




  selectedBuildingId: string = '';
  buildingByArea: { [areaId: string]: any[] } = {};

  loadBuilding(areaId: string) {
    if (!this.buildingByArea[areaId]) {
      this.role.getBuilding(areaId).subscribe({
        next: (res: any) => {
          this.buildingByArea[areaId] = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => {
          console.log("Error loading building");
        }
      });
    }
  }

  onAreaChange(areaId: string) {
    this.createDevice.area = areaId;
    this.loadBuilding(areaId);
  }





  selectedFloorId: string = '';
  floorByBuilding: { [buildingId: string]: any[] } = {};


  loadFloor(buildingId: string) {
    if (!this.floorByBuilding[buildingId]) {
      this.role.getFloor(buildingId).subscribe({
        next: (res: any) => {
          this.floorByBuilding[buildingId] = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => {
          console.log("Error loading floors");
        }
      });
    }
  }



  onBuildingChange(buildingId: string) {
    this.createDevice.building = buildingId;
    this.loadFloor(buildingId);
  }




  selectedZoneId: string = '';
  zoneByFloor: { [floorId: string]: any[] } = {};


  loadZones(floorId: string) {
    if (!this.zoneByFloor[floorId]) {
      this.role.getZones(floorId).subscribe({
        next: (res: any) => {
          this.zoneByFloor[floorId] = Array.isArray(res) ? res : [];
          this.cdr.detectChanges();
        },
        error: () => {
          console.log("Error loading zones");
        }
      });
    }
  }




  onFloorChange(floorId: string) {
    this.createDevice.floor = floorId;
    this.loadZones(floorId);
  }















  deviceParamsList: any[] = [];

  loadDeviceParameters() {
    this.deviceService.getAllDeviceParameters().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : [res];

        this.deviceParamsList = data.map((device: any) => ({
          ...device,
          parameterNames: device.deviceParameters.map((p: any) => p.name).join(', ')
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading device parameters', err);
      }
    });
  }



  addDevicePara: boolean = false;

openAddDevicePara() {
  this.addDevicePara = true;
  this.loadDevices();

  // ✅ Completely reset all fields
  this.createPara = {
    deviceId: '',
    deviceName: '',
    deviceParameters: ''
  };
}


  closeAddDevicepara() {
    this.addDevicePara = false;
  }

  createPara: any = {
    deviceId: '',
    deviceName: '',
    deviceParameters: ''
  };

  createNewDevicePara() {
    // ✅ Find the selected device name based on selected ID
    const selectedDevice = this.deviceList.find(
      (d: any) => d.id === this.createPara.deviceId
    );

    if (!selectedDevice) {
      alert('Please select a valid device.');
      return;
    }

    // ✅ Construct payload exactly as backend expects
    const payload = {
      deviceId: this.createPara.deviceId, // From dropdown
      deviceName: selectedDevice.deviceName, // Auto-filled from deviceList
      deviceParameters: this.createPara.deviceParameters
        ? this.createPara.deviceParameters.split(',').map((p: string) => p.trim())
        : []
    };

    console.log('✅ Request Payload:', payload);

    // ✅ Call API
    this.deviceService.addNewPara(payload).subscribe({
      next: (res) => {
        alert('Parameter created successfully!');
        this.closeAddDevicepara();
        this.loadDeviceParameters();
      },
      error: (err) => {
        console.error('❌ Failed to create parameter:', err);
        alert('Failed to create parameter.');
      }
    });
  }



  updatePara: boolean = false;
  selectedParaIdToUpdate = "";

  updateParaData = {
    deviceId: '',
    deviceName: '',
    deviceParameters: ''
  };
openUpdatePara(device: any) {
  // Extract parameter names correctly
  const parameterNames = device.deviceParameters.map((p: any) =>
    typeof p === 'string' ? p : p.name
  );

  this.updateParaData = {
    deviceId: device.deviceId || device.id,
    deviceName: device.deviceName,
    deviceParameters: parameterNames.join(', ') // convert names to comma-separated string
  };

  this.selectedParaIdToUpdate = device.id;
  this.updatePara = true;
}

  closeUpdatePara() {
    this.updatePara = false
  }

  updateDevicePara() {
    if (!this.updateParaData.deviceId) {
      alert("Please select a valid device");
      return;
    }

    const selectedDevice = this.deviceList.find(
      (d: any) => d.id === this.updateParaData.deviceId
    );

    const payload = {
      deviceId: this.updateParaData.deviceId,
      deviceName: selectedDevice ? selectedDevice.deviceName : this.updateParaData.deviceName,
      deviceParameters: this.updateParaData.deviceParameters
        ? this.updateParaData.deviceParameters.split(',').map((p: string) => p.trim())
        : []
    };

    console.log("Final payload to update:", payload);

    this.deviceService.updateDeviceParametersById(this.selectedParaIdToUpdate, payload)
      .subscribe({
        next: (res: any) => {
          console.log("Device parameter updated successfully", res);
          alert("Device parameter updated successfully!");
          this.closeUpdatePara();
          this.loadDeviceParameters();
        },
        error: (err) => {
          console.error("Error updating device parameter:", err);
          alert("Failed to update device parameter");
        }
      });
  }

  deletePara: boolean = false;
  selectedParaIdToDelete = '';

  openDeletePara(device: any) {
    this.deletePara = true;
    this.selectedParaIdToDelete = device.id;
  }

  closeDeletePara() {
    this.deletePara = false;
  }

  deleteDevicePara() {
    this.deviceService.deleteDevicePara(this.selectedParaIdToDelete).subscribe({
      next: (res: any) => {
        alert("Parameter Deleted Successfully");
        this.closeDeletePara();
        this.loadDeviceParameters();

      },
      error: () => {
        alert("error deleting parameter")
      }
    })
  }





  
}








