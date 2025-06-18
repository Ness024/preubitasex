/*import { Component } from '@angular/core';

@Component({
  selector: 'app-document-status-timeline',
  imports: [],
  templateUrl: './document-status-timeline.component.html',
  styleUrl: './document-status-timeline.component.css'
})
export class DocumentStatusTimelineComponent {

}
*/

import { Component, Input, OnInit } from '@angular/core';
import { DocumentStep } from '../../models/document-step.model';
import { CommonModule } from '@angular/common';
import { DataService } from '../../service/data.service';
import { ReceivedStepComponent } from "./steps/received-step.component";

@Component({
  selector: 'app-document-status-timeline',
  imports: [CommonModule, ReceivedStepComponent],
  templateUrl: './document-status-timeline.component.html',
  styleUrls: ['./document-status-timeline.component.css'],
})
export class DocumentStatusTimelineComponent implements OnInit {
  @Input() step!: DocumentStep;
  documentHistory: DocumentStep | null = null;
  loading = true;
  expandedSteps: Set<string> = new Set();

  constructor(
    private dataService: DataService
  ) {}

  ngOnInit(): void {
    const documentId = '0ad5fdf5-2848-471e-a1c5-52cb83093cb9'; // Obtener de la ruta
    this.dataService.getDocumentHistory(documentId).subscribe({
      next: (data) => {
        this.documentHistory = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading history', err);
        this.loading = false;
      }
    });
  }

}
