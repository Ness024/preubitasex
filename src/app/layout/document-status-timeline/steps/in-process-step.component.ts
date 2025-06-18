import { Component, Input } from '@angular/core';
import { DocumentStep } from '../../../models/document-step.model';

@Component({
  selector: 'app-in-process-step',
  imports: [],
  template: `
    <div class="in-process-step">
  <div class="detail-grid">
    <div class="detail-item">
      <label>Responsable:</label>
      <p>{{ step.details.responsible }}</p>
    </div>

    <div class="detail-item">
      <label>Departamento:</label>
      <p>{{ step.details.department }}</p>
    </div>

    <div class="detail-item">
      <label>Tiempo de trámite:</label>
      <p>{{ processingTime }}</p>
    </div>

    <!--<div class="detail-item full-width">
      <label>Descripción:</label>
      <p>{{ step.details.description }}</p>
    </div>-->
  </div>
</div>
  `,
  styles: ``
})
export class InProcessStepComponent {
  @Input() step!: DocumentStep;

  get processingTime() {
    // Lógica para calcular tiempo de trámite
    return '3 días hábiles';
  }
}
