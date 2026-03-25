import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MedicalFormService {
  private apiUrl = 'https://localhost:7227/api/HealthDeclaration';

  constructor(private http: HttpClient) {}

  addMedicalForm(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  getAllMedicalForms(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getMedicalFormById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  updateMedicalForm(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteMedicalForm(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  uploadReportFile(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/${id}/upload-report`, formData);
  }

  downloadReportFile(id: number): Observable<Blob> {
  return this.http.get(`https://localhost:7227/api/HealthDeclaration/${id}/download-report`, {
    responseType: 'blob'
  });
 }
}
