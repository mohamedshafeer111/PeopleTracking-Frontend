import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Roleservice } from '../../../service/role/roleservice';
import { response } from 'express';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-role',
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './role.html',
  styleUrl: './role.css'
})
export class Role implements OnInit {

  ngOnInit(): void {
    this.loadRole();
  }

  constructor(private roleService: Roleservice, private cdr: ChangeDetectorRef) { }

  roles: any[] = [];

  loadRole() {
    this.roleService.getRole().subscribe({
      next: (res: any) => {
        this.roles = res;
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("error loading role")
      }
    })
  }


  // createRoles = {
  //   roleName: "",
  //   description: ""
  // }



  // openCreateRole = false;

  // openCreateRolePopup() {
  //   this.createRoles = {
  //     roleName: "",
  //     description: ""
  //   }
  //   this.openCreateRole = true;

  // }

  // closeCreateRolePopup() {
  //   this.openCreateRole = false;
  // }

  // createRole() {
  //   this.roleService.createNewRole(this.createRoles).subscribe({
  //     next: (res: any) => {
  //       alert(res.message || 'Role created successfully');
  //       this.closeCreateRolePopup();
  //       this.loadRole();
  //     },
  //     error: () => {
  //       alert("error creating role")
  //     }
  //   })
  // }




  //Edit


  editRoles = {
    roleName: "",
    description: ""

  }

  selectedRoleId: string = '';


  openEditRole = false;

  openeditRolePopup(role:any) {

    this.selectedRoleId =role.id;
    this.editRoles = {
      roleName:role.roleName,
      description:role.description
    }
    this.openEditRole = true;

  }

  closeEditRolePopup() {
    this.openEditRole = false;
  }

  updateRole() {
    this.roleService.updateRole(this.editRoles,this.selectedRoleId).subscribe({
      next: (res: any) => {
        alert(res.message || 'Role Updated successfully');
        this.closeEditRolePopup();
        this.loadRole();
      },
      error: () => {
        alert("error creating role")
      }
    })
  }



  // delete user



  openDeleteRole = false;

  


  openDeleteRolePopup(role: any) {
    this.selectedRoleId=role.id;
    
    this.openDeleteRole = true;

  }

  closeDeleteRolePopup() {
    this.openDeleteRole = false;
  }

  deleteRole() {
    this.roleService.DeleteRole(this.selectedRoleId).subscribe({
      next: (res: any) => {
        alert(res.message || 'User Deleted successfully');
        this.closeDeleteRolePopup();
        this.loadRole();
      },
      error: () => {
        alert("error Deleting user")
      }
    })
  }
  
  

}




