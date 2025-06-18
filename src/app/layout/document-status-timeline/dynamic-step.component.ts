/*

import { Component, Input } from '@angular/core';
import { DocumentStep } from '../../models/document-step.model';
import { ReceivedStepComponent } from "./steps/received-step.component";
import { InProcessStepComponent } from "./steps/in-process-step.component";
import { CommonModule } from '@angular/common';
import { GenericStepComponent } from "./steps/generic-step.component";

@Component({
  selector: 'app-document-status-timeline',
  imports: [CommonModule, GenericStepComponent],
  template:  `
    <ng-container [ngSwitch]="step.status">
      <app-received-step *ngSwitchCase="'received'" [step]="step"></app-received-step>
      <!--<app-in-process-step *ngSwitchCase="'in_process'" [step]="step"></app-in-process-step>
      <app-in-signing-step *ngSwitchCase="'in_signing'" [step]="step"></app-in-signing-step>
      <app-signed-step *ngSwitchCase="'in_signed'" [step]="step"></app-signed-step>
      <app-completed-step *ngSwitchCase="'completed'" [step]="step"></app-completed-step>
      <app-delivered-step *ngSwitchCase="'delivered'" [step]="step"></app-delivered-step>
      <app-archived-step *ngSwitchCase="'archived'" [step]="step"></app-archived-step>
      <app-cancelled-step *ngSwitchCase="'cancelled'" [step]="step"></app-cancelled-step>
      <app-reopened-step *ngSwitchCase="'reopened'" [step]="step"></app-reopened-step>--->

      <app-generic-step *ngSwitchDefault></app-generic-step>
    </ng-container>
  `
})
export class DynamicStepComponent {
   @Input() step!: DocumentStep;
}
 */
