import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Footer } from '../layot/footer/footer';

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
  // section 2
  | 'medication'
  | 'medName'
  | 'medReason'
  | `med.${number}.desc`
  | `med.${number}.start`
  | `med.${number}.end`
  | `med.${number}.operated`
  | `med.${number}.treatmentDone`
  | `med.${number}.docFirstName`
  | `med.${number}.docLastName`
  | `med.${number}.docStreet`
  | `med.${number}.docNr`
  | `med.${number}.docZipCity`
  // section 3
  | 'illnessQ'
  | `ill.${number}.desc`
  | `ill.${number}.start`
  | `ill.${number}.end`
  | `ill.${number}.operated`
  | `ill.${number}.treatmentDone`
  | `ill.${number}.docFirstName`
  | `ill.${number}.docLastName`
  | `ill.${number}.docStreet`
  | `ill.${number}.docNr`
  | `ill.${number}.docZipCity`
  // section 4
  | 'opsQ'
  | 'opsA'
  | 'opsB'
  | 'opsC'
  | 'opsD'
  | `opsB.${number}.desc`
  | `opsB.${number}.start`
  | `opsB.${number}.end`
  | `opsB.${number}.operated`
  | `opsB.${number}.treatmentDone`
  | `opsB.${number}.docFirstName`
  | `opsB.${number}.docLastName`
  | `opsB.${number}.docStreet`
  | `opsB.${number}.docNr`
  | `opsB.${number}.docZipCity`
  // section 5
  | 'doctorFirstName'
  | 'doctorLastName'
  | 'doctorStreet'
  | 'doctorNumber'
  | 'doctorCity'
  // section 6
  | 'reportFile'
  // section 7-8
  | 'teethCondition'
  | 'teethConditionNote'
  | 'hygiene'
  | 'hygieneNote'
    // section 7-12
  | 'occlusion'
  | 'crownsCondition'
  | 'crownsNote'
  | 'bridgesCondition'
  | 'bridgesNote'
  | 'partialDenturesCondition'
  | 'partialDenturesNote'
  | 'dentition'
  | 'dentitionNote'
  | 'jaw'
  | 'jawNote'
  | 'futureTeethDisease'
  | 'futureTeethDiseaseNote'
  | null;

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Footer],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomeComponent {
  private fb = inject(FormBuilder);

  activeKey = signal<ActiveKey>(null);
  submitted = signal(false);

  addAttemptMed = signal(false);
  addAttemptIll = signal(false);
  addAttemptOpsB = signal(false);

  // ========================= SECTION 6: UPLOAD (PDF) =========================
  selectedReportName = signal<string>('');
  isReportDragOver = signal(false);

  // ========================= FORM =========================
  form = this.fb.group({
    // ===== Section 1 =====
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

    // ===== Section 2 (Medikamente) =====
    medication: this.fb.control<boolean | null>(null, [Validators.required]),
    medName: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true }),
    medReason: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true }),
    illnessesMed: this.fb.array<IllnessForm>([this.createIllnessGroup()]),

    // ===== Section 3 (Krankheiten) =====
    illnessQ: this.fb.control<boolean | null>(null, [Validators.required]),
    illnessesIll: this.fb.array<IllnessForm>([this.createIllnessGroup()]),

    // ===== Section 4 (Ops) =====
    opsQ: this.fb.control<boolean | null>(null, [Validators.required]),
    opsA: this.fb.control<boolean | null>({ value: null, disabled: true }),
    opsB: this.fb.control<boolean | null>({ value: null, disabled: true }),
    opsC: this.fb.control<boolean | null>({ value: null, disabled: true }),
    opsD: this.fb.control<boolean | null>({ value: null, disabled: true }),
    opsBItems: this.fb.array<IllnessForm>([this.createIllnessGroup()]),

    // ===== Section 5 (Arzt) =====
    doctorFirstName: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    doctorLastName: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    doctorStreet: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    doctorNumber: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    doctorCity: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),

    // ===== Section 6 (Berichte Upload) =====
    reportFile: this.fb.control<File | null>(null, [Validators.required]),

    // ===== Section 7-8 (Dental) =====
    teethCondition: this.fb.control<'gut' | 'mangelhaft' | 'schlecht' | null>(null, [
      Validators.required,
    ]),
    teethConditionNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true }),

    hygiene: this.fb.control<'gut' | 'mangelhaft' | 'schlecht' | null>(null, [Validators.required]),
    hygieneNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true }),

        // ===== Section 9-10 (Dental) =====
    occlusion: this.fb.control<'klasse1' | 'klasse2' | 'klasse3' | null>(null, [Validators.required]),

    crownsCondition: this.fb.control<'keine' | 'gut' | 'mangelhaft' | 'schlecht' | null>(null, [
      Validators.required,
    ]),
    crownsNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true }),

    // ===== Section 11 (Brücken) =====
