import { Component } from '@angular/core';

@Component({
  selector: 'app-document-status',
  templateUrl: './document-prueba.component.html',
  styleUrls: ['./document-prueba.component.css']
})
export class DocumentPruebaComponent {
  toggleDetails(stepId: string) {
    const step = document.getElementById(stepId);
    if (step) {
      step.classList.toggle('expanded');

      const arrow = document.getElementById('arrow-' + stepId);
      if (arrow) {
        arrow.classList.toggle('rotated');
      }
    }
  }
}
