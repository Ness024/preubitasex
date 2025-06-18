// document-history.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { DocumentStep } from '../models/document-step.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentHistoryService {
  private apiUrl = 'api/documents'; // Ajusta tu endpoint

  constructor(private http: HttpClient) {}

  /*getDocumentHistory(documentId: string): Observable<DocumentStep[]> {
    return this.http.get<any>(`${this.apiUrl}/${documentId}/history`).pipe(
      map(response => this.transformResponse(response))
    );
  }*/

  private transformResponse(response: any): DocumentStep[] {
    // Ordenar por fecha y marcar el paso actual
    return response.steps.map((step: any) => ({
      ...step,
      isCurrent: step.id === response.currentStepId
    })).sort((a: any, b: any) =>
      new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  // En el servicio, temporalmente para pruebas
getDocumentHistory(documentId: string): Observable<DocumentStep[]> {
  const mockResponse = {
    currentStepId: 'step3',
    steps: [
      {
        id: 'step1',
        status: 'received',
        title: 'Recepcionado',
        date: '2023-05-15T10:30:00',
        details: {
          receivedBy: 'Juan Pérez',
          receivedDate: '2023-05-15'
        }
      },
      {
        id: 'step2',
        status: 'in_process',
        title: 'En trámite',
        date: '2023-05-16T09:15:00',
        details: {
          responsible: 'María González',
          department: 'Recursos Humanos',
          description: 'Revisión de documentación'
        },
        relatedDocuments: [
          {
            id: 'doc1',
            name: 'Oficio RH-2023-0125',
            type: 'Solicitud de revisión',
            icon: 'file-alt'
          }
        ]
      },
      {
        id: 'step3',
        status: 'in_signing',
        title: 'En firma',
        date: '2023-05-18T14:45:00',
        isCurrent: true,
        details: {
          sentTo: 'Carlos Rodríguez',
          position: 'Director General',
          deadlineDate: '2023-05-25'
        }
      }
    ]
  };

  return of(this.transformResponse(mockResponse));
}
}