bridgesCondition: this.fb.control<'keine' | 'gut' | 'mangelhaft' | 'schlecht' | null>(null, [
  Validators.required,
]),
bridgesNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true }),

// ===== Section 12 (Teilprothesen) =====
partialDenturesCondition: this.fb.control<'keine' | 'gut' | 'mangelhaft' | 'schlecht' | null>(null, [
  Validators.required,
]),
partialDenturesNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true }),

// ===== Section 13 =====
dentition: this.fb.control<boolean | null>(null, [Validators.required]),
dentitionNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true }),

// ===== Section 14 =====
jaw: this.fb.control<boolean | null>(null, [Validators.required]),
jawNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true }),

// ===== Section 15 =====
futureTeethDisease: this.fb.control<boolean | null>(null, [Validators.required]),
futureTeethDiseaseNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true }),

  });

  constructor() {
    this.disableMedicationDetails();
    this.disableIllnessDetails();
    this.disableOpsDetails();
    this.disableOpsBItems();

    // start state: notes disabled
    this.form.controls.teethConditionNote.disable({ emitEvent: false });
    this.form.controls.hygieneNote.disable({ emitEvent: false });
    this.form.controls.crownsNote.disable({ emitEvent: false });
    this.form.controls.bridgesNote.disable({ emitEvent: false });
    this.form.controls.partialDenturesNote.disable({ emitEvent: false });
    this.form.controls.dentitionNote.disable({ emitEvent: false });
    this.form.controls.jawNote.disable({ emitEvent: false });
    this.form.controls.futureTeethDiseaseNote.disable({ emitEvent: false });
  }

  // ========================= GETTERS =========================
  get illnessesMed(): FormArray<IllnessForm> {
    return this.form.controls.illnessesMed;
  }
  get illnessesIll(): FormArray<IllnessForm> {
    return this.form.controls.illnessesIll;
  }
  get opsBItems(): FormArray<IllnessForm> {
    return this.form.controls.opsBItems;
  }

  // ========================= ACTIVE HELPERS =========================
  setActive(key: ActiveKey) {
    this.activeKey.set(key);
  }
  isActive(key: Exclude<ActiveKey, null>) {
    return this.activeKey() === key;
  }

  // ========================= UX HELPERS =========================
  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  // ========================= VALIDATION HELPERS =========================
  private showInvalid(ctrl: AbstractControl | null | undefined, attempt = false) {
    return !!ctrl && ctrl.enabled && ctrl.invalid && (ctrl.touched || this.submitted() || attempt);
  }

  isInvalidCtrl(ctrl: AbstractControl | null | undefined, attempt: boolean = false) {
    return this.showInvalid(ctrl, attempt);
  }

  isInvalid(
    name:
      | 'heightCm'
      | 'weightKg'
      | 'medication'
      | 'medName'
      | 'medReason'
      | 'illnessQ'
      | 'opsQ'
      | 'opsA'
      | 'opsB'
      | 'opsC'
      | 'opsD'
      | 'doctorFirstName'
      | 'doctorLastName'
      | 'doctorStreet'
      | 'doctorNumber'
      | 'doctorCity'
      | 'reportFile'
      | 'teethCondition'
      | 'teethConditionNote'
      | 'hygiene'
      | 'hygieneNote'
      | 'occlusion'
      | 'crownsCondition'
      | 'crownsNote'
      | 'bridgesCondition'
      | 'bridgesNote'
      | 'partialDenturesCondition'
      | 'partialDenturesNote'
      | 'dentition'
      | 'dentitionNote'
      | 'jaw'
      | 'jawNote'
      | 'futureTeethDisease'
      | 'futureTeethDiseaseNote'

  ) {
    const c = (this.form.controls as any)[name] as AbstractControl;
    return this.showInvalid(c);
  }

  private markEnabledAsTouched(ctrl: AbstractControl) {
    if (ctrl.disabled) return;

    if (ctrl instanceof FormControl) {
      ctrl.markAsTouched();
      ctrl.updateValueAndValidity({ emitEvent: false });
      return;
    }

    if (ctrl instanceof FormGroup) {
      Object.values(ctrl.controls).forEach((c) => this.markEnabledAsTouched(c));
      ctrl.updateValueAndValidity({ emitEvent: false });
      return;
    }

    if (ctrl instanceof FormArray) {
      ctrl.controls.forEach((c) => this.markEnabledAsTouched(c));
      ctrl.updateValueAndValidity({ emitEvent: false });
      return;
    }
  }

  private clearState(ctrl: AbstractControl) {
    if (ctrl instanceof FormControl) {
      ctrl.markAsPristine();
      ctrl.markAsUntouched();
      return;
    }

    if (ctrl instanceof FormGroup) {
      Object.values(ctrl.controls).forEach((c) => this.clearState(c));
      ctrl.markAsPristine();
      ctrl.markAsUntouched();
      return;
    }

    if (ctrl instanceof FormArray) {
      ctrl.controls.forEach((c) => this.clearState(c));
      ctrl.markAsPristine();
      ctrl.markAsUntouched();
      return;
    }
  }

  private resetErrorsOnReopen(section: 'med' | 'ill' | 'opsB') {
    this.submitted.set(false);

    if (section === 'med') this.addAttemptMed.set(false);
    if (section === 'ill') this.addAttemptIll.set(false);
    if (section === 'opsB') this.addAttemptOpsB.set(false);
  }

  // ========================= ILLNESS GROUP =========================
  private createIllnessGroup(): IllnessForm {
    return this.fb.group({
      desc: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      startDate: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      endDate: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      operated: this.fb.control<boolean | null>(null, { validators: [Validators.required] }),
      treatmentDone: this.fb.control<boolean | null>(null, { validators: [Validators.required] }),

      docFirstName: this.fb.control('', { nonNullable: true }),
      docLastName: this.fb.control('', { nonNullable: true }),
      docStreet: this.fb.control('', { nonNullable: true }),
      docNr: this.fb.control('', { nonNullable: true }),
      docZipCity: this.fb.control('', { nonNullable: true }),
    });
  }

  private illnessAt(arr: FormArray<IllnessForm>, i: number): IllnessForm {
    return arr.at(i);
  }

  illnessCtrl<K extends keyof IllnessForm['controls']>(arr: FormArray<IllnessForm>, i: number, key: K) {
    return this.illnessAt(arr, i).controls[key];
  }

  private markGroupPristineUntouched(g: IllnessForm) {
    g.markAsPristine();
    g.markAsUntouched();
    Object.values(g.controls).forEach((c) => {
      c.markAsPristine();
      c.markAsUntouched();
    });
  }

  private resetIllnessArrayToOne(arr: FormArray<IllnessForm>) {
    while (arr.length > 1) arr.removeAt(arr.length - 1);

    const first = arr.at(0);
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

    this.markGroupPristineUntouched(first);
  }

  private removeIllnessGeneric(arr: FormArray<IllnessForm>, i: number) {
    if (arr.length === 1) {
      this.resetIllnessArrayToOne(arr);
      return;
    }
    arr.removeAt(i);
  }

  // ========================= ACTIVE KEYS (arrays) =========================
  medActiveKey(i: number, field: any): ActiveKey {
    return `med.${i}.${field}` as ActiveKey;
  }
  illActiveKey(i: number, field: any): ActiveKey {
    return `ill.${i}.${field}` as ActiveKey;
  }
  opsBActiveKey(i: number, field: any): ActiveKey {
    return `opsB.${i}.${field}` as ActiveKey;
  }

  isMedActive(i: number, field: any) {
    return this.activeKey() === this.medActiveKey(i, field);
  }
  isIllActive(i: number, field: any) {
    return this.activeKey() === this.illActiveKey(i, field);
  }
  isOpsBActive(i: number, field: any) {
    return this.activeKey() === this.opsBActiveKey(i, field);
  }

  // ========================= FIRST INVALID -> ACTIVE =========================
  private firstInvalidFieldInGroup(g: IllnessForm): keyof IllnessForm['controls'] | null {
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
    return order.find((k) => g.controls[k].enabled && g.controls[k].invalid) ?? null;
  }

  private setActiveToFirstInvalidInArray(kind: 'med' | 'ill' | 'opsB', index: number, g: IllnessForm) {
    const first = this.firstInvalidFieldInGroup(g);
    if (!first) return;

    const map: Record<string, string> = {
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

    const field = map[first as string];

    const key =
      kind === 'med'
        ? this.medActiveKey(index, field)
        : kind === 'ill'
          ? this.illActiveKey(index, field)
          : this.opsBActiveKey(index, field);

    this.setActive(key);
  }

  // ========================= PROVIDER VALIDATORS =========================
  private applyProviderValidatorsToGroup(g: IllnessForm, required: boolean) {
    const providerControls = [
      g.controls.docFirstName,
      g.controls.docLastName,
      g.controls.docStreet,
      g.controls.docNr,
      g.controls.docZipCity,
    ];

    providerControls.forEach((c) => {
      if (required) c.setValidators([Validators.required]);
      else c.clearValidators();
      c.updateValueAndValidity({ emitEvent: false });
    });
  }

  private applyProviderValidators(arr: FormArray<IllnessForm>, required: boolean) {
    arr.controls.forEach((g) => this.applyProviderValidatorsToGroup(g, required));
    arr.updateValueAndValidity({ emitEvent: false });
  }

  // ========================= SECTION 7-8: DENTAL =========================
  setTeethCondition(value: 'gut' | 'mangelhaft' | 'schlecht') {
    this.form.controls.teethCondition.setValue(value);
    this.setActive('teethCondition');

    const note = this.form.controls.teethConditionNote;

    if (value === 'mangelhaft') {
      note.enable({ emitEvent: false });
      note.setValidators([Validators.required]);
      // mos shfaq error menjëherë
      note.markAsPristine();
      note.markAsUntouched();
    } else {
      note.reset('', { emitEvent: false });
      note.clearValidators();
      note.disable({ emitEvent: false });
    }

    note.updateValueAndValidity({ emitEvent: false });
  }
  setHygiene(value: 'gut' | 'mangelhaft' | 'schlecht') {
    this.form.controls.hygiene.setValue(value);
    this.setActive('hygiene');

    const note = this.form.controls.hygieneNote;
    note.reset('', { emitEvent: false });
    note.clearValidators();
    note.disable({ emitEvent: false });
    note.updateValueAndValidity({ emitEvent: false });
  }
  // ========================= SECTION 9-10: DENTAL =========================
setOcclusion(value: 'klasse1' | 'klasse2' | 'klasse3') {
  this.form.controls.occlusion.setValue(value);
  this.setActive('occlusion');
}

setCrownsCondition(value: 'keine' | 'gut' | 'mangelhaft' | 'schlecht') {
  this.form.controls.crownsCondition.setValue(value);
  this.setActive('crownsCondition');

  const note = this.form.controls.crownsNote;
  if (value === 'mangelhaft') {
    note.enable({ emitEvent: false });
    note.setValidators([Validators.required]);
    note.markAsPristine();
    note.markAsUntouched();
  } else {
    note.reset('', { emitEvent: false });
    note.clearValidators();
    note.disable({ emitEvent: false });
  }

  note.updateValueAndValidity({ emitEvent: false });
}
// ========================= SECTION 11 =========================
setBridgesCondition(value: 'keine' | 'gut' | 'mangelhaft' | 'schlecht') {
  this.form.controls.bridgesCondition.setValue(value);
  this.setActive('bridgesCondition');

  const note = this.form.controls.bridgesNote;

  if (value === 'mangelhaft') {
    note.enable({ emitEvent: false });
    note.setValidators([Validators.required]);
    note.markAsPristine();
    note.markAsUntouched();
  } else {
    note.reset('', { emitEvent: false });
    note.clearValidators();
    note.disable({ emitEvent: false });
  }

  note.updateValueAndValidity({ emitEvent: false });
}

// ========================= SECTION 12 =========================
setPartialDenturesCondition(value: 'keine' | 'gut' | 'mangelhaft' | 'schlecht') {
  this.form.controls.partialDenturesCondition.setValue(value);
  this.setActive('partialDenturesCondition');

  const note = this.form.controls.partialDenturesNote;

  if (value === 'mangelhaft') {
    note.enable({ emitEvent: false });
    note.setValidators([Validators.required]);
    note.markAsPristine();
    note.markAsUntouched();
  } else {
    note.reset('', { emitEvent: false });
    note.clearValidators();
    note.disable({ emitEvent: false });
  }

  note.updateValueAndValidity({ emitEvent: false });
}
// ========================= SECTION 13: DENTITION =========================
setDentition(value: boolean) {
  this.form.controls.dentition.setValue(value);
  this.setActive('dentition');

  const note = this.form.controls.dentitionNote;

  if (value === true) {
    note.enable({ emitEvent: false });
    note.setValidators([Validators.required]);
    note.markAsPristine();
    note.markAsUntouched();
  } else {
    note.reset('', { emitEvent: false });
    note.clearValidators();
    note.disable({ emitEvent: false });
  }

  note.updateValueAndValidity({ emitEvent: false });
}

// ========================= SECTION 14: KIEFER =========================
setJaw(value: boolean) {
  this.form.controls.jaw.setValue(value);
  this.setActive('jaw');

  const note = this.form.controls.jawNote;

  if (value === true) {
    note.enable({ emitEvent: false });
    note.setValidators([Validators.required]);
    note.markAsPristine();
    note.markAsUntouched();
  } else {
    note.reset('', { emitEvent: false });
    note.clearValidators();
    note.disable({ emitEvent: false });
  }

  note.updateValueAndValidity({ emitEvent: false });
}
// ========================= SECTION 15 =========================
setFutureTeethDisease(value: boolean) {
  this.form.controls.futureTeethDisease.setValue(value);
  this.setActive('futureTeethDisease');

  const note = this.form.controls.futureTeethDiseaseNote;

  if (value === true) {
    note.enable({ emitEvent: false });
    note.setValidators([Validators.required]);
    note.markAsPristine();
    note.markAsUntouched();
  } else {
    note.reset('', { emitEvent: false });
    note.clearValidators();
    note.disable({ emitEvent: false });
  }

  note.updateValueAndValidity({ emitEvent: false });
}


  // ========================= SECTION 2: MEDIKAMENTE =========================
  showMedicationDetails(): boolean {
    return this.form.controls.medication.value === true;
  }

  setMedication(value: boolean) {
    this.form.controls.medication.setValue(value);
    this.setActive('medication');

    if (value) {
      this.resetErrorsOnReopen('med');

      this.enableMedicationDetails();

      this.clearState(this.form.controls.medName);
      this.clearState(this.form.controls.medReason);
      this.clearState(this.illnessesMed);
    } else {
      this.disableMedicationDetails();
    }
  }

  private enableMedicationDetails() {
    this.form.controls.medName.enable({ emitEvent: false });
    this.form.controls.medReason.enable({ emitEvent: false });
    this.illnessesMed.enable({ emitEvent: false });

    this.form.controls.medName.setValidators([Validators.required]);
    this.form.controls.medReason.setValidators([Validators.required]);
    this.form.controls.medName.updateValueAndValidity({ emitEvent: false });
    this.form.controls.medReason.updateValueAndValidity({ emitEvent: false });

    this.applyProviderValidators(this.illnessesMed, true);
  }

  private disableMedicationDetails() {
    this.form.controls.medName.reset('', { emitEvent: false });
    this.form.controls.medReason.reset('', { emitEvent: false });

    this.form.controls.medName.clearValidators();
    this.form.controls.medReason.clearValidators();

    this.form.controls.medName.disable({ emitEvent: false });
    this.form.controls.medReason.disable({ emitEvent: false });

    this.resetIllnessArrayToOne(this.illnessesMed);
    this.applyProviderValidators(this.illnessesMed, false);
    this.illnessesMed.disable({ emitEvent: false });

    this.form.controls.medName.updateValueAndValidity({ emitEvent: false });
    this.form.controls.medReason.updateValueAndValidity({ emitEvent: false });
    this.illnessesMed.updateValueAndValidity({ emitEvent: false });

    this.addAttemptMed.set(false);
  }

  canAddMedIllness(): boolean {
    if (this.illnessesMed.disabled) return false;
    const last = this.illnessAt(this.illnessesMed, this.illnessesMed.length - 1);
    return last.valid;
  }

  addMedIllness() {
    if (this.illnessesMed.disabled) return;
    this.addAttemptMed.set(true);
    this.addIllnessGeneric(this.illnessesMed, 'med');
  }

  removeMedIllness(i: number) {
    if (this.illnessesMed.disabled) return;
    this.removeIllnessGeneric(this.illnessesMed, i);
  }

  setMedBool(i: number, key: 'operated' | 'treatmentDone', val: boolean) {
    if (this.illnessesMed.disabled) return;

    this.setActive(this.medActiveKey(i, key));

    const c = this.illnessCtrl(this.illnessesMed, i, key);
    c.setValue(val);
    c.markAsDirty();
    c.updateValueAndValidity({ emitEvent: false });
  }

  // ========================= SECTION 3: KRANKHEITEN =========================
  showIllnessDetails(): boolean {
    return this.form.controls.illnessQ.value === true;
  }

  setIllnessQ(value: boolean) {
    this.form.controls.illnessQ.setValue(value);
    this.setActive('illnessQ');

    if (value) {
      this.resetErrorsOnReopen('ill');
      this.enableIllnessDetails();
      this.clearState(this.illnessesIll);
    } else {
      this.disableIllnessDetails();
    }
  }

  private enableIllnessDetails() {
    this.illnessesIll.enable({ emitEvent: false });
    this.applyProviderValidators(this.illnessesIll, true);
  }

  private disableIllnessDetails() {
    this.resetIllnessArrayToOne(this.illnessesIll);
    this.applyProviderValidators(this.illnessesIll, false);
    this.illnessesIll.disable({ emitEvent: false });
    this.illnessesIll.updateValueAndValidity({ emitEvent: false });

    this.addAttemptIll.set(false);
  }

  canAddIllIllness(): boolean {
    if (this.illnessesIll.disabled) return false;
    const last = this.illnessAt(this.illnessesIll, this.illnessesIll.length - 1);
    return last.valid;
  }

  addIllIllness() {
    if (this.illnessesIll.disabled) return;
    this.addAttemptIll.set(true);
    this.addIllnessGeneric(this.illnessesIll, 'ill');
  }

  removeIllIllness(i: number) {
    if (this.illnessesIll.disabled) return;
    this.removeIllnessGeneric(this.illnessesIll, i);
  }

  setIllBool(i: number, key: 'operated' | 'treatmentDone', val: boolean) {
    if (this.illnessesIll.disabled) return;

    this.setActive(this.illActiveKey(i, key));

    const c = this.illnessCtrl(this.illnessesIll, i, key);
    c.setValue(val);
    c.markAsDirty();
    c.updateValueAndValidity({ emitEvent: false });
  }

  // ========================= SECTION 4: OPS =========================
  showOpsDetails(): boolean {
    return this.form.controls.opsQ.value === true;
  }

  setOpsQ(value: boolean) {
    this.form.controls.opsQ.setValue(value);
    this.setActive('opsQ');

    if (value) {
      this.submitted.set(false);
      this.enableOpsDetails();

      this.clearState(this.form.controls.opsA);
      this.clearState(this.form.controls.opsB);
      this.clearState(this.form.controls.opsC);
      this.clearState(this.form.controls.opsD);
    } else {
      this.disableOpsDetails();
    }
  }

  private enableOpsDetails() {
    (['opsA', 'opsB', 'opsC', 'opsD'] as const).forEach((k) => {
      this.form.controls[k].enable({ emitEvent: false });
      this.form.controls[k].setValidators([Validators.required]);
      this.form.controls[k].updateValueAndValidity({ emitEvent: false });
    });

    if (this.form.controls.opsB.value === true) this.enableOpsBItems();
    else this.disableOpsBItems();
  }

  private disableOpsDetails() {
    (['opsA', 'opsB', 'opsC', 'opsD'] as const).forEach((k) => {
      this.form.controls[k].reset(null, { emitEvent: false });
      this.form.controls[k].clearValidators();
      this.form.controls[k].disable({ emitEvent: false });
      this.form.controls[k].updateValueAndValidity({ emitEvent: false });
    });

    this.disableOpsBItems();
  }

  setOpsA(v: boolean) {
    if (this.form.controls.opsA.disabled) return;
    this.form.controls.opsA.setValue(v);
    this.setActive('opsA');
  }

  setOpsB(v: boolean) {
    if (this.form.controls.opsB.disabled) return;

    this.form.controls.opsB.setValue(v);
    this.setActive('opsB');

    if (v && this.showOpsDetails()) {
      this.resetErrorsOnReopen('opsB');
      this.enableOpsBItems();
      this.clearState(this.opsBItems);
    } else {
      this.disableOpsBItems();
    }
  }

  setOpsC(v: boolean) {
    if (this.form.controls.opsC.disabled) return;
    this.form.controls.opsC.setValue(v);
    this.setActive('opsC');
  }

  setOpsD(v: boolean) {
    if (this.form.controls.opsD.disabled) return;
    this.form.controls.opsD.setValue(v);
    this.setActive('opsD');
  }

  private enableOpsBItems() {
    this.opsBItems.enable({ emitEvent: false });
    this.applyProviderValidators(this.opsBItems, true);
  }

  private disableOpsBItems() {
    this.resetIllnessArrayToOne(this.opsBItems);
    this.applyProviderValidators(this.opsBItems, false);
    this.opsBItems.disable({ emitEvent: false });
    this.opsBItems.updateValueAndValidity({ emitEvent: false });

    this.addAttemptOpsB.set(false);
  }

  canAddOpsBItem(): boolean {
    if (this.opsBItems.disabled) return false;
    const last = this.illnessAt(this.opsBItems, this.opsBItems.length - 1);
    return last.valid;
  }

  addOpsBItem() {
    if (this.opsBItems.disabled) return;
    this.addAttemptOpsB.set(true);
    this.addOpsBGeneric();
  }

  removeOpsBItem(i: number) {
    if (this.opsBItems.disabled) return;
    this.removeIllnessGeneric(this.opsBItems, i);
  }

  setOpsBBool(i: number, key: 'operated' | 'treatmentDone', val: boolean) {
    if (this.opsBItems.disabled) return;

    this.setActive(this.opsBActiveKey(i, key));

    const c = this.illnessCtrl(this.opsBItems, i, key);
    c.setValue(val);
    c.markAsDirty();
    c.updateValueAndValidity({ emitEvent: false });
  }

  // ========================= GENERIC ADD (med/ill) =========================
  private addIllnessGeneric(arr: FormArray<IllnessForm>, kind: 'med' | 'ill') {
    const lastIndex = arr.length - 1;
    const last = arr.at(lastIndex);

    if (last.invalid) {
      this.markEnabledAsTouched(last);
      this.setActiveToFirstInvalidInArray(kind, lastIndex, last);
      return;
    }

    const g = this.createIllnessGroup();

    const needsProvider = kind === 'med' ? this.showMedicationDetails() : this.showIllnessDetails();
    this.applyProviderValidatorsToGroup(g, needsProvider);

    arr.push(g);
    this.markGroupPristineUntouched(g);

    const i = arr.length - 1;
    requestAnimationFrame(() => {
      const key = kind === 'med' ? this.medActiveKey(i, 'desc') : this.illActiveKey(i, 'desc');
      this.setActive(key);
    });
  }

  // ========================= ADD OPS-B =========================
  private addOpsBGeneric() {
    const arr = this.opsBItems;
    const lastIndex = arr.length - 1;
    const last = arr.at(lastIndex);

    if (last.invalid) {
      this.markEnabledAsTouched(last);
      this.setActiveToFirstInvalidInArray('opsB', lastIndex, last);
      return;
    }

    const g = this.createIllnessGroup();
    this.applyProviderValidatorsToGroup(g, true);

    arr.push(g);
    this.markGroupPristineUntouched(g);

    const i = arr.length - 1;
    requestAnimationFrame(() => this.setActive(this.opsBActiveKey(i, 'desc')));
  }

  // ========================= SECTION 6: UPLOAD HANDLERS =========================
  private isPdfFile(file: File) {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  }

  onReportPicked(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) return;

    if (!this.isPdfFile(file)) {
      input.value = '';
      this.form.controls.reportFile.setValue(null);
      this.selectedReportName.set('');
      return;
    }

    this.form.controls.reportFile.setValue(file);
    this.selectedReportName.set(file.name);

    this.form.controls.reportFile.markAsPristine();
    this.form.controls.reportFile.markAsUntouched();
  }

  onReportDragOver(e: DragEvent) {
    e.preventDefault();
    this.isReportDragOver.set(true);
  }

  onReportDragLeave(e: DragEvent) {
    e.preventDefault();
    this.isReportDragOver.set(false);
  }

  onReportDrop(e: DragEvent) {
    e.preventDefault();
    this.isReportDragOver.set(false);

    const file = e.dataTransfer?.files?.[0] ?? null;
    if (!file) return;
    if (!this.isPdfFile(file)) return;

    this.form.controls.reportFile.setValue(file);
    this.selectedReportName.set(file.name);

    this.form.controls.reportFile.markAsPristine();
    this.form.controls.reportFile.markAsUntouched();
  }

 // ========================= SUBMIT / WEITER =========================
