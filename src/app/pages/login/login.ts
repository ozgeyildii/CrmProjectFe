import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { UserJwtModel } from '../../models/userJwtModel';
import { jwtDecode } from 'jwt-decode';
 
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  loginStatus: 'success' | 'error' | null = null;
 
  constructor(private fb: FormBuilder, private authService:AuthService, private router:Router) {}
 
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
 
  isInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }
 
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
 
  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if(this.loginForm.valid)
    {
      console.log("Validasyonlar başarılı, istek gönderiliyor...")
      console.log(this.loginForm.value);
      this.authService.sendLoginRequest(this.loginForm.value).subscribe({
            next: (response) => {
              const jwt = response.token;
              localStorage.setItem('token', jwt);
      
              const decodedJwt = jwtDecode<UserJwtModel>(jwt);
              console.log(decodedJwt);
      
              this.authService.userState.set({
                isLoggedIn: true,
                user: { sub: decodedJwt.sub!, roles: decodedJwt.roles },
              });
              console.log(this.authService.userState());
              this.router.navigateByUrl("customers/search");
            },
            error: (error) => {
              console.error('Login failed:', error);
            },
          });
    }
    setTimeout(() => (this.loginStatus = null), 3000);
  }
}