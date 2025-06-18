import { Component, Input } from '@angular/core';
import { DocumentStep } from '../../../models/document-step.model';

@Component({
  selector: 'app-received-step',
  imports: [],
  template: `
    <div class="received-step">
  <div class="detail-grid">
    <div class="detail-item">
      <label>Recibido por:</label>
      <!--<p>{{ step.details.receivedBy || 'No especificado' }}</p>-->
      <p>tu culito es mio bb</p>
    </div>
  </div>
</div>
  `,
  styles: `
  .received-step {
  background-color: #f0f9ff;
  border-left: 4px solid #0ea5e9;
  padding: 1rem;
  border-radius: 0 8px 8px 0;
}

.received-step .detail-item label {
  color: #0369a1;
  font-weight: 500;
}
`
})
export class ReceivedStepComponent {

  @Input() step!: DocumentStep;



}
