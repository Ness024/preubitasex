import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DataService } from '../../service/data.service';

// Definición de tipos e interfaces
enum StatusType {
  Received = 1,
  InProcess = 2,
  InSigning = 3,
  Signed = 4,
  Completed = 5,
  Delivered = 6,
  Archived = 7,
  Cancelled = 8
}

interface StatusBase {
  id: number;
  document_id: string;
  status_id: StatusType;
  comment: string;
  created_at: string;
  updated_at: string;
}

interface ReceivedForm {
  received_date: string;
  received_by: string;
}

interface InProcessForm {
  responsible: string;
  department: string;
  description: string;
}

interface InSigningForm {
  sent_to: string;
  position: string;
  deadline_date: string;
}

interface SignedForm {
  concluded_by: string;
  signing_date: string;
  conclusion_notes: string;
}

interface CompletedForm {
  concluded_by: string;
  conclusion_date: string;
  conclusion_notes: string;
}

interface DeliveredForm {
  delivered_by: string;
  delivery_to: string;
  delivery_date: string;
  delivery_notes: string;
}

interface ArchivedForm {
  archived_by: string;
  archived_date: string;
  archived_file_location: string;
}

interface CancelledForm {
  cancellation_date: string;
  cancellation_reason: string;
  cancellation_notes: string;
}

type DocumentStatus = StatusBase & (
  | { status_id: StatusType.Received; form: ReceivedForm }
  | { status_id: StatusType.InProcess; form: InProcessForm }
  | { status_id: StatusType.InSigning; form: InSigningForm }
  | { status_id: StatusType.Signed; form: SignedForm }
  | { status_id: StatusType.Completed; form: CompletedForm }
  | { status_id: StatusType.Delivered; form: DeliveredForm }
  | { status_id: StatusType.Archived; form: ArchivedForm }
  | { status_id: StatusType.Cancelled; form: CancelledForm }
);

@Component({
  selector: 'app-status-history',
  templateUrl: './status-history.component.html',
  styleUrls: ['./status-history.component.scss'],
  imports: [CommonModule]
})
export class StatusHistoryComponent implements OnInit {
  @Input() documentId: string = '';
  @Input() documentTitle: string = '';
  statusHistory: DocumentStatus[] = [];
  StatusType = StatusType;
  expandedSteps: Set<number> = new Set();
  currentStatusId: StatusType = StatusType.Received;
  statusOrder: StatusType[] = [
    StatusType.Received,
    StatusType.InProcess,
    StatusType.InSigning,
    StatusType.Signed,
    StatusType.Completed,
    StatusType.Delivered,
    StatusType.Archived,
    StatusType.Cancelled
  ];

  constructor(
    private dataservic: DataService
  ) {}

  ngOnInit(): void {
    this.dataservic.getDocumentHistory(this.documentId).subscribe({
      next: (response) => {
        if (response && response.status_history) {
          this.statusHistory = response;
        } else {
          console.warn('No status history found for the document.');
        }
      },
      error: (error) => {
        console.error('Error fetching document history:', error);
      }
  })
  }

  toggleStep(statusId: StatusType): void {
    if (this.expandedSteps.has(statusId)) {
      this.expandedSteps.delete(statusId);
    } else {
      this.expandedSteps.add(statusId);
    }
  }

  isExpanded(statusId: StatusType): boolean {
    return this.expandedSteps.has(statusId);
  }

  getStatusClass(statusId: StatusType): string {
    if (statusId < this.currentStatusId) {
      return 'completed';
    } else if (statusId === this.currentStatusId) {
      return 'active';
    }
    return '';
  }

  getStatusBadge(statusId: StatusType): { class: string, text: string } {
    if (statusId < this.currentStatusId) {
      return { class: 'bg-green-100 text-green-700', text: 'Completado' };
    } else if (statusId === this.currentStatusId) {
      return { class: 'bg-primary-100 text-primary-700', text: 'En proceso' };
    }
    return { class: 'bg-gray-100 text-gray-600', text: 'Pendiente' };
  }

  getStatusTitle(statusId: StatusType): string {
    const titles = {
      [StatusType.Received]: 'Recepcionado',
      [StatusType.InProcess]: 'En trámite',
      [StatusType.InSigning]: 'En firma',
      [StatusType.Signed]: 'Firmado',
      [StatusType.Completed]: 'Concluido',
      [StatusType.Delivered]: 'Entregado',
      [StatusType.Archived]: 'Archivado',
      [StatusType.Cancelled]: 'Cancelado'
    };
    return titles[statusId] || '';
  }

  getStatusIcon(statusId: StatusType): string {
    if (statusId < this.currentStatusId) {
      return 'fas fa-check';
    } else if (statusId === this.currentStatusId) {
      return 'fas fa-pen';
    }
    return '';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getShortDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getStatusData(statusId: StatusType): DocumentStatus | null {
    return this.statusHistory.find(item => item.status_id === statusId) || null;
  }
}
