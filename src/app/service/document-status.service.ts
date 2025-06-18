import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  DocumentStatus,
  StatusFormData,
  DocumentStatusHistory,
  StatusConfig,
  Department
} from '../models/documents.models';

@Injectable({
  providedIn: 'root'
})
export class DocumentStatusService {
  private apiUrl = 'api/documents';

  // Configuración de estados reutilizable
  public statusConfigs: StatusConfig[] = [
    {
      id: 'received',
      name: 'Recepcionado',
      color: '#a0a0a0',
      icon: 'fa-inbox',
      tooltip: 'Documento recibido o registrado en el sistema',
      formFields: ['received_by', 'received_date'],
      requiredFields: ['received_by', 'received_date']
    },
    {
      id: 'in_process',
      name: 'En Trámite',
      color: 'var(--color-theme-orange)',
      icon: 'fa-tasks',
      tooltip: 'Documento en proceso en revisión o gestión',
      formFields: ['responsible', 'department', 'description'],
      requiredFields: ['responsible', 'department', 'description']
    },
    // ... otros estados con su configuración
  ];

  constructor(private http: HttpClient) {}

  // Métodos reutilizables
  getStatusConfig(statusId: DocumentStatus): StatusConfig | undefined {
    return this.statusConfigs.find(s => s.id === statusId);
  }

  getDocumentHistory(documentId: string): Observable<DocumentStatusHistory[]> {
    return this.http.get<DocumentStatusHistory[]>(`${this.apiUrl}/${documentId}/history`);
  }

  updateDocumentStatus(documentId: string, statusData: StatusFormData): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${documentId}/status`, statusData);
  }

  getDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(`${this.apiUrl}/departments`);
  }
}
