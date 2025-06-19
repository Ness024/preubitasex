// document-status-timeline.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../service/data.service';

import { DocumentForm, FormReceived, FormInProcess, FormInSigning, FormSigned, FormDelivered, FormCompleted, FormCancelled, FormArchived } from '../../models/forms.model';
import { DocumentHistoryResponse, DocumentHistoryItem } from '../../models/document-history.model';
import { STATUS_KEYS } from '../../shared/constants/status.constants';
import { Status } from '../../models/document';

@Component({
  selector: 'app-document-status-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './document-status-timeline.component.html',
  styleUrls: ['./document-status-timeline.component.css']
})
export class DocumentStatusTimelineComponent implements OnInit {
  historyData: DocumentHistoryItem[] = [];
  relatedDocuments: Document[] = [];
  isLoading = true;
  error: string | null = null;
  statusKeys = STATUS_KEYS; // Exponer constantes para el template
  currentDocumentId = '03496a00-be65-4f49-99de-af2b550132fe'; // ID del documento actual

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.loadDocumentHistory(this.currentDocumentId);
  }

  loadDocumentHistory(documentId: string): void {
    this.isLoading = true;
    this.error = null;

    this.dataService.getDocumentHistory(documentId).subscribe({
      next: (response: DocumentHistoryResponse) => {
        this.historyData = this.sortHistoryByDate(response.data);
        this.relatedDocuments = response.related_documents || [];
        this.isLoading = false;
        console.log('Document history loaded successfully', this.historyData);
      },
      error: (err) => {
        console.error('Error loading history', err);
        this.error = 'Failed to load document history';
        this.isLoading = false;
      }
    });
  }

  private sortHistoryByDate(history: DocumentHistoryItem[]): DocumentHistoryItem[] {
    return [...history].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // Helper para type-safe access al form
  getFormData<T>(item: DocumentHistoryItem): T {
    return item.form as T;
  }

  // Verificar tipo de estado
  isStatus(item: DocumentHistoryItem, statusKey: keyof typeof STATUS_KEYS): boolean {
    return item.status.key === STATUS_KEYS[statusKey];
  }

  getForm<T extends DocumentForm>(item: DocumentHistoryItem): T {
    return item.form as T;
  }



  // Métodos específicos por tipo de estado
  getReceivedDetails(item: DocumentHistoryItem): FormReceived {
    return this.getForm<FormReceived>(item);
  }
  getProcessDetails(item: DocumentHistoryItem): FormInProcess {
    return this.getForm<FormInProcess>(item);
  }
  getSigningDetails(item: DocumentHistoryItem): FormInSigning {
    return this.getForm<FormInSigning>(item);
  }
  getSignedDetails(item: DocumentHistoryItem): FormSigned {
    return this.getForm<FormSigned>(item);
  }
  getDeliveredDetails(item: DocumentHistoryItem): FormDelivered {
    return this.getForm<FormDelivered>(item);
  }
  getCompletedDetails(item: DocumentHistoryItem): FormCompleted {
    return this.getForm<FormCompleted>(item);
  }
  getCancelledDetails(item: DocumentHistoryItem): FormCancelled {
    return this.getForm<FormCancelled>(item);
  }
  getArchivedDetails(item: DocumentHistoryItem): FormArchived {
    return this.getForm<FormArchived>(item);
  }


  // Type guards para uso en template
  isReceivedForm(item: DocumentHistoryItem): item is DocumentHistoryItem & { form: FormReceived } {
    return item.status.key === STATUS_KEYS.RECEIVED;
  }
  isProcessForm(item: DocumentHistoryItem): item is DocumentHistoryItem & { form: FormInProcess } {
    return item.status.key === STATUS_KEYS.IN_PROCESS;
  }
  isSigningForm(item: DocumentHistoryItem): item is DocumentHistoryItem & { form: FormInSigning } {
    return item.status.key === STATUS_KEYS.IN_SIGNING;
  }
  isSignedForm(item: DocumentHistoryItem): item is DocumentHistoryItem & { form: FormSigned } {
    return item.status.key === STATUS_KEYS.IN_SIGNED;
  }
  isDeliveredForm(item: DocumentHistoryItem): item is DocumentHistoryItem & { form: FormDelivered } {
    return item.status.key === STATUS_KEYS.DELIVERED;
  }
  isCompletedForm(item: DocumentHistoryItem): item is DocumentHistoryItem & { form: FormCompleted } {
    return item.status.key === STATUS_KEYS.COMPLETED;
  }
  isCancelledForm(item: DocumentHistoryItem): item is DocumentHistoryItem & { form: FormCancelled } {
    return item.status.key === STATUS_KEYS.CANCELLED;
  }
  isArchivedForm(item: DocumentHistoryItem): item is DocumentHistoryItem & { form: FormArchived } {
    return item.status.key === STATUS_KEYS.ARCHIVED;
  }
}

