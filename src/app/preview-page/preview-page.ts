import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MedicalFormService } from '../_service/medical-form.service';

@Component({
  selector: 'app-preview-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './preview-page.html',
  styleUrl: './preview-page.scss'
})
export class PreviewPageComponent implements OnInit {
  forms: any[] = [];
  loading = false;
  error = '';

  openMenuId: number | null = null;
  editingId: number | null = null;

  editableForm: any = null;

  constructor(private medicalFormService: MedicalFormService) {}

  ngOnInit(): void {
    this.loadForms();
  }

  loadForms(): void {
    this.loading = true;
    this.error = '';

    this.medicalFormService.getAllMedicalForms().subscribe({
      next: (data) => {
        this.forms = data ?? [];
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Daten konnten nicht geladen werden.';
        this.loading = false;
      }
    });
  }

  q(form: any): any {
    return form?.healthDeclarationQuestions ?? {};
  }

  getProvider(form: any): string {
    return this.q(form)?.step5?.doctorLastName || '-';
  }

  getPrice(form: any): string {
    const height = this.q(form)?.step1?.heightCm;
    const weight = this.q(form)?.step1?.weightKg;

    if (height == null || weight == null) return '-';

    return `${height}/${weight}`;
  }

  getChangedDate(form: any): string {
    const raw =
      form?.updatedAt ||
      form?.createdAt ||
      form?.dateCreated ||
      form?.createdOn ||
      null;

    if (!raw) return '-';

    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}.${month}.${year}`;
  }

  toggleMenu(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  startEdit(form: any): void {
    this.openMenuId = null;
    this.editingId = form.id;

    this.editableForm = JSON.parse(JSON.stringify(form));
  }

    saveEdit(): void {
    if (!this.editableForm?.id) return;

    const payload = {
        healthDeclarationQuestions: this.editableForm.healthDeclarationQuestions
    };

    this.medicalFormService
        .updateMedicalForm(this.editableForm.id, payload)
        .subscribe({
        next: () => {
            this.editingId = null;
            this.editableForm = null;
            this.loadForms();
        },
        error: (err) => {
            console.error('SAVE ERROR:', err);
        }
        });
    }

  cancelEdit(): void {
    this.editingId = null;
    this.editableForm = null;
  }

  deleteForm(id: number): void {
    this.openMenuId = null;

    const confirmed = confirm(`Möchten Sie Formular ${id} wirklich löschen?`);
    if (!confirmed) return;

    this.medicalFormService.deleteMedicalForm(id).subscribe({
      next: () => {
        this.loadForms();
      },
      error: (err) => {
        console.error('DELETE ERROR:', err);
      }
    });
  }


  @HostListener('document:click')
  closeMenu(): void {
    this.openMenuId = null;
  }
}