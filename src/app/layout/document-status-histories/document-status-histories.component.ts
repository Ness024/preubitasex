// document-history.component.ts
import { Component, OnInit } from '@angular/core';
import { DocumentHistoryService } from '../../service/document-history.service';
import { DocumentStep } from '../../models/document-step.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-document-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-status-histories.component.html',
  styleUrls: ['./document-status-histories.component.css']
})
export class DocumentStatusHistoriesComponent implements OnInit {
  documentSteps: DocumentStep[] = [];
  loading = true;
  currentDocumentId = 'DOC-2023-0568'; // Esto debería venir de la ruta

  constructor(private historyService: DocumentHistoryService) {}

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.historyService.getDocumentHistory(this.currentDocumentId).subscribe({
      next: (steps) => {
        this.documentSteps = steps;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading history', err);
        this.loading = false;
      }
    });
  }


  // En el componente
expandedSteps: {[key: string]: boolean} = {};

getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    'received': 'fa-inbox',
    'in_process': 'fa-tasks',
    'in_signing': 'fa-signature',
    'in_signed': 'fa-check-circle',
    'completed': 'fa-flag-checkered',
    'delivered': 'fa-truck',
    'archived': 'fa-archive',
    'cancelled': 'fa-ban',
    'reopened': 'fa-redo'
  };
  return 'fas ' + (icons[status] || 'fa-circle');
}

getStatusName(status: string): string {
  const names: Record<string, string> = {
    'received': 'Recepcionado',
    'in_process': 'En trámite',
    'in_signing': 'En firma',
    'in_signed': 'Firmado',
    'completed': 'Concluido',
    'delivered': 'Entregado',
    'archived': 'Archivado',
    'cancelled': 'Cancelado',
    'reopened': 'Reabierto'
  };
  return names[status] || status;
}

toggleStep(stepId: string) {
  this.expandedSteps[stepId] = !this.expandedSteps[stepId];
}
}
