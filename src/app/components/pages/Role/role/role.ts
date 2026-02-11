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
  filteredRoles: any[] = []; // NEW
  searchOpen = false; // NEW
  searchTerm = ''; // NEW


  loadRole() {
    this.roleService.getRole().subscribe({
      next: (res: any) => {
        this.roles = res;
        this.filteredRoles = [...this.roles]; // NEW
        this.cdr.detectChanges();
      },
      error: () => {
        console.log("error loading role")
      }
    })
  }

  // NEW SEARCH METHODS
  toggleSearch() {
    this.searchOpen = !this.searchOpen;
    if (!this.searchOpen) {
      this.searchTerm = '';
      this.filterRoles();
    }
  }

  filterRoles() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredRoles = [...this.roles];
      return;
    }
    this.filteredRoles = this.roles.filter(role =>
      role.roleName.toLowerCase().includes(term) ||
      role.description.toLowerCase().includes(term)
    );
  }

  // Edit
  editRoles = {
    roleName: "",
    description: ""
  }

  selectedRoleId: string = '';
  openEditRole = false;

  openeditRolePopup(role: any) {
    this.selectedRoleId = role.id;
    this.editRoles = {
      roleName: role.roleName,
      description: role.description
    }
    this.openEditRole = true;
  }

  closeEditRolePopup() {
    this.openEditRole = false;
  }

  updateRole() {
    this.roleService.updateRole(this.editRoles, this.selectedRoleId).subscribe({
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

  // Delete role
  openDeleteRole = false;

  openDeleteRolePopup(role: any) {
    this.selectedRoleId = role.id;
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