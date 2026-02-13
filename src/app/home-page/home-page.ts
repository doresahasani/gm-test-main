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

  docFirstName: FormControl<string>;
  docLastName: FormControl<string>;
  docStreet: FormControl<string>;
  docNr: FormControl<string>;
  docZipCity: FormControl<string>;
}>;

type ActiveKey =
  | 'heightCm'
  | 'weightKg'
  | 'medication'
  | 'medName'
  | 'medReason'
  | 'illnessQ'
  | 'illName'
  | 'illReason'
  | `illness.${number}.desc`
  | `illness.${number}.start`
  | `illness.${number}.end`
  | `illness.${number}.operated`
  | `illness.${number}.treatmentDone`
  | `illness.${number}.docFirstName`
  | `illness.${number}.docLastName`
  | `illness.${number}.docStreet`
  | `illness.${number}.docNr`
  | `illness.${number}.docZipCity`
  | null;

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomeComponent {
clearActive(arg0: string|null) {
throw new Error('Method not implemented.');
}
  private fb = new FormBuilder();

  constructor() {
  // Log vetëm illnesses (1) Krankheit erfassen)
  this.form.controls.illnesses.valueChanges.subscribe((v) => {
    console.log('ILLNESSES (LIVE):', v);
  });
} 

  activeKey = signal<ActiveKey>(null);
  submitted = signal(false);

  form = this.fb.group({
    heightCm: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(350),
    ]),
    weightKg: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
      Validators.max(600),
    ]),

    medication: this.fb.control<boolean | null>(null, [Validators.required]),
    medName: this.fb.control<string>('', { nonNullable: true }),
    medReason: this.fb.control<string>('', { nonNullable: true }),

    illnessQ: this.fb.control<boolean | null>(null, [Validators.required]),
    illName: this.fb.control<string>('', { nonNullable: true }),
    illReason: this.fb.control<string>('', { nonNullable: true }),

    illnesses: this.fb.array<IllnessForm>([this.createIllnessGroup()]),
  });

  get illnesses(): FormArray<IllnessForm> {
    return this.form.controls.illnesses;
  }

  private createIllnessGroup(): IllnessForm {
    return this.fb.group({
      desc: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      startDate: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      endDate: this.fb.control('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      operated: this.fb.control<boolean | null>(null, {
        validators: [Validators.required],
      }),
      treatmentDone: this.fb.control<boolean | null>(null, {
        validators: [Validators.required],
      }),

      docFirstName: this.fb.control('', { nonNullable: true }),
      docLastName: this.fb.control('', { nonNullable: true }),
      docStreet: this.fb.control('', { nonNullable: true }),
      docNr: this.fb.control('', { nonNullable: true }),
      docZipCity: this.fb.control('', { nonNullable: true }),
    });
  }

  illnessAt(i: number): IllnessForm {
    return this.illnesses.at(i);
  }

  illnessCtrl<K extends keyof IllnessForm['controls']>(i: number, key: K) {
    return this.illnessAt(i).controls[key];
  }

  showMedicationDetails(): boolean {
    return this.form.controls.medication.value === true;
  }

  setActive(key: ActiveKey) {
    this.activeKey.set(key);
  }

  isActive(key: Exclude<ActiveKey, null>) {
    return this.activeKey() === key;
  }
  autoResize(event: Event) {
  const textarea = event.target as HTMLTextAreaElement;
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}


  illnessActiveKey(
    i: number,
    field:
      | 'desc'
      | 'start'
      | 'end'
      | 'operated'
      | 'treatmentDone'
      | 'docFirstName'
      | 'docLastName'
      | 'docStreet'
      | 'docNr'
      | 'docZipCity'
  ): ActiveKey {
    return (`illness.${i}.${field}` as unknown) as ActiveKey;
  }

  isIllnessActive(
    i: number,
    field:
      | 'desc'
      | 'start'
      | 'end'
      | 'operated'
      | 'treatmentDone'
      | 'docFirstName'
      | 'docLastName'
      | 'docStreet'
      | 'docNr'
      | 'docZipCity'
  ) {
    return this.activeKey() === this.illnessActiveKey(i, field);
  }

  private showInvalid(ctrl: AbstractControl | null | undefined) {
    return !!ctrl && ctrl.invalid && (ctrl.touched || this.submitted());
  }

  isInvalidCtrl(ctrl: AbstractControl | null | undefined) {
    return this.showInvalid(ctrl);
  }

  isInvalid(
    name: 'heightCm' | 'weightKg' | 'medication' | 'medName' | 'medReason'
  ) {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }

  setMedication(value: boolean) {
    this.form.controls.medication.setValue(value);
    this.form.controls.medication.markAsTouched();
    this.form.controls.medication.updateValueAndValidity();
    this.setActive('medication');

    if (value) {
      // require med fields
      this.form.controls.medName.setValidators([Validators.required]);
      this.form.controls.medReason.setValidators([Validators.required]);
      this.form.controls.medName.updateValueAndValidity({ emitEvent: false });
      this.form.controls.medReason.updateValueAndValidity({ emitEvent: false });

      // require provider fields for each illness
      this.illnesses.controls.forEach((g) => {
        g.controls.docFirstName.setValidators([Validators.required]);
        g.controls.docLastName.setValidators([Validators.required]);
        g.controls.docStreet.setValidators([Validators.required]);
        g.controls.docNr.setValidators([Validators.required]);
        g.controls.docZipCity.setValidators([Validators.required]);
        Object.values(g.controls).forEach((c) =>
          c.updateValueAndValidity({ emitEvent: false })
        );
      });
    } else {
      // clear med fields + validators
      this.form.controls.medName.reset('', { emitEvent: false });
      this.form.controls.medReason.reset('', { emitEvent: false });
      this.form.controls.medName.clearValidators();
      this.form.controls.medReason.clearValidators();
      this.form.controls.medName.updateValueAndValidity({ emitEvent: false });
      this.form.controls.medReason.updateValueAndValidity({ emitEvent: false });

      // keep one illness
      while (this.illnesses.length > 1) {
        this.illnesses.removeAt(this.illnesses.length - 1);
      }

      const first = this.illnesses.at(0);
      first.reset(
        {
          desc: '',
          startDate: '',
          endDate: '',
          operated: null,
          treatmentDone: null,
          docFirstName: '',
          docLastName: '',
          docStreet: '',
          docNr: '',
          docZipCity: '',
        },
        { emitEvent: false }
      );

      // remove provider validators
      first.controls.docFirstName.clearValidators();
      first.controls.docLastName.clearValidators();
      first.controls.docStreet.clearValidators();
      first.controls.docNr.clearValidators();
      first.controls.docZipCity.clearValidators();
      Object.values(first.controls).forEach((c) =>
        c.updateValueAndValidity({ emitEvent: false })
      );
    }
  }

  canRemoveIllness() {
    return this.illnesses.length > 1;
  }

  removeIllness(i: number) {
    if (this.illnesses.length === 1) {
      this.illnesses.at(0).reset();
      return;
    }
    this.illnesses.removeAt(i);
    console.log('Removed illness index:', i, 'Total:', this.illnesses.length);
  }

  setIllnessBool(i: number, key: 'operated' | 'treatmentDone', val: boolean) {
    const c = this.illnessCtrl(i, key);
    c.setValue(val);
    c.markAsTouched();
    c.updateValueAndValidity({ emitEvent: false });
  }

  // ✅ Button disable logic (real)
  canAddIllness(): boolean {
    const last = this.illnessAt(this.illnesses.length - 1);
    return last.valid;
  }

  // BLOCK: cannot add new illness if last is incomplete
  addIllness() {
    if (!this.canAddIllness()) {
      // nëse dikush e thirr manualisht
      const lastIndex = this.illnesses.length - 1;
      const last = this.illnessAt(lastIndex);

      this.submitted.set(true);
      last.markAllAsTouched();

      const order: (keyof IllnessForm['controls'])[] = [
        'desc',
        'startDate',
        'endDate',
        'operated',
        'treatmentDone',
        'docFirstName',
        'docLastName',
        'docStreet',
        'docNr',
        'docZipCity',
      ];

      const firstInvalid = order.find((k) => last.controls[k].invalid);

      if (firstInvalid) {
        const map: Record<string, any> = {
          desc: 'desc',
          startDate: 'start',
          endDate: 'end',
          operated: 'operated',
          treatmentDone: 'treatmentDone',
          docFirstName: 'docFirstName',
          docLastName: 'docLastName',
          docStreet: 'docStreet',
          docNr: 'docNr',
          docZipCity: 'docZipCity',
        };
        this.setActive(this.illnessActiveKey(lastIndex, map[firstInvalid as string]));
      }
      return;
    }

    const g = this.createIllnessGroup();

    if (this.showMedicationDetails()) {
      g.controls.docFirstName.setValidators([Validators.required]);
      g.controls.docLastName.setValidators([Validators.required]);
      g.controls.docStreet.setValidators([Validators.required]);
      g.controls.docNr.setValidators([Validators.required]);
      g.controls.docZipCity.setValidators([Validators.required]);
      Object.values(g.controls).forEach((c) =>
        c.updateValueAndValidity({ emitEvent: false })
      );
    }

    this.illnesses.push(g);

    console.log('Added illness. Total:', this.illnesses.length);

    const i = this.illnesses.length - 1;
    queueMicrotask(() => this.setActive(this.illnessActiveKey(i, 'desc')));
  }

  onWeiter() {
    this.submitted.set(true);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      console.log('FORM INVALID:', this.form.value);
      return;
    }

    // ✅ gjithçka në console
    console.log('FORM VALUE:', this.form.getRawValue());

    // next step...
  }
}
