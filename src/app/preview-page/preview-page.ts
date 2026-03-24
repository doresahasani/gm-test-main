import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicalFormService } from '../_service/medical-form.service';
import { EditFormStateService } from '../_service/edit-form-state.service';

@Component({
  selector: 'app-preview-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './preview-page.html',
  styleUrl: './preview-page.scss'
})
export class PreviewPageComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private medicalFormService = inject(MedicalFormService);
  private editFormState = inject(EditFormStateService);
  private cdr = inject(ChangeDetectorRef);

  forms: any[] = [];
  filteredForms: any[] = [];
  error = '';
  searchTerm = '';

  openMenuId: number | null = null;
  deletingId: number | null = null;

  showDeleteModal = false;
  pendingDeleteForm: any | null = null;

  ngOnInit(): void {
    const resolvedForms = this.route.snapshot.data['forms'];

    if (!resolvedForms) {
      this.error = 'Gabim gjatë marrjes së listës.';
      return;
    }

    this.forms = [...(resolvedForms ?? [])];
    this.applyFilter();
  }

  applyFilter(): void {
    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      this.filteredForms = [...this.forms];
      return;
    }

    this.filteredForms = this.forms.filter((form) => {
      const id = String(form.id ?? '').toLowerCase();
      const provider = this.getProvider(form).toLowerCase();
      const date = this.formatDateOnly(form.createdAt).toLowerCase();

      return id.includes(term) || provider.includes(term) || date.includes(term);
    });
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  toggleMenu(event: MouseEvent, id: number): void {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  closeMenu(): void {
    this.openMenuId = null;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeMenu();
  }

  onMenuClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  viewRecord(form: any, event?: MouseEvent): void {
    event?.stopPropagation();
    this.closeMenu();
    this.router.navigate(['/preview', form.id]);
  }

  editRecord(form: any, event?: MouseEvent): void {
    event?.stopPropagation();
    this.closeMenu();

    this.medicalFormService.getMedicalFormById(form.id).subscribe({
      next: (fullForm) => {
        this.editFormState.setEditForm(form.id, fullForm);
        this.router.navigate(['/edit']);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Gabim gjatë marrjes së rekordit për edit.';
      }
    });
  }

  deleteRecord(form: any, event?: MouseEvent): void {
    event?.stopPropagation();
    this.closeMenu();

    this.pendingDeleteForm = form;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.pendingDeleteForm = null;
  }

  confirmDelete(): void {
    if (!this.pendingDeleteForm) return;

    const form = this.pendingDeleteForm;
    this.deletingId = Number(form.id);
    this.error = '';

    this.medicalFormService.deleteMedicalForm(form.id).subscribe({
      next: () => {
        const deletedId = Number(form.id);

        this.forms = this.forms.filter(item => Number(item.id) !== deletedId);
        this.filteredForms = this.filteredForms.filter(item => Number(item.id) !== deletedId);

        this.deletingId = null;
        this.showDeleteModal = false;
        this.pendingDeleteForm = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Gabim gjatë fshirjes së rekordit.';
        this.deletingId = null;
        this.showDeleteModal = false;
        this.pendingDeleteForm = null;
        this.cdr.detectChanges();
      }
    });
  }

  getProvider(form: any): string {
    return form?.insuranceProvider || form?.provider || '—';
  }

  formatDateOnly(value: string | null | undefined): string {
    if (!value) return '—';

   const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  }

  trackByForm(index: number, form: any): number {
    return Number(form.id);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}