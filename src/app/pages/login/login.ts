import { Component, OnInit, signal } from '@angular/core';
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
  loginStatus = signal<'success' | 'error' | null>(null);
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[A-Za-z0-9._%+-]+@etiya\.com$/i),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(3)]],
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

    this.authService.sendLoginRequest(this.loginForm.value).subscribe({
      next: (response) => {
        const jwt = response.token;
        localStorage.setItem('token', jwt);

        const decodedJwt = jwtDecode<UserJwtModel>(jwt);
        this.authService.userState.set({
          isLoggedIn: true,
          user: { sub: decodedJwt.sub!, roles: decodedJwt.roles },
        });
        this.router.navigateByUrl('customers/search');
      },
      error: (error) => {
        console.error('[LOGIN ERROR]', error);
        if (error.status === 400 || error.status === 401) {
          this.loginStatus.set('error');
        } else {
          console.log('An unexpected error occurred. Please try again later.');
        }
      },
    });
  }
}
