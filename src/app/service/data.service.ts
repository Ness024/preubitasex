import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, Document } from '../models/document';
import { filter } from './uda.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class DataService{
  readonly API_URL = `${environment.API_URL}documents`;

  constructor (private http: HttpClient) { }

  getDocuments(options?: {
    page?: number;
    per_page?: number;
    status_id?: number;
    category_id?: number;
    start_date?: string; // Formato 'YYYY-MM-DD'
    end_date?: string;   // Formato 'YYYY-MM-DD'
  }): Observable<any> {

    // Construye los parámetros de la URL
    const params = new URLSearchParams();

    if (options?.page) params.append('page', options.page.toString());
    if (options?.per_page) params.append('per_page', options.per_page.toString());
    if (options?.status_id) params.append('status_id', options.status_id.toString());
    if (options?.category_id) params.append('category_id', options.category_id.toString());
    if (options?.start_date) params.append('start_date', options.start_date);
    if (options?.end_date) params.append('end_date', options.end_date);

    const url = params.toString()
      ? `${this.API_URL}?${params.toString()}`
      : this.API_URL;

    return this.http.get<any>(url);
  }

  getpDocuments(page: string): Observable<any> {
    return this.http.get(page);
  }
  createDocument(): Observable<any> {
    return this.http.get(`${this.API_URL}/create`);
  }

  storeDocument(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.API_URL}`, formData);
  }

  getmetadata(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/create`, );
  }

  uploadFiles(id: string, formData: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/${id}/files`, formData);
  }
  getDocumentbyId(id: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${id}`);
  }

  editDocument(id: string): Observable<any> {
    return this.http.get(`${this.API_URL}/${id}/edit`);
  }

  updateDocument(id: string, document:any): Observable<any> {
    return this.http.patch(`${this.API_URL}/${id}`, document);
  }

  getDocumentHistory(id: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${id}/status`);
  }

  deleteDocument(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  deleteFile(id: string, fileId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}/files/${fileId}`);
  }

  searchDocuments(query: string): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.API_URL}/search`);
  }

  downloadDocFile(id: string, file: number) {
  return this.http.get(`${this.API_URL}/${id}/files/${file}/download`, {
    responseType: 'blob',
    observe: 'response'
  });
}
  previewDocFile(id: string, file: number){
    return this.http.get(`${this.API_URL}/${id}/files/${file}/preview`, {
      responseType: 'blob',
      observe: 'response'
    });
  }

  // Añade estos métodos a tu DataService
updateDocumentStatus(documentId: string, statusData: any): Observable<any> {
  return this.http.post(`${this.API_URL}/${documentId}/status`, statusData);
}

storeRelatedDocument(mainDocumentId: string, documentData: FormData): Observable<any> {
  // Si necesitas relacionar el nuevo documento con el principal
  documentData.append('related_document_id', mainDocumentId);
  return this.storeDocument(documentData); // Reutiliza el método existente
}
}
