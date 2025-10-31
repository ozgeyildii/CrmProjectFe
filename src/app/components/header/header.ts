import { Component } from '@angular/core';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  name: string = 'Guest';
  role: string[]= ['Business Analyst'];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
     console.log("Role var:", this.authService.userState().user?.roles);
    console.log("Burdayım");
    this.name = this.authService.userState().user?.sub || 'Guest';
    this.role = this.authService.userState().user?.roles || ['User'];
  }
}
