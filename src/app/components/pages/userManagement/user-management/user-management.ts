// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-user-management',
//   imports: [],
//   templateUrl: './user-management.html',
//   styleUrl: './user-management.css'
// })
// export class UserManagement {

// }




import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { User } from '../../../service/user/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Roleservice } from '../../../service/role/roleservice';
import { forkJoin } from 'rxjs';


@Component({
  selector: 'app-user-management',
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.css']
})
export class UserManagement implements OnInit {

  constructor(private user: User,private cdr:ChangeDetectorRef,private roleService: Roleservice) { }

  ngOnInit(): void {
    this.loadUser();
      this.loadRolesAndUsers();
  }

  users: any[] = [];



loadRolesAndUsers() {
  forkJoin({
    roles: this.roleService.getRole(),
    users: this.user.getUser()
  }).subscribe({
    next: ({ roles, users }: any) => {
      const roleList = roles.data || roles;
      const userList = users.data || users;

      this.roles = roleList;
      this.users = userList.map((user: any) => ({
        ...user,
        roleName: roleList.find((r: any) => r.id === user.role)?.roleName || user.role
      }));
      this.cdr.detectChanges();
    },
    error: () => {
      console.error('Error loading roles or users');
    }
  });
}





loadUser() {
  this.user.getUser().subscribe({
    next: (res: any) => {
      // Map role ID to readable role name
      this.users = res.map((user: any) => ({
        ...user,
        roleName: this.roles.find(r => r.id === user.role)?.roleName || user.role
      }));

      this.cdr.detectChanges();
      
    },
    error: () => {
      console.log("Error loading user");
    }
  });
}


  NewUser = {
    userName: '',
    contactNumber: '',
    email: '',
    password: '',
    role: ''
  };

  openNewUser = false;

  openCreateUserPopup() {
    this.loadRole();
    this.NewUser = {
      userName: '',
      contactNumber: '',
      email: '',
      password: '',
      role: ''
    }
    this.openNewUser = true;

  }

  closeCreateUserPopup() {
    this.openNewUser = false;
  }

createUser() {
  if (!this.NewUser.userName?.trim()) {
    alert('⚠️ Please enter the Username.');
    return;
  }

  if (!this.NewUser.email?.trim()) {
    alert('⚠️ Please enter the Email.');
    return;
  }

  // ✅ Email format validation using regex
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(this.NewUser.email.trim())) {
    alert('⚠️ Please enter a valid Email address (e.g., user@example.com).');
    return;
  }

  if (!this.NewUser.password?.trim()) {
    alert('⚠️ Please enter the Password.');
    return;
  }

  if (!this.NewUser.contactNumber?.trim()) {
    alert('⚠️ Please enter the Contact number.');
    return;
  }

  if (!this.NewUser.role) {
    alert('⚠️ Please select a Role.');
    return;
  }

  // ✅ Proceed only if all fields are valid
  const reqBody = { ...this.NewUser };

  this.user.addUser(reqBody).subscribe({
    next: (res: any) => {
      alert(res.message || 'User created successfully');
      this.closeCreateUserPopup();
      this.loadUser();
    },
    error: () => {
      alert('Error creating user');
    }
  });
}




UpdateUser = {
  userName: '',
  contactNumber: '',
  email: '',
  password: '',
  role: ''  // should store the role ID, not the full object
};



  openUpdateUser = false;
  selectedUserId: string = '';


 openUpdateUserPopup(user: any) {
  this.loadRole(); // Ensure roles are loaded
  this.selectedUserId = user.id;

  // If `user.role` is an object, use its ID; if it's already an ID, keep it
  const roleId =
    typeof user.role === 'object' && user.role !== null
      ? user.role.id
      : user.role;

  this.UpdateUser = {
    userName: user.userName,
    password: user.password,
    contactNumber: user.contactNumber,
    email: user.email,
    role: roleId // store only the ID
  };

  this.openUpdateUser = true;
}

  closeUpdateUserPopup() {
    this.openUpdateUser = false;
  }

  updateUser() {
  if (!this.UpdateUser.userName?.trim()) {
    alert('⚠️ Please enter the Username.');
    return;
  }

  if (!this.UpdateUser.email?.trim()) {
    alert('⚠️ Please enter the Email.');
    return;
  }

  // ✅ Email format validation using regex
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(this.UpdateUser.email.trim())) {
    alert('⚠️ Please enter a valid Email address (e.g., user@example.com).');
    return;
  }

  if (!this.UpdateUser.password?.trim()) {
    alert('⚠️ Please enter the Password.');
    return;
  }

  if (!this.UpdateUser.contactNumber?.trim()) {
    alert('⚠️ Please enter the Contact number.');
    return;
  }

  if (!this.UpdateUser.role) {
    alert('⚠️ Please select a Role.');
    return;
  }

  // ✅ Proceed only if all fields are valid
  this.user.updateUsers(this.UpdateUser, this.selectedUserId).subscribe({
    next: (res: any) => {
      alert(res.message || 'User updated successfully');
      this.closeUpdateUserPopup();
      this.loadUser();
    },
    error: () => {
      alert('Error updating user');
    }
  });
}




// delete user



  openDeleteUser = false;
  selectUserId: string = '';


  openDeleteUserPopup(user: any) {
    this.selectedUserId=user.id;
    
    this.openDeleteUser = true;

  }

  closeDeleteUserPopup() {
    this.openDeleteUser = false;
  }

  deleteUser() {
    this.user.DeleteUsers(this.selectedUserId).subscribe({
      next: (res: any) => {
        alert(res.message || 'User Deleted successfully');
        this.closeDeleteUserPopup();
        this.loadUser();
      },
      error: () => {
        alert("error updating user")
      }
    })
  }
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
}










