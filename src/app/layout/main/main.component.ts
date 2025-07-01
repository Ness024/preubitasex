import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { HeaderComponent } from "../header/header.component";
import { RouterOutlet } from '@angular/router';
import { ErrorComponent } from "../message/error/error.component";
import { SuccessfulComponent } from "../message/successful/successful.component";
import { WarningComponent } from "../message/warning/warning.component";
import { MatButtonModule } from '@angular/material/button';
import { MenuComponent } from "../menu/menu.component";

@Component({
  selector: 'app-main',
  imports: [HeaderComponent, RouterOutlet, ErrorComponent, SuccessfulComponent, MatButtonModule, MenuComponent, WarningComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})

export class MainComponent {
  @ViewChild('menuNav') menuNav!: ElementRef;
  screenWidth = window.innerWidth;
  isMenuOpen = false;

  constructor(private eRef: ElementRef) {}

  @HostListener('window:resize', [])
  onWindowResize() {
    this.onResize();
  }

  @HostListener('document:click', ['$event'])
onClickOutside(event: MouseEvent) {
  const targetElement = event.target as HTMLElement;
  const clickedInsideMenu = this.menuNav?.nativeElement.contains(targetElement);
  const clickedHamburgerButton = targetElement.closest('.menu-hamburguesa');
  const clickedLink = targetElement.closest('a');

  if (this.screenWidth < 1300 && this.isMenuOpen) {
    if (!clickedInsideMenu && !clickedHamburgerButton) {
      this.isMenuOpen = false;
    } else if (clickedLink) {
      this.isMenuOpen = false;
    }
  }
}


  ngOnInit() {
    this.onResize();
  }

  onResize() {
    this.screenWidth = window.innerWidth;
    if(this.screenWidth < 1300){
      this.isMenuOpen = false;
    }
    if(this.screenWidth > 1300){
      this.isMenuOpen = true;
    }
  }

  changeMenuOpen(){
    this.isMenuOpen = !this.isMenuOpen;
  }
}
