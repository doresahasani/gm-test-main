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
  | null
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
  // section 7-15
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
  // section 16
  | 'missingTeethQ'
  | 'missingTeeth'
  | 'missingPermanent'
  // section 17
  | 'fillingsQ'
  | 'fillingsTeeth'
  | 'fillingsPermanent'
  // section 18
  | 'cariesQ'
  | 'cariesTeeth'
  | 'cariesPermanent'
  // section 19
  | 'rootCanalQ'
  | 'rootCanalTeeth'
  | 'rootCanalPermanent'
  // section 20
  | 'dentalTreatQ'
  | 'dentalTreatWhich'
  // section 21
  | 'lastRadiographyDate'
  // section 22
  | 'remarks';

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

    // ===== Section 7-15 (Dental) =====
    teethCondition: this.fb.control<'gut' | 'mangelhaft' | 'schlecht' | null>(null, [
      Validators.required,
    ]),
    teethConditionNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true }),

    hygiene: this.fb.control<'gut' | 'mangelhaft' | 'schlecht' | null>(null, [Validators.required]),
    hygieneNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true }),

    occlusion: this.fb.control<'klasse1' | 'klasse2' | 'klasse3' | null>(null, [Validators.required]),

    crownsCondition: this.fb.control<'keine' | 'gut' | 'mangelhaft' | 'schlecht' | null>(null, [
      Validators.required,
    ]),
    crownsNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true }),

    bridgesCondition: this.fb.control<'keine' | 'gut' | 'mangelhaft' | 'schlecht' | null>(null, [
      Validators.required,
    ]),
    bridgesNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true }),

    partialDenturesCondition: this.fb.control<'keine' | 'gut' | 'mangelhaft' | 'schlecht' | null>(
      null,
      [Validators.required]
    ),
    partialDenturesNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true }),

    dentition: this.fb.control<boolean | null>(null, [Validators.required]),
    dentitionNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true }),

    jaw: this.fb.control<boolean | null>(null, [Validators.required]),
    jawNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true }),

    futureTeethDisease: this.fb.control<boolean | null>(null, [Validators.required]),
    futureTeethDiseaseNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true }),

    // ===== Section 21 (Letzte Röntgenaufnahme) =====
    lastRadiographyDate: this.fb.control<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    // ===== Section 16 (Missing teeth) =====
    missingTeethQ: this.fb.control<boolean | null>(null, [Validators.required]),
    missingTeeth: this.fb.array<FormControl<string>>([]),
    missingPermanent: this.fb.array<FormControl<string>>([]),

    // ===== Section 17 (Schadhafte Zahnfüllungen) =====
    fillingsQ: this.fb.control<boolean | null>(null, [Validators.required]),
    fillingsTeeth: this.fb.array<FormControl<string>>([]),
    fillingsPermanent: this.fb.array<FormControl<string>>([]),

    // ===== Section 18 (Kariöse Zähne) =====
    cariesQ: this.fb.control<boolean | null>(null, [Validators.required]),
    cariesTeeth: this.fb.array<FormControl<string>>([]),
    cariesPermanent: this.fb.array<FormControl<string>>([]),

    // ===== Section 19 (Wurzelbehandelte Zähne) =====
    rootCanalQ: this.fb.control<boolean | null>(null, [Validators.required]),
    rootCanalTeeth: this.fb.array<FormControl<string>>([]),
    rootCanalPermanent: this.fb.array<FormControl<string>>([]),

    // ===== Section 20 (Behandlung Zahnarzt/KFO) =====
    dentalTreatQ: this.fb.control<boolean | null>(null, [Validators.required]),
    dentalTreatWhich: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true }),

    // ===== Section 22 =====
    remarks: this.fb.control<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
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

    // section 20 start disabled + no validators
    this.form.controls.dentalTreatWhich.disable({ emitEvent: false });
    this.form.controls.dentalTreatWhich.clearValidators();
    this.form.controls.dentalTreatWhich.updateValueAndValidity({ emitEvent: false });
  }

  // ========================= DATE PICKER (Section 21) =========================
  openDatePicker(input: HTMLInputElement) {
    if (!input) return;
    const anyInput = input as any;
    if (typeof anyInput.showPicker === 'function') anyInput.showPicker();
    else {
      input.focus();
      input.click();
    }
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

  // Helpers (needed by template)
  hasValue(ctrl: { value: any } | null | undefined): boolean {
    const v = ctrl?.value;
    return v !== null && v !== undefined;
  }

  hasText(ctrl: { value: any } | null | undefined): boolean {
    const v = ctrl?.value;
    if (v === null || v === undefined) return false;
    return String(v).trim().length > 0;
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
      | 'missingTeethQ'
      | 'missingTeeth'
      | 'missingPermanent'
      | 'fillingsQ'
      | 'fillingsTeeth'
      | 'fillingsPermanent'
      | 'cariesQ'
      | 'cariesTeeth'
      | 'cariesPermanent'
      | 'rootCanalQ'
      | 'rootCanalTeeth'
      | 'rootCanalPermanent'
      | 'dentalTreatQ'
      | 'dentalTreatWhich'
      | 'lastRadiographyDate'
      | 'remarks'
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

  // ========================= SECTION 7-15: DENTAL NOTES =========================
  setTeethCondition(value: 'gut' | 'mangelhaft' | 'schlecht') {
    this.form.controls.teethCondition.setValue(value);
    this.setActive('teethCondition');

    const note = this.form.controls.teethConditionNote;

    if (value === 'mangelhaft' || value === 'schlecht') {
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

  // ✅ SAME behavior as teethConditionNote (if you want it)
  setHygiene(value: 'gut' | 'mangelhaft' | 'schlecht') {
    this.form.controls.hygiene.setValue(value);
    this.setActive('hygiene');

    const note = this.form.controls.hygieneNote;

    if (value === 'mangelhaft' || value === 'schlecht') {
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

  setOcclusion(value: 'klasse1' | 'klasse2' | 'klasse3') {
    this.form.controls.occlusion.setValue(value);
    this.setActive('occlusion');
  }

  setCrownsCondition(value: 'keine' | 'gut' | 'mangelhaft' | 'schlecht') {
    this.form.controls.crownsCondition.setValue(value);
    this.setActive('crownsCondition');

    const note = this.form.controls.crownsNote;
    if (value === 'mangelhaft' || value === 'schlecht') {
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

  setBridgesCondition(value: 'keine' | 'gut' | 'mangelhaft' | 'schlecht') {
    this.form.controls.bridgesCondition.setValue(value);
    this.setActive('bridgesCondition');

    const note = this.form.controls.bridgesNote;
    if (value === 'mangelhaft' || value === 'schlecht') {
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

  setPartialDenturesCondition(value: 'keine' | 'gut' | 'mangelhaft' | 'schlecht') {
    this.form.controls.partialDenturesCondition.setValue(value);
    this.setActive('partialDenturesCondition');

    const note = this.form.controls.partialDenturesNote;
    if (value === 'mangelhaft' || value === 'schlecht') {
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

  // ========================= SECTION 16: MISSING TEETH =========================
  readonly teethTop = ['55', '54', '53', '52', '51'] as const;
  readonly teethBottom = ['85', '84', '83', '82', '81'] as const;

  readonly milkTop = ['61', '62', '63', '64', '65'] as const;
  readonly milkBottom = ['71', '72', '73', '74', '75'] as const;

  readonly permTop = [
    '18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28',
  ] as const;
  readonly permBottom = [
    '48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38',
  ] as const;

  get missingTeethArr(): FormArray<FormControl<string>> {
    return this.form.controls.missingTeeth;
  }
  get missingPermanentArr(): FormArray<FormControl<string>> {
    return this.form.controls.missingPermanent;
  }

  setMissingTeethQ(val: boolean) {
    this.form.controls.missingTeethQ.setValue(val);
    this.setActive('missingTeethQ');

    if (val === false) {
      while (this.missingTeethArr.length) this.missingTeethArr.removeAt(0);
      while (this.missingPermanentArr.length) this.missingPermanentArr.removeAt(0);
    }
  }

  isToothSelected(code: string): boolean {
    return this.missingTeethArr.controls.some((c) => c.value === code);
  }

  toggleTooth(code: string) {
    this.setActive('missingTeeth');

    const idx = this.missingTeethArr.controls.findIndex((c) => c.value === code);
    if (idx >= 0) this.missingTeethArr.removeAt(idx);
    else this.missingTeethArr.push(new FormControl(code, { nonNullable: true }));

    this.missingTeethArr.markAsDirty();
    this.missingTeethArr.updateValueAndValidity({ emitEvent: false });
  }

  isPermSelected(code: string): boolean {
    return this.missingPermanentArr.controls.some((c) => c.value === code);
  }

  togglePerm(code: string) {
    this.setActive('missingPermanent');

    const idx = this.missingPermanentArr.controls.findIndex((c) => c.value === code);
    if (idx >= 0) this.missingPermanentArr.removeAt(idx);
    else this.missingPermanentArr.push(new FormControl(code, { nonNullable: true }));

    this.missingPermanentArr.markAsDirty();
    this.missingPermanentArr.updateValueAndValidity({ emitEvent: false });
  }

  // ========================= SECTION 17: FILLINGS =========================
  get fillingsTeethArr(): FormArray<FormControl<string>> {
    return this.form.controls.fillingsTeeth;
  }
  get fillingsPermanentArr(): FormArray<FormControl<string>> {
    return this.form.controls.fillingsPermanent;
  }

  setFillingsQ(val: boolean) {
    this.form.controls.fillingsQ.setValue(val);
    this.setActive('fillingsQ');

    if (val === false) {
      while (this.fillingsTeethArr.length) this.fillingsTeethArr.removeAt(0);
      while (this.fillingsPermanentArr.length) this.fillingsPermanentArr.removeAt(0);
    }
  }

  isFillingSelected(code: string): boolean {
    return this.fillingsTeethArr.controls.some((c) => c.value === code);
  }

  toggleFilling(code: string) {
    this.setActive('fillingsTeeth');

    const idx = this.fillingsTeethArr.controls.findIndex((c) => c.value === code);
    if (idx >= 0) this.fillingsTeethArr.removeAt(idx);
    else this.fillingsTeethArr.push(new FormControl(code, { nonNullable: true }));

    this.fillingsTeethArr.markAsDirty();
    this.fillingsTeethArr.updateValueAndValidity({ emitEvent: false });
  }

  isFillingPermSelected(code: string): boolean {
    return this.fillingsPermanentArr.controls.some((c) => c.value === code);
  }

  toggleFillingPerm(code: string) {
    this.setActive('fillingsPermanent');

    const idx = this.fillingsPermanentArr.controls.findIndex((c) => c.value === code);
    if (idx >= 0) this.fillingsPermanentArr.removeAt(idx);
    else this.fillingsPermanentArr.push(new FormControl(code, { nonNullable: true }));

    this.fillingsPermanentArr.markAsDirty();
    this.fillingsPermanentArr.updateValueAndValidity({ emitEvent: false });
  }

  // ========================= SECTION 18: CARIES =========================
  get cariesTeethArr(): FormArray<FormControl<string>> {
    return this.form.controls.cariesTeeth;
  }
  get cariesPermanentArr(): FormArray<FormControl<string>> {
    return this.form.controls.cariesPermanent;
  }

  setCariesQ(val: boolean) {
    this.form.controls.cariesQ.setValue(val);
    this.setActive('cariesQ');

    if (val === false) {
      while (this.cariesTeethArr.length) this.cariesTeethArr.removeAt(0);
      while (this.cariesPermanentArr.length) this.cariesPermanentArr.removeAt(0);
    }
  }

  isCariesSelected(code: string): boolean {
    return this.cariesTeethArr.controls.some((c) => c.value === code);
  }

  toggleCaries(code: string) {
    this.setActive('cariesTeeth');

    const idx = this.cariesTeethArr.controls.findIndex((c) => c.value === code);
    if (idx >= 0) this.cariesTeethArr.removeAt(idx);
    else this.cariesTeethArr.push(new FormControl(code, { nonNullable: true }));

    this.cariesTeethArr.markAsDirty();
    this.cariesTeethArr.updateValueAndValidity({ emitEvent: false });
  }

  isCariesPermSelected(code: string): boolean {
    return this.cariesPermanentArr.controls.some((c) => c.value === code);
  }

  toggleCariesPerm(code: string) {
    this.setActive('cariesPermanent');

    const idx = this.cariesPermanentArr.controls.findIndex((c) => c.value === code);
    if (idx >= 0) this.cariesPermanentArr.removeAt(idx);
    else this.cariesPermanentArr.push(new FormControl(code, { nonNullable: true }));

    this.cariesPermanentArr.markAsDirty();
    this.cariesPermanentArr.updateValueAndValidity({ emitEvent: false });
  }

  // ========================= SECTION 19: ROOT CANAL =========================
  get rootTeethArr(): FormArray<FormControl<string>> {
    return this.form.controls.rootCanalTeeth;
  }
  get rootPermanentArr(): FormArray<FormControl<string>> {
    return this.form.controls.rootCanalPermanent;
  }

  setRootCanalQ(val: boolean) {
    this.form.controls.rootCanalQ.setValue(val);
    this.setActive('rootCanalQ');

    if (val === false) {
      while (this.rootTeethArr.length) this.rootTeethArr.removeAt(0);
      while (this.rootPermanentArr.length) this.rootPermanentArr.removeAt(0);
    }
  }

  isRootSelected(code: string): boolean {
    return this.rootTeethArr.controls.some((c) => c.value === code);
  }

  toggleRoot(code: string) {
    this.setActive('rootCanalTeeth');

    const idx = this.rootTeethArr.controls.findIndex((c) => c.value === code);
    if (idx >= 0) this.rootTeethArr.removeAt(idx);
    else this.rootTeethArr.push(new FormControl(code, { nonNullable: true }));

    this.rootTeethArr.markAsDirty();
    this.rootTeethArr.updateValueAndValidity({ emitEvent: false });
  }

  isRootPermSelected(code: string): boolean {
    return this.rootPermanentArr.controls.some((c) => c.value === code);
  }

  toggleRootPerm(code: string) {
    this.setActive('rootCanalPermanent');

    const idx = this.rootPermanentArr.controls.findIndex((c) => c.value === code);
    if (idx >= 0) this.rootPermanentArr.removeAt(idx);
    else this.rootPermanentArr.push(new FormControl(code, { nonNullable: true }));

    this.rootPermanentArr.markAsDirty();
    this.rootPermanentArr.updateValueAndValidity({ emitEvent: false });
  }

  // ========================= SECTION 20: TREATMENT =========================
  setDentalTreatQ(val: boolean) {
    this.form.controls.dentalTreatQ.setValue(val);
    this.setActive('dentalTreatQ');

    const which = this.form.controls.dentalTreatWhich;

    if (val === true) {
      which.enable({ emitEvent: false });
      which.setValidators([Validators.required]);
      which.markAsPristine();
      which.markAsUntouched();
    } else {
      which.reset('', { emitEvent: false });
      which.clearValidators();
      which.disable({ emitEvent: false });
      which.markAsPristine();
      which.markAsUntouched();
    }

    which.updateValueAndValidity({ emitEvent: false });
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

  // ========================= ✅ CONSOLE FORMAT FOR BACKEND (ARRAY OF {code,value}) =========================
  private buildAnswersArray(raw: any): Array<{ code: string; value: any }> {
    const answers: Array<{ code: string; value: any }> = [];

    const push = (code: string, value: any) => {
      if (value instanceof File) {
        answers.push({ code, value: value.name });
        return;
      }
      answers.push({ code, value });
    };

    // arrays (teeth selections)
    push('missingTeeth', raw?.missingTeeth ?? []);
    push('missingPermanent', raw?.missingPermanent ?? []);
    push('fillingsTeeth', raw?.fillingsTeeth ?? []);
    push('fillingsPermanent', raw?.fillingsPermanent ?? []);
    push('cariesTeeth', raw?.cariesTeeth ?? []);
    push('cariesPermanent', raw?.cariesPermanent ?? []);
    push('rootCanalTeeth', raw?.rootCanalTeeth ?? []);
    push('rootCanalPermanent', raw?.rootCanalPermanent ?? []);

    // form arrays with objects
    push('illnessesMed', raw?.illnessesMed ?? []);
    push('illnessesIll', raw?.illnessesIll ?? []);
    push('opsBItems', raw?.opsBItems ?? []);

    return answers;
  }

  private logAnswersAsSingleArray(answers: Array<{ code: string; value: any }>) {
    console.log('items in warehouse:', answers);
    console.table(
      answers.map((a) => ({
        code: a.code,
        value: Array.isArray(a.value) ? JSON.stringify(a.value) : a.value,
      }))
    );
  }

// ========================= SUBMIT / WEITER =========================
onWeiter() {
  this.submitted.set(true);

  this.markEnabledAsTouched(this.form);
  this.form.updateValueAndValidity({ emitEvent: false });
  const raw = this.form.getRawValue();

  const payload = {
    ...raw,
    reportFile: raw.reportFile ? raw.reportFile.name : null,
  };

  console.log('default values', payload);

  if (this.form.invalid) {
    this.scrollToFirstError();
    return;
  }

}

scrollToFirstError() {
  setTimeout(() => {
    const firstInvalid: HTMLElement | null =
      document.querySelector(
        '.is-invalid input, .is-invalid textarea, .is-invalid button'
      );

    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalid.focus();
    }
  });
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

