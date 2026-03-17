import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PreviewFormService {
  previewData = signal<any>(null);
  finalPreviewData = signal<any>(null);

  setPreviewData(data: any) {
    this.previewData.set(data);
  }

  getPreviewData() {
    return this.previewData();
  }

  setFinalPreviewData(data: any) {
    this.finalPreviewData.set(data);
  }

  getFinalPreviewData() {
    return this.finalPreviewData();
  }

  clearPreviewData() {
    this.previewData.set(null);
  }

  clearFinalPreviewData() {
    this.finalPreviewData.set(null);
  }
}