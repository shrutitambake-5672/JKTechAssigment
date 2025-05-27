import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../api-url.token';
import { Observable, timer, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private apiUrl = inject(API_URL);
  private http = inject(HttpClient);

   triggerIngestion(docId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}documents/ingestion/trigger`, { doc_id: docId });
  }

   getJobStatus(docId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}documents/ingestion/status/by_doc/${docId}`);
  }

  pollJobStatus(docId: string, intervalMs = 3000): Observable<any> {
    return timer(0, intervalMs).pipe(
      switchMap(() => this.getJobStatus(docId))
    );
  }

  uploadDocument(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}documents/`, formData);
  }
  getDocuments() {
    return this.http.get<any[]>(`${this.apiUrl}documents/`);
  }

  updateDocument(id: string, formData: FormData) {
  return this.http.put(`${this.apiUrl}documents/${id}`, formData);
}

  deleteDocument(id: string) {
    return this.http.delete(`${this.apiUrl}documents/${id}`);
  }

  downloadDocument(id: string) {
    return this.http.get(`${this.apiUrl}documents/${id}/download`, { responseType: 'blob' });
  }
}
