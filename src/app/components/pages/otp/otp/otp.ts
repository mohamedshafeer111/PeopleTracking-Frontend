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

      // Store token
      // localStorage.setItem('authToken', response.token);

       localStorage.setItem('token', response.token);


      // Store userid
      localStorage.setItem('userid', response.userid);

      // Navigate to dashboard
      this.router.navigate(['/dashboard']);
    },
    (error: any) => {
      alert(error);
    }
  );
}




}