onWeiter() {
  this.submitted.set(true);

  this.markEnabledAsTouched(this.form);
  this.form.updateValueAndValidity({ emitEvent: false });

  if (this.form.controls.reportFile.invalid) {
    this.setActive('reportFile');
  }

  if (this.form.invalid) return;

  const raw = this.form.getRawValue();

  const payload = {
    ...raw,
    reportFile: raw.reportFile ? raw.reportFile.name : null,
  };

  console.log('FORM VALUE:\n' + JSON.stringify(payload, null, 2));

  const dentalSummary = {
    teethCondition: payload.teethCondition,
    teethConditionNote: payload.teethConditionNote,
    hygiene: payload.hygiene,
    hygieneNote: payload.hygieneNote,
    occlusion: payload.occlusion,
    crownsCondition: payload.crownsCondition,
    crownsNote: payload.crownsNote,
    bridgesCondition: payload.bridgesCondition,
    bridgesNote: payload.bridgesNote,
    partialDenturesCondition: payload.partialDenturesCondition,
    partialDenturesNote: payload.partialDenturesNote,
    dentition: payload.dentition,
    dentitionNote: payload.dentitionNote,
    jaw: payload.jaw,
    jawNote: payload.jawNote,
    futureTeethDisease: payload.futureTeethDisease,
    futureTeethDiseaseNote: payload.futureTeethDiseaseNote,


  };

  console.log('WEITER SUMMARY (7-14):\n' + JSON.stringify(dentalSummary, null, 2));
}

  // ========================= TEMPLATE HELPERS for attempts =========================
  attemptMed() {
    return this.addAttemptMed();
  }
  attemptIll() {
    return this.addAttemptIll();
  }
  attemptOpsB() {
    return this.addAttemptOpsB();
  }
}
