import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { User } from '../../models/user';

@Component({
  selector: 'app-dropdown-menu',
  imports: [MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './dropdown-menu.component.html',
  styleUrl: './dropdown-menu.component.css'
})

export class DropdownMenuComponent {
  name: string = '';
  constructor( private authsService: AuthService, private router: Router) {}
  
  ngOnInit(): void {
    this.authsService.user$.subscribe((user) => {
      if (user) {
        this.name = user.name;
      }
    });
  }

  isDropdownOpen = false;
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  logout() {
    this.authsService.logoutUser().subscribe({
      next: () => {
        this.router.navigate(['/login']); // Redirige al login
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
      }
    });
  }
}
