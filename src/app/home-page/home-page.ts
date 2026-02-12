import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

type IllnessForm = FormGroup<{
  desc: FormControl<string>;
  startDate: FormControl<string>;
  endDate: FormControl<string>;
  operated: FormControl<boolean | null>;
  treatmentDone: FormControl<boolean | null>;
}>;

type ActiveKey =
  | 'heightCm'
  | 'weightKg'
  | 'medication'
  | 'medName'
  | 'medReason'
  | `illness.${number}.desc`
  | `illness.${number}.start`
  | `illness.${number}.end`
  | `illness.${number}.operated`
  | `illness.${number}.treatmentDone`
  | 'docFirstName'
  | 'docLastName'
  | 'docStreet'
  | 'docNr'
  | 'docZipCity'
  | null;

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePageComponent {
  private fb = new FormBuilder();

  activeKey = signal<ActiveKey>(null);
  submitted = signal(false);

  form = this.fb.group({
    // 1) Grösse und Gewicht
    heightCm: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(50),
      Validators.max(250),
    ]),
    weightKg: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(20),
      Validators.max(300),
    ]),

    // 2) Medikamente oder Hilfsmittel
    medication: this.fb.control<boolean | null>(null, [Validators.required]),
    medName: this.fb.control<string>('', []),
    medReason: this.fb.control<string>('', []),

    // Krankheit erfassen
    illnesses: this.fb.array<IllnessForm>([this.createIllnessGroup()]),

    // Arzt / Leistungserbringer
    docFirstName: this.fb.control<string>('', []),
    docLastName: this.fb.control<string>('', []),
    docStreet: this.fb.control<string>('', []),
    docNr: this.fb.control<string>('', []),
    docZipCity: this.fb.control<string>('', []),
  });

  get illnesses(): FormArray<IllnessForm> {
    return this.form.controls.illnesses;
  }

  private createIllnessGroup(): IllnessForm {
    return this.fb.group({
      desc: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      startDate: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      endDate: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      operated: this.fb.control<boolean | null>(null, { validators: [Validators.required] }),
      treatmentDone: this.fb.control<boolean | null>(null, { validators: [Validators.required] }),
    });
  }

  illnessAt(i: number): IllnessForm {
    return this.illnesses.at(i);
  }

  illnessCtrl<K extends keyof IllnessForm['controls']>(i: number, key: K) {
    return this.illnessAt(i).controls[key];
  }

  // ✅ show details when Ja
  showMedicationDetails(): boolean {
    return this.form.controls.medication.value === true;
  }

  // ✅ active (orange)
  setActive(key: ActiveKey) {
    this.activeKey.set(key);
  }

  isActive(key: Exclude<ActiveKey, null>) {
    return this.activeKey() === key;
  }

  illnessActiveKey(
    i: number,
    field: 'desc' | 'start' | 'end' | 'operated' | 'treatmentDone'
  ): ActiveKey {
    return (`illness.${i}.${field}` as unknown) as ActiveKey;
  }

  isIllnessActive(
    i: number,
    field: 'desc' | 'start' | 'end' | 'operated' | 'treatmentDone'
  ) {
    return this.activeKey() === this.illnessActiveKey(i, field);
  }

  // ✅ invalid only when touched or submit
  private showInvalid(ctrl: AbstractControl | null | undefined) {
    return !!ctrl && ctrl.invalid && (ctrl.touched || this.submitted());
  }

  isInvalidCtrl(ctrl: AbstractControl | null | undefined) {
    return this.showInvalid(ctrl);
  }

  isInvalid(name: 'heightCm' | 'weightKg' | 'medication') {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }

  // ✅ Nein/Ja
  setMedication(value: boolean) {
    this.form.controls.medication.setValue(value);
    this.form.controls.medication.markAsTouched();
    this.form.controls.medication.updateValueAndValidity();
    this.setActive('medication');

    if (!value) {
      // reset fields shown only on Ja
      this.form.patchValue({
        medName: '',
        medReason: '',
        docFirstName: '',
        docLastName: '',
        docStreet: '',
        docNr: '',
        docZipCity: '',
      });

      while (this.illnesses.length > 1) {
        this.illnesses.removeAt(this.illnesses.length - 1);
      }
      this.illnesses.at(0).reset();
    }
  }

  // ✅ + Krankheit erfassen
  addIllness() {
    this.illnesses.push(this.createIllnessGroup());
    const i = this.illnesses.length - 1;

    queueMicrotask(() => {
      this.setActive(this.illnessActiveKey(i, 'desc'));
    });
  }

  canRemoveIllness() {
    return this.illnesses.length > 1;
  }

  // ✅ - Entfernen
  removeIllness(i: number) {
    if (this.illnesses.length === 1) {
      this.illnesses.at(0).reset();
      return;
    }
    this.illnesses.removeAt(i);
  }

  // ✅ segmented toggles inside illness
  setIllnessBool(i: number, key: 'operated' | 'treatmentDone', val: boolean) {
    const c = this.illnessCtrl(i, key);
    c.setValue(val);
    c.markAsTouched();
  }

  // optional submit handler (if you wire it to "Weiter")
  onWeiter() {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    // next step...
  }
}
