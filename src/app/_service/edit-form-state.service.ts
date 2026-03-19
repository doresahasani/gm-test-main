import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EditFormStateService {
  private editData: any = null;
  private editId: number | null = null;

  setEditForm(id: number, data: any): void {
    this.editId = id;
    this.editData = data;
  }

  getEditId(): number | null {
    return this.editId;
  }

  getEditData(): any {
    return this.editData;
  }

  clear(): void {
    this.editId = null;
    this.editData = null;
  }

  isEditMode(): boolean {
    return this.editId !== null;
  }
}