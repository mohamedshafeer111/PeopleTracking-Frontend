import { Component } from '@angular/core';
import { User } from '../../../service/user/user';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-otp',
  imports: [FormsModule, CommonModule],
  templateUrl: './otp.html',
  styleUrl: './otp.css'
})
export class Otp {




  loginUser = {
    otp: '',
    email: ''
  }



  constructor(private user: User, private router: Router) {
     this.loginUser.email = localStorage.getItem('userEmail') || '';
   }


 
verifyOtp() {
  this.user.verifyOtp(this.loginUser).subscribe(
    (response: any) => {
      alert(response.message);

      localStorage.setItem('token', response.token.token);
      localStorage.setItem('userid', response.userid);

      const roleId = response.token.roleId;
      localStorage.setItem('roleId', roleId);

      // Fetch role permissions and store them
      this.user.getRoleById(roleId).subscribe(
        (roleData: any) => {
          // Store permissions as JSON string
          localStorage.setItem('permissions', JSON.stringify(roleData.assignPermissions));
          this.router.navigate(['/dashboard']);
        },
        (error: any) => {
          console.error('Failed to fetch role permissions', error);
          // Navigate anyway, handle missing permissions in navbar
          this.router.navigate(['/dashboard']);
        }
      );
    },
    (error: any) => {
      alert(error);
    }
  );
}




}












