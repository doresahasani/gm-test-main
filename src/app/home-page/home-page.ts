import { CommonModule } from '@angular/common';
import { MedicalFormService } from '../_service/medical-form.service';
import { Component, inject, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { FooterActionsService } from '../layot/footer/footer-actions.service';
import { LocationService } from '../_service/location.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { EditFormStateService } from '../_service/edit-form-state.service';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import {
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';

export function requiredTrimmed(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (value === null || value === undefined) {
      return { required: true };
    }

    if (typeof value === 'string' && value.trim().length === 0) {
      return { required: true };
    }

    return null;
  };
}

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
  | 'remarks';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatExpansionModule,MatInputModule, MatOptionModule, MatAutocompleteModule,],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomeComponent {
  
  private footerActions = inject(FooterActionsService);
  private destroy$ = new Subject<void>();
  isFinished = signal(false);
  private pendingScrollStep: number | null = null;
  private finishReturnStep: number | null = null;
  private locationService = inject(LocationService);
  private medicalFormService = inject(MedicalFormService);
  private router = inject(Router);
  private editFormState = inject(EditFormStateService);
 
  zipOptions: string[] = [];
  zipLoading = false;

  isEditMode = false;
  editId: number | null = null;

  updatedRecordId = signal<number | null>(null);
  

onZipCityInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value?.trim() ?? '';

  if (value.length < 1) {
    this.zipOptions = [];
    return;
  }

  this.zipLoading = true;

  this.locationService.fetchDataByPlz(value).subscribe({
    next: (data: any) => {
      this.zipOptions = this.locationService.extractAutocompleteData(data);
      this.zipLoading = false;
    },
    error: (err: any) => {
      console.error('API ERROR:', err);
      this.zipOptions = [];
      this.zipLoading = false;
    }
  });
}
hideZipDropdown(): void {
  setTimeout(() => {
    this.zipOptions = [];
  }, 150);
}

onDoctorCitySelected(value: string): void {
  this.form.controls.doctorCity.setValue(value);
  this.form.controls.doctorCity.markAsDirty();
  this.form.controls.doctorCity.markAsTouched();
  this.form.controls.doctorCity.updateValueAndValidity({ emitEvent: false });
}
onMedZipCitySelected(index: number, value: string): void {
  const control = this.illnessCtrl(this.illnessesMed, index, 'docZipCity');
  control.setValue(value);
  control.markAsDirty();
  control.markAsTouched();
  control.updateValueAndValidity({ emitEvent: false });
}

onIllZipCitySelected(index: number, value: string): void {
  const control = this.illnessCtrl(this.illnessesIll, index, 'docZipCity');
  control.setValue(value);
  control.markAsDirty();
  control.markAsTouched();
  control.updateValueAndValidity({ emitEvent: false });
}

onOpsBZipCitySelected(index: number, value: string): void {
  const control = this.illnessCtrl(this.opsBItems, index, 'docZipCity');
  control.setValue(value);
  control.markAsDirty();
  control.markAsTouched();
  control.updateValueAndValidity({ emitEvent: false });
}
  private findFirstInvalidStep(): number | null {
    for (let s = 1; s <= this.TOTAL_STEPS; s++) {
      const controls = this.getControlsForStep12(s);
      controls.forEach((c) => c.updateValueAndValidity({ emitEvent: false }));
      if (!this.isStepValid12(s)) return s;
    }
    return null;
  }
  private nextUncompletedStep(from: number): number | null {
    const done = this.completedSteps();
    for (let s = from; s <= this.TOTAL_STEPS; s++) {
      if (!done.has(s)) return s;
    }
    return null;
  }
  private fileToArray(file: File | null) {
    if (!file) return [];

    return [
      { key: 'name', value: file.name },
      { key: 'size', value: file.size },
      { key: 'type', value: file.type },
      { key: 'lastModified', value: file.lastModified },
      { key: 'lastModifiedDate', value: new Date(file.lastModified).toString() },
      { key: 'webkitRelativePath', value: (file as any).webkitRelativePath ?? '' },
    ];
  }
  private fileToUploadArray(file: any) {
  if (!file) return [];

  if (Array.isArray(file)) {
    return file;
  }

  if (file instanceof File) {
    return [
      {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        lastModifiedDate: new Date(file.lastModified).toString(),
        webkitRelativePath: (file as any).webkitRelativePath ?? '',
      },
    ];
  }

  if (typeof file === 'object' && file.name) {
    return [file];
  }

  return [];
}

private buildHealthDeclarationPayload() {
  const raw = this.form.getRawValue();

  return {
    healthDeclarationQuestions: {
      step1: {
        heightCm: raw.heightCm,
        weightKg: raw.weightKg,
      },

      step2: {
        medication: raw.medication,
        medName: raw.medName,
        medReason: raw.medReason,
        illnessesMed: raw.illnessesMed,
      },

      step3: {
        illnessQ: raw.illnessQ,
        illnessesIll: raw.illnessesIll,
      },

      step4: {
        opsQ: raw.opsQ,
        opsA: raw.opsA,
        opsB: raw.opsB,
        opsC: raw.opsC,
        opsD: raw.opsD,
        opsBItems: raw.opsBItems,
      },

      step5: {
        doctorFirstName: raw.doctorFirstName,
        doctorLastName: raw.doctorLastName,
        doctorStreet: raw.doctorStreet,
        doctorNumber: raw.doctorNumber,
        doctorCity: raw.doctorCity,
      },

      step6: {
         reportFileName: this.selectedReportName() || null
      },

      step7: {
        teethCondition: raw.teethCondition,
        teethConditionNote: raw.teethConditionNote,
      },

      step8: {
        hygiene: raw.hygiene,
      },

      step9: {
        occlusion: raw.occlusion,
      },

      step10: {
        crownsCondition: raw.crownsCondition,
        crownsNote: raw.crownsNote,
      },

      step11: {
        bridgesCondition: raw.bridgesCondition,
        bridgesNote: raw.bridgesNote,
      },

      step12: {
        partialDenturesCondition: raw.partialDenturesCondition,
        partialDenturesNote: raw.partialDenturesNote,
      },

      step13: {
        dentition: raw.dentition,
        dentitionNote: raw.dentitionNote,
      },

      step14: {
        jaw: raw.jaw,
        jawNote: raw.jawNote,
      },

      step15: {
        futureTeethDisease: raw.futureTeethDisease,
        futureTeethDiseaseNote: raw.futureTeethDiseaseNote,
      },

      step16: {
        missingTeethQ: raw.missingTeethQ,
        missingTeeth: raw.missingTeeth,
        missingPermanent: raw.missingPermanent,
      },

      step17: {
        fillingsQ: raw.fillingsQ,
        fillingsTeeth: raw.fillingsTeeth,
        fillingsPermanent: raw.fillingsPermanent,
      },

      step18: {
        cariesQ: raw.cariesQ,
        cariesTeeth: raw.cariesTeeth,
        cariesPermanent: raw.cariesPermanent,
      },

      step19: {
        rootCanalQ: raw.rootCanalQ,
        rootCanalTeeth: raw.rootCanalTeeth,
        rootCanalPermanent: raw.rootCanalPermanent,
      },

      step20: {
        dentalTreatQ: raw.dentalTreatQ,
        dentalTreatWhich: raw.dentalTreatWhich,
      },

      step21: {
        lastRadiographyDate: raw.lastRadiographyDate,
      },

      step22: {
        remarks: raw.remarks,
      },
    },
  };
}
private uploadReportIfNeeded(id: number, done: () => void) {
  const report = this.form.controls.reportFile.value;

  if (!(report instanceof File) || !this.hasNewReportFile) {
    done();
    return;
  }

  this.medicalFormService.uploadReportFile(id, report).subscribe({
    next: () => {
      this.hasExistingReportFile = true;
      this.hasNewReportFile = false;
      done();
    },
    error: (err) => {
      console.error('Report upload failed:', err);
    }
  });
}

  private jumpToInvalidStep(step: number) {
    this.unmarkStepCompleted(step);  
    this.pendingScrollStep = step;
    this.setStep(step);

  setTimeout(() => {
    const controls = this.getControlsForStep12(step);

    controls.forEach((c) => this.markEnabledAsTouched(c));
    controls.forEach((c) => c.updateValueAndValidity({ emitEvent: false }));
    this.form.updateValueAndValidity({ emitEvent: false });

    this.setActiveFirstInvalid12(step);

    this.scrollToStepBody(step);

    setTimeout(() => {
      this.scrollToFirstError();
    }, 150);
  }, 0);
}
  completedSteps = signal<Set<number>>(new Set());

  isStepCompleted(step: number) {
    return this.completedSteps().has(step);
  }

  private markStepCompleted(step: number) {
    const s = new Set(this.completedSteps());
    s.add(step);
    this.completedSteps.set(s);
  }

ngOnInit() {
  this.footerActions.nextClick$
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      console.log('WEITER CLICK FROM FOOTER');

      if (this.isEditMode) {
        this.onUpdate();
      } else {
        this.onNext();
      }
    });

  if (this.editFormState.isEditMode()) {
    this.isEditMode = true;
    this.editId = this.editFormState.getEditId();
    this.currentStep.set(1);
    this.maxStepReached.set(this.TOTAL_STEPS);
  }
}
onUpdate() {
  this.submitted.set(true);

  for (let step = 1; step <= this.TOTAL_STEPS; step++) {
    const controls = this.getControlsForStep12(step);
    controls.forEach((c) => this.markEnabledAsTouched(c));
    controls.forEach((c) => c.updateValueAndValidity({ emitEvent: false }));
  }

  this.form.updateValueAndValidity({ emitEvent: false });

  console.log('UPDATE CLICKED');
  console.log('FORM VALID:', this.form.valid);
  console.log('FORM STATUS:', this.form.status);
  console.log('EDIT ID:', this.editId ?? this.editFormState.getEditId());
  console.log('RAW VALUE:', this.form.getRawValue());
  console.log('REPORT FILE RAW:', this.form.getRawValue().reportFile);

  const firstInvalid = this.findFirstInvalidStep();
  console.log('FIRST INVALID STEP:', firstInvalid);

  if (firstInvalid !== null) {
    console.log('FORM LOGICALLY INVALID - UPDATE STOPPED');
    this.jumpToInvalidStep(firstInvalid);
    return;
  }

  const payload = this.buildHealthDeclarationPayload();
  const id = this.editId ?? this.editFormState.getEditId();

  if (id == null) {
    console.error('Missing edit id');
    return;
  }

  console.log('UPDATE PAYLOAD:', payload);

  this.medicalFormService.updateMedicalForm(id, payload).subscribe({
    next: (response) => {
      console.log('Updated successfully:', response);

      const savedId = response?.id ?? id;
      this.updatedRecordId.set(savedId);

      this.uploadReportIfNeeded(savedId, () => {
        this.editFormState.clear();
        this.isFinished.set(true);

        setTimeout(() => {
          this.router.navigate(['/preview']);
        }, 3000);
      });
    },
    error: (err) => {
      console.error('Update failed:', err);
    }
  });
}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

 onPanelOpened(step: number) {
  if (this.isEditMode) return;

  if (this.pendingScrollStep !== step) return;

  this.pendingScrollStep = null;
  this.scrollToStepBody(step);
}
 openStep(step: number) {
  if (this.isEditMode) return;

  this.goToStep(step);

  requestAnimationFrame(() => {
    setTimeout(() => {
      this.scrollToStepBody(step);
    }, 250);
  });
}

  currentStep = signal<number>(1);
  maxStepReached = signal<number>(1);
  readonly TOTAL_STEPS = 22;

  private setStep(step: number) {
    if (step < 1 || step > this.TOTAL_STEPS) return;

    this.currentStep.set(step);
    this.maxStepReached.set(Math.max(this.maxStepReached(), step));

    this.submitted.set(false);
    this.activeKey.set(null);
  }

  goToStep(step: number) {
  if (this.isEditMode) return;

  this.setStep(step);
  if (!this.isStepValid12(step)) {
    this.unmarkStepCompleted(step);
  }
}
  private unmarkStepCompleted(step: number) {
    const s = new Set(this.completedSteps());
    s.delete(step);
    this.completedSteps.set(s);
  }

  onBack() {
    const step = this.currentStep();
    if (step > 1) this.setStep(step - 1);
  }

 onNext() {
  this.submitted.set(true);

  const step = this.currentStep();
  const controls = this.getControlsForStep12(step);

  controls.forEach((c) => this.markEnabledAsTouched(c));
  this.form.updateValueAndValidity({ emitEvent: false });
  

  if (!this.isStepValid12(step)) {
    this.unmarkStepCompleted(step); 
    this.setActiveFirstInvalid12(step);
    this.scrollToFirstError();
    return;
  }
  

  this.markStepCompleted(step);

  if (this.finishReturnStep !== null && step !== this.finishReturnStep) {
    const backTo = this.finishReturnStep;
    this.pendingScrollStep = backTo;
    this.setStep(backTo);

    setTimeout(() => this.onNext(), 0);
    return;
  }

 if (step === this.TOTAL_STEPS) {
  const firstInvalid = this.findFirstInvalidStep();

  if (firstInvalid !== null) {
    this.finishReturnStep = step;
    this.jumpToInvalidStep(firstInvalid);
    return;
  }

  this.finishReturnStep = null;

  const payload = this.buildHealthDeclarationPayload();
  console.log('FINAL JSON PAYLOAD:', structuredClone(payload));

  const request$ =
  this.isEditMode && this.editId
    ? this.medicalFormService.updateMedicalForm(this.editId, payload)
    : this.medicalFormService.addMedicalForm(payload);

request$.subscribe({
  next: (response) => {
    console.log(this.isEditMode ? 'Updated successfully:' : 'Saved successfully:', response);

    const savedId = response?.id ?? this.editId;

    if (savedId == null) {
      console.error('Missing saved id after save/update');
      return;
    }

    this.uploadReportIfNeeded(savedId, () => {
      this.editFormState.clear();
      this.updatedRecordId.set(savedId);
      this.isFinished.set(true);

      setTimeout(() => {
        this.router.navigate(['/preview']);
      }, 3000);
    });
  },
  error: (error) => {
    console.error(this.isEditMode ? 'Update failed:' : 'Save failed:', error);
  }
});
  return;
}

  const next = this.nextUncompletedStep(step + 1);

  if (next === null) {
    this.pendingScrollStep = this.TOTAL_STEPS;
    this.setStep(this.TOTAL_STEPS);

    setTimeout(() => this.onNext(), 0);
    return;
  }

  this.pendingScrollStep = next;
  this.setStep(next);

  setTimeout(() => this.scrollToStepBody(next), 0);
}
     
  onDankeOk() {
    this.isFinished.set(false);

    this.form.reset(undefined, { emitEvent: false });

    this.resetIllnessArrayToOne(this.illnessesMed);
    this.resetIllnessArrayToOne(this.illnessesIll);
    this.resetIllnessArrayToOne(this.opsBItems);

    while (this.missingTeethArr.length) this.missingTeethArr.removeAt(0);
    while (this.missingPermanentArr.length) this.missingPermanentArr.removeAt(0);

    while (this.fillingsTeethArr.length) this.fillingsTeethArr.removeAt(0);
    while (this.fillingsPermanentArr.length) this.fillingsPermanentArr.removeAt(0);

    while (this.cariesTeethArr.length) this.cariesTeethArr.removeAt(0);
    while (this.cariesPermanentArr.length) this.cariesPermanentArr.removeAt(0);

    while (this.rootTeethArr.length) this.rootTeethArr.removeAt(0);
    while (this.rootPermanentArr.length) this.rootPermanentArr.removeAt(0);
    this.disableMedicationDetails();
    this.disableIllnessDetails();
    this.disableOpsDetails();
    this.disableOpsBItems();

    this.submitted.set(false);
    this.activeKey.set(null);
    this.addAttemptMed.set(false);
    this.addAttemptIll.set(false);
    this.addAttemptOpsB.set(false);
    this.selectedReportName.set('');
    this.isReportDragOver.set(false);
    this.pendingScrollStep = null;
    this.finishReturnStep = null;

    this.currentStep.set(1);
    this.maxStepReached.set(1);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
 

  private getControlsForStep12(step: number): AbstractControl[] {
  switch (step) {
    case 1:
      return [this.form.controls.heightCm, this.form.controls.weightKg];

    case 2:
      if (this.form.controls.medication.value === false) {
        return [this.form.controls.medication];
      }
      return [
        this.form.controls.medication,
        this.form.controls.medName,
        this.form.controls.medReason,
        this.form.controls.illnessesMed,
      ];

    case 3:
      if (this.form.controls.illnessQ.value === false) {
        return [this.form.controls.illnessQ];
      }
      return [
        this.form.controls.illnessQ,
        this.form.controls.illnessesIll,
      ];

    case 4:
      if (this.form.controls.opsQ.value === false) {
        return [this.form.controls.opsQ];
      }

      const controls: AbstractControl[] = [
        this.form.controls.opsQ,
        this.form.controls.opsA,
        this.form.controls.opsB,
        this.form.controls.opsC,
        this.form.controls.opsD,
      ];

      if (this.form.controls.opsB.value === true) {
        controls.push(this.form.controls.opsBItems);
      }

      return controls;

    case 5:
      return [
        this.form.controls.doctorFirstName,
        this.form.controls.doctorLastName,
        this.form.controls.doctorStreet,
        this.form.controls.doctorNumber,
        this.form.controls.doctorCity,
      ];

    case 6:
      return [this.form.controls.reportFile];

    case 7:
      return [
        this.form.controls.teethCondition,
        this.form.controls.teethConditionNote,
      ];

    case 8:
      return [this.form.controls.hygiene];

    case 9:
      return [this.form.controls.occlusion];

    case 10:
      return [
        this.form.controls.crownsCondition,
        this.form.controls.crownsNote,
      ];

    case 11:
      return [
        this.form.controls.bridgesCondition,
        this.form.controls.bridgesNote,
      ];

    case 12:
      return [
        this.form.controls.partialDenturesCondition,
        this.form.controls.partialDenturesNote,
      ];

    case 13:
      return [
        this.form.controls.dentition,
        this.form.controls.dentitionNote,
      ];

    case 14:
      return [
        this.form.controls.jaw,
        this.form.controls.jawNote,
      ];

    case 15:
      return [
        this.form.controls.futureTeethDisease,
        this.form.controls.futureTeethDiseaseNote,
      ];

    case 16:
      if (this.form.controls.missingTeethQ.value === false) {
        return [this.form.controls.missingTeethQ];
      }
      return [
        this.form.controls.missingTeethQ,
        this.form.controls.missingTeeth,
        this.form.controls.missingPermanent,
      ];

    case 17:
      if (this.form.controls.fillingsQ.value === false) {
        return [this.form.controls.fillingsQ];
      }
      return [
        this.form.controls.fillingsQ,
        this.form.controls.fillingsTeeth,
        this.form.controls.fillingsPermanent,
      ];

    case 18:
      if (this.form.controls.cariesQ.value === false) {
        return [this.form.controls.cariesQ];
      }
      return [
        this.form.controls.cariesQ,
        this.form.controls.cariesTeeth,
        this.form.controls.cariesPermanent,
      ];

    case 19:
      if (this.form.controls.rootCanalQ.value === false) {
        return [this.form.controls.rootCanalQ];
      }
      return [
        this.form.controls.rootCanalQ,
        this.form.controls.rootCanalTeeth,
        this.form.controls.rootCanalPermanent,
      ];

    case 20:
      if (this.form.controls.dentalTreatQ.value === false) {
        return [this.form.controls.dentalTreatQ];
      }
      return [
        this.form.controls.dentalTreatQ,
        this.form.controls.dentalTreatWhich,
      ];

    case 21:
      return [this.form.controls.lastRadiographyDate];

    case 22:
      return [this.form.controls.remarks];

    default:
      return [];
  }
}

  private isStepValid12(step: number): boolean {
  const controls = this.getControlsForStep12(step);

  return controls.every((c) => {
    if (c.disabled) return true;

    if (c instanceof FormArray) {
      return c.valid;
    }

    if (c instanceof FormGroup) {
      return Object.values(c.controls).every(ctrl => ctrl.valid);
    }

    return c.valid;
  });
}

 private setActiveFirstInvalid12(step: number) {
  const setIfInvalid = (key: ActiveKey, ctrl: AbstractControl) => {
    if (ctrl.enabled && ctrl.invalid) {
      this.setActive(key);
      return true;
    }
    return false;
  };

  if (step === 1) {
    if (setIfInvalid('heightCm', this.form.controls.heightCm)) return;
    if (setIfInvalid('weightKg', this.form.controls.weightKg)) return;
    return;
  }

  if (step === 2) {
    if (setIfInvalid('medication', this.form.controls.medication)) return;
    if (setIfInvalid('medName', this.form.controls.medName)) return;
    if (setIfInvalid('medReason', this.form.controls.medReason)) return;

    const arr = this.illnessesMed;
    for (let i = 0; i < arr.length; i++) {
      const g = arr.at(i);
      if (g.enabled && g.invalid) {
        this.setActiveToFirstInvalidInArray('med', i, g);
        return;
      }
    }
    return;
  }

  if (step === 3) {
    if (setIfInvalid('illnessQ', this.form.controls.illnessQ)) return;

    const arr = this.illnessesIll;
    for (let i = 0; i < arr.length; i++) {
      const g = arr.at(i);
      if (g.enabled && g.invalid) {
        this.setActiveToFirstInvalidInArray('ill', i, g);
        return;
      }
    }
    return;
  }

  if (step === 4) {
    if (setIfInvalid('opsQ', this.form.controls.opsQ)) return;
    if (setIfInvalid('opsA', this.form.controls.opsA)) return;
    if (setIfInvalid('opsB', this.form.controls.opsB)) return;
    if (setIfInvalid('opsC', this.form.controls.opsC)) return;
    if (setIfInvalid('opsD', this.form.controls.opsD)) return;

    const arr = this.opsBItems;
    for (let i = 0; i < arr.length; i++) {
      const g = arr.at(i);
      if (g.enabled && g.invalid) {
        this.setActiveToFirstInvalidInArray('opsB', i, g);
        return;
      }
    }
    return;
  }

  if (step === 5) {
    if (setIfInvalid('doctorFirstName', this.form.controls.doctorFirstName)) return;
    if (setIfInvalid('doctorLastName', this.form.controls.doctorLastName)) return;
    if (setIfInvalid('doctorStreet', this.form.controls.doctorStreet)) return;
    if (setIfInvalid('doctorNumber', this.form.controls.doctorNumber)) return;
    if (setIfInvalid('doctorCity', this.form.controls.doctorCity)) return;
    return;
  }

  if (step === 6) {
    if (setIfInvalid('reportFile', this.form.controls.reportFile)) return;
    return;
  }

  if (step === 7) {
    if (setIfInvalid('teethCondition', this.form.controls.teethCondition)) return;
    if (setIfInvalid('teethConditionNote', this.form.controls.teethConditionNote)) return;
    return;
  }

  if (step === 8) {
    if (setIfInvalid('hygiene', this.form.controls.hygiene)) return;
    return;
  }

  if (step === 9) {
    if (setIfInvalid('occlusion', this.form.controls.occlusion)) return;
    return;
  }

  if (step === 10) {
    if (setIfInvalid('crownsCondition', this.form.controls.crownsCondition)) return;
    if (setIfInvalid('crownsNote', this.form.controls.crownsNote)) return;
    return;
  }

  if (step === 11) {
    if (setIfInvalid('bridgesCondition', this.form.controls.bridgesCondition)) return;
    if (setIfInvalid('bridgesNote', this.form.controls.bridgesNote)) return;
    return;
  }

  if (step === 12) {
    if (setIfInvalid('partialDenturesCondition', this.form.controls.partialDenturesCondition)) return;
    if (setIfInvalid('partialDenturesNote', this.form.controls.partialDenturesNote)) return;
    return;
  }

  if (step === 13) {
    if (setIfInvalid('dentition', this.form.controls.dentition)) return;
    if (setIfInvalid('dentitionNote', this.form.controls.dentitionNote)) return;
    return;
  }

  if (step === 14) {
    if (setIfInvalid('jaw', this.form.controls.jaw)) return;
    if (setIfInvalid('jawNote', this.form.controls.jawNote)) return;
    return;
  }

  if (step === 15) {
    if (setIfInvalid('futureTeethDisease', this.form.controls.futureTeethDisease)) return;
    if (setIfInvalid('futureTeethDiseaseNote', this.form.controls.futureTeethDiseaseNote)) return;
    return;
  }

  if (step === 16) {
    if (setIfInvalid('missingTeethQ', this.form.controls.missingTeethQ)) return;
    if (setIfInvalid('missingTeeth', this.form.controls.missingTeeth)) return;
    if (setIfInvalid('missingPermanent', this.form.controls.missingPermanent)) return;
    return;
  }

  if (step === 17) {
    if (setIfInvalid('fillingsQ', this.form.controls.fillingsQ)) return;
    if (setIfInvalid('fillingsTeeth', this.form.controls.fillingsTeeth)) return;
    if (setIfInvalid('fillingsPermanent', this.form.controls.fillingsPermanent)) return;
    return;
  }

  if (step === 18) {
    if (setIfInvalid('cariesQ', this.form.controls.cariesQ)) return;
    if (setIfInvalid('cariesTeeth', this.form.controls.cariesTeeth)) return;
    if (setIfInvalid('cariesPermanent', this.form.controls.cariesPermanent)) return;
    return;
  }

  if (step === 19) {
    if (setIfInvalid('rootCanalQ', this.form.controls.rootCanalQ)) return;
    if (setIfInvalid('rootCanalTeeth', this.form.controls.rootCanalTeeth)) return;
    if (setIfInvalid('rootCanalPermanent', this.form.controls.rootCanalPermanent)) return;
    return;
  }

  if (step === 20) {
    if (setIfInvalid('dentalTreatQ', this.form.controls.dentalTreatQ)) return;
    if (setIfInvalid('dentalTreatWhich', this.form.controls.dentalTreatWhich)) return;
    return;
  }

  if (step === 21) {
    if (setIfInvalid('lastRadiographyDate', this.form.controls.lastRadiographyDate)) return;
    return;
  }

  if (step === 22) {
    if (setIfInvalid('remarks', this.form.controls.remarks)) return;
    return;
  }
}

  private fb = inject(FormBuilder);

  activeKey = signal<ActiveKey>(null);
  submitted = signal(false);

  addAttemptMed = signal(false);
  addAttemptIll = signal(false);
  addAttemptOpsB = signal(false);


  selectedReportName = signal<string>('');
  isReportDragOver = signal(false);

  form = this.fb.group({
    heightCm: this.fb.control<number | null>(null, [
      requiredTrimmed(),
      Validators.min(0),
      Validators.max(350),
    ]),
    weightKg: this.fb.control<number | null>(null, [
      requiredTrimmed(),
      Validators.min(0),
      Validators.max(600),
    ]),

    medication: this.fb.control<boolean | null>(null, [requiredTrimmed()]),
    medName: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true, validators: [requiredTrimmed()] }),
    medReason: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true, validators: [requiredTrimmed()] }),
    illnessesMed: this.fb.array<IllnessForm>([this.createIllnessGroup()]),

    illnessQ: this.fb.control<boolean | null>(null, [requiredTrimmed()]),
    illnessesIll: this.fb.array<IllnessForm>([this.createIllnessGroup()]),

    opsQ: this.fb.control<boolean | null>(null, [requiredTrimmed()]),
    opsA: this.fb.control<boolean | null>({ value: null, disabled: true }),
    opsB: this.fb.control<boolean | null>({ value: null, disabled: true }),
    opsC: this.fb.control<boolean | null>({ value: null, disabled: true }),
    opsD: this.fb.control<boolean | null>({ value: null, disabled: true }),
    opsBItems: this.fb.array<IllnessForm>([this.createIllnessGroup()]),

    doctorFirstName: this.fb.control('', { nonNullable: true, validators: [requiredTrimmed()] }),
    doctorLastName: this.fb.control('', { nonNullable: true, validators: [requiredTrimmed()]  }),
    doctorStreet: this.fb.control('', { nonNullable: true, validators: [requiredTrimmed()] }),
    doctorNumber: this.fb.control('', { nonNullable: true, validators: [requiredTrimmed()]  }),
    doctorCity: this.fb.control('', { nonNullable: true, validators: [requiredTrimmed()] }),

    reportFile: this.fb.control<File | null>(null, [requiredTrimmed()]),

    teethCondition: this.fb.control<'gut' | 'mangelhaft' | 'schlecht' | null>(null, [
      requiredTrimmed(),
    ]),
    teethConditionNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true ,validators:requiredTrimmed() }),

    hygiene: this.fb.control<'gut' | 'mangelhaft' | 'schlecht' | null>(null, [requiredTrimmed()]),
    hygieneNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true, validators: [requiredTrimmed()] }),

    occlusion: this.fb.control<'klasse1' | 'klasse2' | 'klasse3' | null>(null, [requiredTrimmed()]),

    crownsCondition: this.fb.control<'keine' | 'gut' | 'mangelhaft' | 'schlecht' | null>(null, [
      requiredTrimmed(),
    ]),
    crownsNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true, validators: [requiredTrimmed()] }),

    bridgesCondition: this.fb.control<'keine' | 'gut' | 'mangelhaft' | 'schlecht' | null>(null, [
      requiredTrimmed(),
    ]),
    bridgesNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true, validators: [requiredTrimmed()] }),

    partialDenturesCondition: this.fb.control<'keine' | 'gut' | 'mangelhaft' | 'schlecht' | null>(
      null,
      [requiredTrimmed()]
    ),
    partialDenturesNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true, validators: [requiredTrimmed()]}),

    dentition: this.fb.control<boolean | null>(null, [requiredTrimmed()]),
    dentitionNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true, validators: [requiredTrimmed()] }),

    jaw: this.fb.control<boolean | null>(null, [requiredTrimmed()]),
    jawNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true, validators: [requiredTrimmed()] }),

    futureTeethDisease: this.fb.control<boolean | null>(null, [requiredTrimmed()]),
    futureTeethDiseaseNote: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true, validators: [requiredTrimmed()] }),

    lastRadiographyDate: this.fb.control<string>('', {
      nonNullable: true,
      validators: [requiredTrimmed()],
    }),

    missingTeethQ: this.fb.control<boolean | null>(null, [requiredTrimmed()]),
    missingTeeth: this.fb.array<FormControl<string>>([], { validators: [this.minSelected(1)] }),
    missingPermanent: this.fb.array<FormControl<string>>([], { validators: [this.minSelected(1)] }),

    fillingsQ: this.fb.control<boolean | null>(null, [requiredTrimmed()]),
    fillingsTeeth: this.fb.array<FormControl<string>>([], { validators: [this.minSelected(1)] }),
    fillingsPermanent: this.fb.array<FormControl<string>>([], { validators: [this.minSelected(1)] }),

    cariesQ: this.fb.control<boolean | null>(null, [requiredTrimmed()]),
    cariesTeeth: this.fb.array<FormControl<string>>([], { validators: [this.minSelected(1)] }),
    cariesPermanent: this.fb.array<FormControl<string>>([], { validators: [this.minSelected(1)] }),

    rootCanalQ: this.fb.control<boolean | null>(null, [requiredTrimmed()]),
    rootCanalTeeth: this.fb.array<FormControl<string>>([], { validators: [this.minSelected(1)] }),
    rootCanalPermanent: this.fb.array<FormControl<string>>([], { validators: [this.minSelected(1)] }),

    dentalTreatQ: this.fb.control<boolean | null>(null, [requiredTrimmed()]),
    dentalTreatWhich: this.fb.control<string>({ value: '', disabled: true }, { nonNullable: true, validators: [requiredTrimmed()]  }),

    remarks: this.fb.control<string>('', {
      nonNullable: true,
      validators: [requiredTrimmed()],
    }),
  });
constructor() {
  this.disableMedicationDetails();
  this.disableIllnessDetails();
  this.disableOpsDetails();
  this.disableOpsBItems();
  

  this.illnessesIll.clearValidators();
  this.illnessesIll.updateValueAndValidity({ emitEvent: false });

  this.opsBItems.clearValidators();
  this.opsBItems.updateValueAndValidity({ emitEvent: false });

  this.form.controls.teethConditionNote.disable({ emitEvent: false });
  this.form.controls.hygieneNote.disable({ emitEvent: false });
  this.form.controls.crownsNote.disable({ emitEvent: false });
  this.form.controls.bridgesNote.disable({ emitEvent: false });
  this.form.controls.partialDenturesNote.disable({ emitEvent: false });
  this.form.controls.dentitionNote.disable({ emitEvent: false });
  this.form.controls.jawNote.disable({ emitEvent: false });
  this.form.controls.futureTeethDiseaseNote.disable({ emitEvent: false });

  this.form.controls.dentalTreatWhich.disable({ emitEvent: false });
  this.form.controls.dentalTreatWhich.clearValidators();
  this.form.controls.dentalTreatWhich.updateValueAndValidity({ emitEvent: false });
  this.form.controls.missingTeeth.setValidators([
  () =>
    this.requireAtLeastOneSelection(
      this.form.controls.missingTeethQ,
      this.missingTeethArr,
      this.missingPermanentArr
    )
]);

this.form.controls.missingPermanent.setValidators([
  () =>
    this.requireAtLeastOneSelection(
      this.form.controls.missingTeethQ,
      this.missingTeethArr,
      this.missingPermanentArr
    )
]);

this.form.controls.fillingsTeeth.setValidators([
  () =>
    this.requireAtLeastOneSelection(
      this.form.controls.fillingsQ,
      this.fillingsTeethArr,
      this.fillingsPermanentArr
    )
]);

this.form.controls.fillingsPermanent.setValidators([
  () =>
    this.requireAtLeastOneSelection(
      this.form.controls.fillingsQ,
      this.fillingsTeethArr,
      this.fillingsPermanentArr
    )
]);

this.form.controls.cariesTeeth.setValidators([
  () =>
    this.requireAtLeastOneSelection(
      this.form.controls.cariesQ,
      this.cariesTeethArr,
      this.cariesPermanentArr
    )
]);

this.form.controls.cariesPermanent.setValidators([
  () =>
    this.requireAtLeastOneSelection(
      this.form.controls.cariesQ,
      this.cariesTeethArr,
      this.cariesPermanentArr
    )
]);

this.form.controls.rootCanalTeeth.setValidators([
  () =>
    this.requireAtLeastOneSelection(
      this.form.controls.rootCanalQ,
      this.rootTeethArr,
      this.rootPermanentArr
    )
]);

this.form.controls.rootCanalPermanent.setValidators([
  () =>
    this.requireAtLeastOneSelection(
      this.form.controls.rootCanalQ,
      this.rootTeethArr,
      this.rootPermanentArr
    )
]);

this.form.controls.missingTeeth.updateValueAndValidity({ emitEvent: false });
this.form.controls.missingPermanent.updateValueAndValidity({ emitEvent: false });
this.form.controls.fillingsTeeth.updateValueAndValidity({ emitEvent: false });
this.form.controls.fillingsPermanent.updateValueAndValidity({ emitEvent: false });
this.form.controls.cariesTeeth.updateValueAndValidity({ emitEvent: false });
this.form.controls.cariesPermanent.updateValueAndValidity({ emitEvent: false });
this.form.controls.rootCanalTeeth.updateValueAndValidity({ emitEvent: false });
this.form.controls.rootCanalPermanent.updateValueAndValidity({ emitEvent: false });

  this.locationService.fetchDataByPlz('8000').subscribe({
    next: (data: any) => console.log('RAW API DATA:', data),
    error: (err: any) => console.error('API ERROR:', err),
  });

  const editData = this.editFormState.getEditData();
const editId = this.editFormState.getEditId();

if (editData && editId) {
  this.isEditMode = true;
  this.editId = editId;

  try {
    const parsed = editData?.healthDeclarationJson
      ? JSON.parse(editData.healthDeclarationJson)
      : null;

    const q =
      parsed?.healthDeclarationQuestions ??
      parsed?.HealthDeclarationQuestions ??
      parsed ??
      null;

    if (q) {
     const existingReportName = q.step6?.reportFileName ?? null;

    this.hasExistingReportFile = !!existingReportName;

    if (this.hasExistingReportFile) {
      this.selectedReportName.set(existingReportName ?? 'PDF bereits vorhanden');
      this.form.controls.reportFile.setValue(null);
      this.form.controls.reportFile.clearValidators();
      this.form.controls.reportFile.updateValueAndValidity({ emitEvent: false });
    }
        
      this.form.patchValue(
        {
          heightCm: q.step1?.heightCm ?? null,
          weightKg: q.step1?.weightKg ?? null,

          medication: q.step2?.medication ?? null,
          medName: q.step2?.medName ?? '',
          medReason: q.step2?.medReason ?? '',

          illnessQ: q.step3?.illnessQ ?? null,

          opsQ: q.step4?.opsQ ?? null,
          opsA: q.step4?.opsA ?? null,
          opsB: q.step4?.opsB ?? null,
          opsC: q.step4?.opsC ?? null,
          opsD: q.step4?.opsD ?? null,

          doctorFirstName: q.step5?.doctorFirstName ?? '',
          doctorLastName: q.step5?.doctorLastName ?? '',
          doctorStreet: q.step5?.doctorStreet ?? '',
          doctorNumber: q.step5?.doctorNumber ?? '',
          doctorCity: q.step5?.doctorCity ?? '',

          reportFile:null,

          teethCondition: q.step7?.teethCondition ?? null,
          teethConditionNote: q.step7?.teethConditionNote ?? '',

          hygiene: q.step8?.hygiene ?? null,
          occlusion: q.step9?.occlusion ?? null,

          crownsCondition: q.step10?.crownsCondition ?? null,
          crownsNote: q.step10?.crownsNote ?? '',

          bridgesCondition: q.step11?.bridgesCondition ?? null,
          bridgesNote: q.step11?.bridgesNote ?? '',

          partialDenturesCondition: q.step12?.partialDenturesCondition ?? null,
          partialDenturesNote: q.step12?.partialDenturesNote ?? '',

          dentition: q.step13?.dentition ?? null,
          dentitionNote: q.step13?.dentitionNote ?? '',

          jaw: q.step14?.jaw ?? null,
          jawNote: q.step14?.jawNote ?? '',

          futureTeethDisease: q.step15?.futureTeethDisease ?? null,
          futureTeethDiseaseNote: q.step15?.futureTeethDiseaseNote ?? '',

          missingTeethQ: q.step16?.missingTeethQ ?? null,
          fillingsQ: q.step17?.fillingsQ ?? null,
          cariesQ: q.step18?.cariesQ ?? null,
          rootCanalQ: q.step19?.rootCanalQ ?? null,

          dentalTreatQ: q.step20?.dentalTreatQ ?? null,
          dentalTreatWhich: q.step20?.dentalTreatWhich ?? '',

          lastRadiographyDate: q.step21?.lastRadiographyDate ?? '',
          remarks: q.step22?.remarks ?? ''
        },
        { emitEvent: false }
      );

      if (q.step2?.medication === true) this.enableMedicationDetails();
      else this.disableMedicationDetails();

      if (q.step3?.illnessQ === true) this.enableIllnessDetails();
      else this.disableIllnessDetails();

      if (q.step4?.opsQ === true) this.enableOpsDetails();
      else this.disableOpsDetails();

      if (q.step4?.opsB === true) this.enableOpsBItems();
      else this.disableOpsBItems();

     this.setIllnessArray(this.form.controls.illnessesMed, q.step2?.illnessesMed);
      this.setIllnessArray(this.form.controls.illnessesIll, q.step3?.illnessesIll);
      this.setIllnessArray(this.form.controls.opsBItems, q.step4?.opsBItems);

      this.setStringArray(this.missingTeethArr, q.step16?.missingTeeth);
      this.setStringArray(this.missingPermanentArr, q.step16?.missingPermanent);

      this.setStringArray(this.fillingsTeethArr, q.step17?.fillingsTeeth);
      this.setStringArray(this.fillingsPermanentArr, q.step17?.fillingsPermanent);

      this.setStringArray(this.cariesTeethArr, q.step18?.cariesTeeth);
      this.setStringArray(this.cariesPermanentArr, q.step18?.cariesPermanent);

      this.setStringArray(this.rootTeethArr, q.step19?.rootCanalTeeth);
      this.setStringArray(this.rootPermanentArr, q.step19?.rootCanalPermanent);

      if (q.step7?.teethCondition === 'mangelhaft') {
        this.form.controls.teethConditionNote.enable({ emitEvent: false });
        this.form.controls.teethConditionNote.setValidators([requiredTrimmed()]);
        this.form.controls.teethConditionNote.updateValueAndValidity({ emitEvent: false });
      }

      if (q.step10?.crownsCondition === 'mangelhaft') {
        this.form.controls.crownsNote.enable({ emitEvent: false });
        this.form.controls.crownsNote.setValidators([requiredTrimmed()]);
        this.form.controls.crownsNote.updateValueAndValidity({ emitEvent: false });
      }

      if (q.step11?.bridgesCondition === 'mangelhaft') {
        this.form.controls.bridgesNote.enable({ emitEvent: false });
        this.form.controls.bridgesNote.setValidators([requiredTrimmed()]);
        this.form.controls.bridgesNote.updateValueAndValidity({ emitEvent: false });
      }

      if (q.step12?.partialDenturesCondition === 'mangelhaft') {
        this.form.controls.partialDenturesNote.enable({ emitEvent: false });
        this.form.controls.partialDenturesNote.setValidators([requiredTrimmed()]);
        this.form.controls.partialDenturesNote.updateValueAndValidity({ emitEvent: false });
      }

      if (q.step13?.dentition === true) {
        this.form.controls.dentitionNote.enable({ emitEvent: false });
        this.form.controls.dentitionNote.setValidators([requiredTrimmed()]);
        this.form.controls.dentitionNote.updateValueAndValidity({ emitEvent: false });
      }

      if (q.step14?.jaw === true) {
        this.form.controls.jawNote.enable({ emitEvent: false });
        this.form.controls.jawNote.setValidators([requiredTrimmed()]);
        this.form.controls.jawNote.updateValueAndValidity({ emitEvent: false });
      }

      if (q.step15?.futureTeethDisease === true) {
        this.form.controls.futureTeethDiseaseNote.enable({ emitEvent: false });
        this.form.controls.futureTeethDiseaseNote.setValidators([requiredTrimmed()]);
        this.form.controls.futureTeethDiseaseNote.updateValueAndValidity({ emitEvent: false });
      }

      if (q.step20?.dentalTreatQ === true) {
        this.form.controls.dentalTreatWhich.enable({ emitEvent: false });
        this.form.controls.dentalTreatWhich.setValidators([requiredTrimmed()]);
        this.form.controls.dentalTreatWhich.updateValueAndValidity({ emitEvent: false });
      }
      

      this.form.updateValueAndValidity({ emitEvent: false });
    }
  } catch (e) {
    console.error('Edit parse error:', e);
  }
}
}

  openDatePicker(input: HTMLInputElement) {
    if (!input) return;
    const anyInput = input as any;
    if (typeof anyInput.showPicker === 'function') anyInput.showPicker();
    else {
      input.focus();
      input.click();
    }
  }

  get illnessesMed(): FormArray<IllnessForm> {
    return this.form.controls.illnessesMed;
  }

  get illnessesIll(): FormArray<IllnessForm> {
    return this.form.controls.illnessesIll;
  }

  get opsBItems(): FormArray<IllnessForm> {
    return this.form.controls.opsBItems;
  }

  setActive(key: ActiveKey) {
    this.activeKey.set(key);
  }

  isActive(key: Exclude<ActiveKey, null>) {
    return this.activeKey() === key;
  }

  hasValue(ctrl: { value: any } | null | undefined): boolean {
    const v = ctrl?.value;
    return v !== null && v !== undefined;
  }

  hasText(ctrl: { value: any } | null | undefined): boolean {
    const v = ctrl?.value;
    if (v === null || v === undefined) return false;
    return String(v).trim().length > 0;
  }

  hasExistingReportFile = false;

  hasNewReportFile = false;

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

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
      ctrl.markAsTouched();
      ctrl.controls.forEach((c) => this.markEnabledAsTouched(c));
      ctrl.updateValueAndValidity({ emitEvent: false });
      return;
    }
  }
  private minSelected(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const arr = control as FormArray;
    return arr.length >= min ? null : { required: true };
  };
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

    private createIllnessGroup(): IllnessForm {
      const group = this.fb.group(
        {
          desc: this.fb.control('', { nonNullable: true, validators: [requiredTrimmed()] }),
          startDate: this.fb.control('', { nonNullable: true, validators: [requiredTrimmed()] }),
          endDate: this.fb.control('', { nonNullable: true, validators: [requiredTrimmed()] }),
          operated: this.fb.control<boolean | null>(null, { validators: [requiredTrimmed()] }),
          treatmentDone: this.fb.control<boolean | null>(null, { validators: [requiredTrimmed()] }),

          docFirstName: this.fb.control('', { nonNullable: true, validators: [requiredTrimmed()] }),
          docLastName: this.fb.control('', { nonNullable: true, validators: [requiredTrimmed()] }),
          docStreet: this.fb.control('', { nonNullable: true, validators: [requiredTrimmed()] }),
          docNr: this.fb.control('', { nonNullable: true, validators: [requiredTrimmed()] }),
          docZipCity: this.fb.control('', { nonNullable: true, validators: [requiredTrimmed()] }),
        },
        {
          validators: [this.endDateNotBeforeStartDate()]
        }
      ) as IllnessForm;

      group.controls.startDate.valueChanges.subscribe(() => {
        group.updateValueAndValidity({ emitEvent: false });
      });

      group.controls.endDate.valueChanges.subscribe(() => {
        group.updateValueAndValidity({ emitEvent: false });
      });

      return group;
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

  private removeIllnessByRef(arr: FormArray<IllnessForm>, group: IllnessForm) {
    this.submitted.set(false);
    this.addAttemptMed.set(false);
    this.addAttemptIll.set(false);
    this.addAttemptOpsB.set(false);
    this.activeKey.set(null);

    if (arr.length === 1) {
      this.resetIllnessArrayToOne(arr);
      return;
    }

    const idx = arr.controls.indexOf(group);
    if (idx === -1) return;

    arr.removeAt(idx);
    arr.updateValueAndValidity({ emitEvent: false });
  }

  //arrays
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
  private setStringArray(
  arr: FormArray<FormControl<string>>,
  items: string[] | undefined | null
): void {
  while (arr.length > 0) {
    arr.removeAt(0);
  }
  const source = Array.isArray(items) ? items : [];

  source.forEach((item) => {
    arr.push(new FormControl(item ?? '', { nonNullable: true }));
  });

  arr.updateValueAndValidity({ emitEvent: false });
}
private setIllnessArray(arr: FormArray<IllnessForm>, items: any[] | undefined | null): void {
  while (arr.length > 0) {
    arr.removeAt(0);
  }

  const source = Array.isArray(items) ? items : [];

  if (source.length === 0) {
    arr.push(this.createIllnessGroup());
    arr.updateValueAndValidity({ emitEvent: false });
    return;
  }

  source.forEach((item) => {
    const group = this.createIllnessGroup();

    group.patchValue(
      {
        desc: item?.desc ?? '',
        startDate: item?.startDate ?? '',
        endDate: item?.endDate ?? '',
        operated: item?.operated ?? null,
        treatmentDone: item?.treatmentDone ?? null,
        docFirstName: item?.docFirstName ?? '',
        docLastName: item?.docLastName ?? '',
        docStreet: item?.docStreet ?? '',
        docNr: item?.docNr ?? '',
        docZipCity: item?.docZipCity ?? ''
      },
      { emitEvent: false }
    );

    arr.push(group);
  });

  arr.updateValueAndValidity({ emitEvent: false });
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

  private endDateNotBeforeStartDate() {
  return (group: AbstractControl) => {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;

    if (!start || !end) {
      return null;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    return endDate < startDate ? { endBeforeStart: true } : null;
  };
}

  private applyProviderValidatorsToGroup(g: IllnessForm, required: boolean) {
    const providerControls = [
      g.controls.docFirstName,
      g.controls.docLastName,
      g.controls.docStreet,
      g.controls.docNr,
      g.controls.docZipCity,
    ];

    providerControls.forEach((c) => {
      if (required) c.setValidators([requiredTrimmed()]);
      else c.clearValidators();
      c.updateValueAndValidity({ emitEvent: false });
    });
  }

  private applyProviderValidators(arr: FormArray<IllnessForm>, required: boolean) {
    arr.controls.forEach((g) => this.applyProviderValidatorsToGroup(g, required));
    arr.updateValueAndValidity({ emitEvent: false });
  }

  setTeethCondition(value: 'gut' | 'mangelhaft' | 'schlecht') {
    this.form.controls.teethCondition.setValue(value);
    this.form.controls.teethCondition.markAsDirty();
    this.form.controls.teethCondition.markAsTouched();
    this.form.controls.teethCondition.updateValueAndValidity({ emitEvent: false });
    this.setActive('teethCondition');

  const note = this.form.controls.teethConditionNote;

  if (value === 'mangelhaft') {
    note.enable({ emitEvent: false });
    note.setValidators([requiredTrimmed()]);
    note.markAsPristine();
    note.markAsUntouched();
  } else {
    note.reset('', { emitEvent: false });
    note.clearValidators();
    note.disable({ emitEvent: false });
    note.markAsPristine();
    note.markAsUntouched();
  }

  note.updateValueAndValidity({ emitEvent: false });
  this.submitted.set(false);
}


  setHygiene(value: 'gut' | 'mangelhaft' | 'schlecht') {
    this.form.controls.hygiene.setValue(value);
    this.setActive('hygiene');
  }

  setOcclusion(value: 'klasse1' | 'klasse2' | 'klasse3') {
    this.form.controls.occlusion.setValue(value);
    this.setActive('occlusion');
  }

  setCrownsCondition(value: 'keine' | 'gut' | 'mangelhaft' | 'schlecht') {
    this.form.controls.crownsCondition.setValue(value);
    this.form.controls.crownsCondition.markAsDirty();
    this.form.controls.crownsCondition.markAsTouched();
    this.form.controls.crownsCondition.updateValueAndValidity({ emitEvent: false });
    this.setActive('crownsCondition');

  const note = this.form.controls.crownsNote;

  if (value === 'mangelhaft') {
    note.enable({ emitEvent: false });
    note.setValidators([requiredTrimmed()]);
    note.markAsPristine();
    note.markAsUntouched();
  } else {
    note.reset('', { emitEvent: false });
    note.clearValidators();
    note.disable({ emitEvent: false });
    note.markAsPristine();
    note.markAsUntouched();
  }

  note.updateValueAndValidity({ emitEvent: false });
  this.submitted.set(false);
}

  setBridgesCondition(value: 'keine' | 'gut' | 'mangelhaft' | 'schlecht') {
    this.form.controls.bridgesCondition.setValue(value);
    this.form.controls.bridgesCondition.markAsDirty();
    this.form.controls.bridgesCondition.markAsTouched();
    this.form.controls.bridgesCondition.updateValueAndValidity({ emitEvent: false });
    this.setActive('bridgesCondition');

    const note = this.form.controls.bridgesNote;

    if (value === 'mangelhaft') {
      note.enable({ emitEvent: false });
      note.setValidators([requiredTrimmed()]);
      note.markAsPristine();
      note.markAsUntouched();
    } else {
      note.reset('', { emitEvent: false });
      note.clearValidators();
      note.disable({ emitEvent: false });
      note.markAsPristine();
      note.markAsUntouched();
    }

    note.updateValueAndValidity({ emitEvent: false });
    this.submitted.set(false);
  }

  setPartialDenturesCondition(value: 'keine' | 'gut' | 'mangelhaft' | 'schlecht') {
    this.form.controls.partialDenturesCondition.setValue(value);
    this.form.controls.partialDenturesCondition.markAsDirty();
    this.form.controls.partialDenturesCondition.markAsTouched();
    this.form.controls.partialDenturesCondition.updateValueAndValidity({ emitEvent: false });
    this.setActive('partialDenturesCondition');

    const note = this.form.controls.partialDenturesNote;

    if (value === 'mangelhaft') {
      note.enable({ emitEvent: false });
      note.setValidators([requiredTrimmed()]);
      note.markAsPristine();
      note.markAsUntouched();
    } else {
      note.reset('', { emitEvent: false });
      note.clearValidators();
      note.disable({ emitEvent: false });
      note.markAsPristine();
      note.markAsUntouched();
    }

    note.updateValueAndValidity({ emitEvent: false });
    this.submitted.set(false);
  }

  setDentition(value: boolean) {
    this.form.controls.dentition.setValue(value);
    this.form.controls.dentition.markAsDirty();
    this.form.controls.dentition.markAsTouched();
    this.form.controls.dentition.updateValueAndValidity({ emitEvent: false });
    this.setActive('dentition');

    const note = this.form.controls.dentitionNote;

    if (value === true) {
      note.enable({ emitEvent: false });
      note.setValidators([requiredTrimmed()]);
      note.markAsPristine();
      note.markAsUntouched();
    } else {
      note.reset('', { emitEvent: false });
      note.clearValidators();
      note.disable({ emitEvent: false });
      note.markAsPristine();
      note.markAsUntouched();
    }

    note.updateValueAndValidity({ emitEvent: false });
    this.submitted.set(false);
}

  setJaw(value: boolean) {
    this.form.controls.jaw.setValue(value);
    this.form.controls.jaw.markAsDirty();
    this.form.controls.jaw.markAsTouched();
    this.form.controls.jaw.updateValueAndValidity({ emitEvent: false });
    this.setActive('jaw');

    const note = this.form.controls.jawNote;

    if (value === true) {
      note.enable({ emitEvent: false });
      note.setValidators([requiredTrimmed()]);
      note.markAsPristine();
      note.markAsUntouched();
    } else {
      note.reset('', { emitEvent: false });
      note.clearValidators();
      note.disable({ emitEvent: false });
      note.markAsPristine();
      note.markAsUntouched();
    }

    note.updateValueAndValidity({ emitEvent: false });
    this.submitted.set(false);
  }

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

  this.submitted.set(false);

  this.missingTeethArr.markAsPristine();
  this.missingTeethArr.markAsUntouched();
  this.missingPermanentArr.markAsPristine();
  this.missingPermanentArr.markAsUntouched();

  if (val === false) {
    while (this.missingTeethArr.length) this.missingTeethArr.removeAt(0);
    while (this.missingPermanentArr.length) this.missingPermanentArr.removeAt(0);
  }

  this.missingTeethArr.updateValueAndValidity({ emitEvent: false });
  this.missingPermanentArr.updateValueAndValidity({ emitEvent: false });
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
  this.missingPermanentArr.updateValueAndValidity({ emitEvent: false });
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
    this.missingTeethArr.updateValueAndValidity({ emitEvent: false });
  }

  get fillingsTeethArr(): FormArray<FormControl<string>> {
    return this.form.controls.fillingsTeeth;
  }

  get fillingsPermanentArr(): FormArray<FormControl<string>> {
    return this.form.controls.fillingsPermanent;
  }

 setFillingsQ(val: boolean) {
  this.form.controls.fillingsQ.setValue(val);
  this.setActive('fillingsQ');

  this.submitted.set(false);

  this.fillingsTeethArr.markAsPristine();
  this.fillingsTeethArr.markAsUntouched();
  this.fillingsPermanentArr.markAsPristine();
  this.fillingsPermanentArr.markAsUntouched();

  if (val === false) {
    while (this.fillingsTeethArr.length) this.fillingsTeethArr.removeAt(0);
    while (this.fillingsPermanentArr.length) this.fillingsPermanentArr.removeAt(0);
  }

    this.fillingsTeethArr.updateValueAndValidity({ emitEvent: false });
    this.fillingsPermanentArr.updateValueAndValidity({ emitEvent: false });
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
  this.fillingsPermanentArr.updateValueAndValidity({ emitEvent: false });
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
  this.fillingsTeethArr.updateValueAndValidity({ emitEvent: false });
  }

  get cariesTeethArr(): FormArray<FormControl<string>> {
    return this.form.controls.cariesTeeth;
  }

  get cariesPermanentArr(): FormArray<FormControl<string>> {
    return this.form.controls.cariesPermanent;
  }

  setCariesQ(val: boolean) {
    this.form.controls.cariesQ.setValue(val);
    this.setActive('cariesQ');

    this.submitted.set(false);

    this.cariesTeethArr.markAsPristine();
    this.cariesTeethArr.markAsUntouched();
    this.cariesPermanentArr.markAsPristine();
    this.cariesPermanentArr.markAsUntouched();

    if (val === false) {
      while (this.cariesTeethArr.length) this.cariesTeethArr.removeAt(0);
      while (this.cariesPermanentArr.length) this.cariesPermanentArr.removeAt(0);
    }

    this.cariesTeethArr.updateValueAndValidity({ emitEvent: false });
    this.cariesPermanentArr.updateValueAndValidity({ emitEvent: false });
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
    this.cariesPermanentArr.updateValueAndValidity({ emitEvent: false });
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
    this.cariesTeethArr.updateValueAndValidity({ emitEvent: false });
  }
  get rootTeethArr(): FormArray<FormControl<string>> {
    return this.form.controls.rootCanalTeeth;
  }

  get rootPermanentArr(): FormArray<FormControl<string>> {
    return this.form.controls.rootCanalPermanent;
  }

  setRootCanalQ(val: boolean) {
  this.form.controls.rootCanalQ.setValue(val);
  this.setActive('rootCanalQ');

  this.submitted.set(false);

  this.rootTeethArr.markAsPristine();
  this.rootTeethArr.markAsUntouched();
  this.rootPermanentArr.markAsPristine();
  this.rootPermanentArr.markAsUntouched();

  if (val === false) {
    while (this.rootTeethArr.length) this.rootTeethArr.removeAt(0);
    while (this.rootPermanentArr.length) this.rootPermanentArr.removeAt(0);
  }

    this.rootTeethArr.updateValueAndValidity({ emitEvent: false });
    this.rootPermanentArr.updateValueAndValidity({ emitEvent: false });
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
    this.rootPermanentArr.updateValueAndValidity({ emitEvent: false });
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
    this.rootTeethArr.updateValueAndValidity({ emitEvent: false });
  }
  setDentalTreatQ(val: boolean) {
    this.form.controls.dentalTreatQ.setValue(val);
    this.setActive('dentalTreatQ');

    const which = this.form.controls.dentalTreatWhich;

    if (val === true) {
      which.enable({ emitEvent: false });
      which.setValidators([requiredTrimmed()]);
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

  showMedicationDetails(): boolean {
    return this.form.controls.medication.value === true;
  }

  setMedication(value: boolean) {
    this.form.controls.medication.setValue(value);
    this.form.controls.medication.markAsTouched();
    this.form.controls.medication.updateValueAndValidity({ emitEvent: false });
    this.setActive('medication');

  if (value) {
    this.submitted.set(false);
    this.resetErrorsOnReopen('med');
    this.enableMedicationDetails();

    this.clearState(this.form.controls.medName);
    this.clearState(this.form.controls.medReason);
    this.clearState(this.form.controls.illnessesMed);
  } else {
    this.disableMedicationDetails();
  }

    this.form.updateValueAndValidity({ emitEvent: false });
  }

  private enableMedicationDetails() {
    this.form.controls.medName.enable({ emitEvent: false });
    this.form.controls.medReason.enable({ emitEvent: false });
    this.illnessesMed.enable({ emitEvent: false });

    this.form.controls.medName.setValidators([requiredTrimmed()]);
    this.form.controls.medReason.setValidators([requiredTrimmed()]);

    this.applyProviderValidators(this.illnessesMed, true);

    this.form.controls.medName.updateValueAndValidity({ emitEvent: false });
    this.form.controls.medReason.updateValueAndValidity({ emitEvent: false });
    this.illnessesMed.updateValueAndValidity({ emitEvent: false });
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

    this.clearState(this.form.controls.medName);
    this.clearState(this.form.controls.medReason);
    this.clearState(this.form.controls.illnessesMed);

    this.addAttemptMed.set(false);
    this.submitted.set(false);

    this.form.controls.medName.updateValueAndValidity({ emitEvent: false });
    this.form.controls.medReason.updateValueAndValidity({ emitEvent: false });
    this.illnessesMed.updateValueAndValidity({ emitEvent: false });
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

  removeMedIllnessByRef(g: IllnessForm) {
    if (this.illnessesMed.disabled) return;
    this.removeIllnessByRef(this.illnessesMed, g);
  }

  setMedBool(i: number, key: 'operated' | 'treatmentDone', val: boolean) {
    if (this.illnessesMed.disabled) return;

    this.setActive(this.medActiveKey(i, key));

    const c = this.illnessCtrl(this.illnessesMed, i, key);
    c.setValue(val);
    c.markAsDirty();
    c.updateValueAndValidity({ emitEvent: false });
  }

  showIllnessDetails(): boolean {
    return this.form.controls.illnessQ.value === true;
  }

  setIllnessQ(value: boolean) {
  this.form.controls.illnessQ.setValue(value, { emitEvent: false });
  this.form.controls.illnessQ.markAsTouched();

  if (value === true) {
    this.enableIllnessDetails();
  } else {
    this.disableIllnessDetails();
  }

    this.form.controls.illnessQ.updateValueAndValidity({ emitEvent: false });
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  private enableIllnessDetails() {
    this.illnessesIll.enable({ emitEvent: false });
    this.applyProviderValidators(this.illnessesIll, true);

    this.illnessesIll.updateValueAndValidity({ emitEvent: false });
    this.form.controls.illnessQ.updateValueAndValidity({ emitEvent: false });
    this.form.updateValueAndValidity({ emitEvent: false });
  }
    private disableIllnessDetails() {
    this.resetIllnessArrayToOne(this.illnessesIll);
    this.applyProviderValidators(this.illnessesIll, false);
    this.illnessesIll.disable({ emitEvent: false });

    this.illnessesIll.updateValueAndValidity({ emitEvent: false });
    this.form.controls.illnessQ.updateValueAndValidity({ emitEvent: false });
    this.form.updateValueAndValidity({ emitEvent: false });

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

  removeIllIllnessByRef(g: IllnessForm) {
    if (this.illnessesIll.disabled) return;
    this.removeIllnessByRef(this.illnessesIll, g);
  }

  setIllBool(i: number, key: 'operated' | 'treatmentDone', val: boolean) {
    if (this.illnessesIll.disabled) return;

    this.setActive(this.illActiveKey(i, key));

    const c = this.illnessCtrl(this.illnessesIll, i, key);
    c.setValue(val);
    c.markAsDirty();
    c.updateValueAndValidity({ emitEvent: false });
  }

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
      this.form.controls[k].setValidators([requiredTrimmed()]);
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
    private requireAtLeastOneSelection(
    questionCtrl: FormControl<boolean | null>,
    primary: FormArray<FormControl<string>>,
    secondary?: FormArray<FormControl<string>>
  ) {
    if (questionCtrl.value !== true) {
      return null;
    }

    const hasPrimary = primary.length > 0;
    const hasSecondary = secondary ? secondary.length > 0 : false;

    return hasPrimary || hasSecondary ? null : { requiredSelection: true };
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

  removeOpsBItemByRef(g: IllnessForm) {
    if (this.opsBItems.disabled) return;
    this.removeIllnessByRef(this.opsBItems, g);
  }

  setOpsBBool(i: number, key: 'operated' | 'treatmentDone', val: boolean) {
    if (this.opsBItems.disabled) return;

    this.setActive(this.opsBActiveKey(i, key));

    const c = this.illnessCtrl(this.opsBItems, i, key);
    c.setValue(val);
    c.markAsDirty();
    c.updateValueAndValidity({ emitEvent: false });
  }

  setFutureTeethDisease(value: boolean) {
    this.form.controls.futureTeethDisease.setValue(value);
    this.form.controls.futureTeethDisease.markAsDirty();
    this.form.controls.futureTeethDisease.markAsTouched();
    this.form.controls.futureTeethDisease.updateValueAndValidity({ emitEvent: false });
    this.setActive('futureTeethDisease');

    const note = this.form.controls.futureTeethDiseaseNote;

    if (value === true) {
      note.enable({ emitEvent: false });
      note.setValidators([requiredTrimmed()]);
      note.markAsPristine();
      note.markAsUntouched();
    } else {
      note.reset('', { emitEvent: false });
      note.clearValidators();
      note.disable({ emitEvent: false });
      note.markAsPristine();
      note.markAsUntouched();
    }

    note.updateValueAndValidity({ emitEvent: false });
    this.submitted.set(false);
  }


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

    this.submitted.set(false);

    const i = arr.length - 1;
    requestAnimationFrame(() => {
      const key = kind === 'med' ? this.medActiveKey(i, 'desc') : this.illActiveKey(i, 'desc');
      this.setActive(key);
    });
  }

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

  private isPdfFile(file: File) {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  }

  onReportPicked(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) return;

    if (file.type !== 'application/pdf') {
      this.form.controls.reportFile.setValue(null);
      this.form.controls.reportFile.markAsTouched();
      this.form.controls.reportFile.updateValueAndValidity({ emitEvent: false });
      this.selectedReportName.set('');
      this.hasNewReportFile = false;
      return;
    }

    this.form.controls.reportFile.setValue(file);
    this.form.controls.reportFile.markAsDirty();
    this.form.controls.reportFile.markAsTouched();
    this.form.controls.reportFile.updateValueAndValidity({ emitEvent: false });

    this.selectedReportName.set(file.name);
    this.hasNewReportFile = true;
    this.hasExistingReportFile = false;
  }

  onReportDragOver(e: DragEvent) {
    e.preventDefault();
    this.isReportDragOver.set(true);
  }

  onReportDragLeave(e: DragEvent) {
    e.preventDefault();
    this.isReportDragOver.set(false);
  }

 onReportDrop(event: DragEvent): void {
  event.preventDefault();
  this.isReportDragOver.set(false);

  const file = event.dataTransfer?.files?.[0]?? null;
  if (!file) return;

  if (file.type !== 'application/pdf') {
    this.form.controls.reportFile.setValue(null);
    this.form.controls.reportFile.markAsTouched();
    this.form.controls.reportFile.updateValueAndValidity({ emitEvent: false });
    this.selectedReportName.set('');
    this.hasNewReportFile = false;
    return;
  }

    this.form.controls.reportFile.setValue(file);
    this.form.controls.reportFile.markAsDirty();
    this.form.controls.reportFile.markAsTouched();
    this.form.controls.reportFile.updateValueAndValidity({ emitEvent: false });

    this.selectedReportName.set(file.name);
    this.hasNewReportFile = true;
  }
  //arrays per backend
  private buildAnswersArray(raw: any): Array<{ code: string; value: any }> {
    const answers: Array<{ code: string; value: any }> = [];

    const push = (code: string, value: any) => {
      if (value instanceof File) {
        answers.push({ code, value: value.name });
        return;
      }
      answers.push({ code, value });
    };

    push('missingTeeth', raw?.missingTeeth ?? []);
    push('missingPermanent', raw?.missingPermanent ?? []);
    push('fillingsTeeth', raw?.fillingsTeeth ?? []);
    push('fillingsPermanent', raw?.fillingsPermanent ?? []);
    push('cariesTeeth', raw?.cariesTeeth ?? []);
    push('cariesPermanent', raw?.cariesPermanent ?? []);
    push('rootCanalTeeth', raw?.rootCanalTeeth ?? []);
    push('rootCanalPermanent', raw?.rootCanalPermanent ?? []);

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

    onWeiter() {
      this.submitted.set(true);

      this.markEnabledAsTouched(this.form);
      this.form.updateValueAndValidity({ emitEvent: false });

      if (this.form.invalid) {
        this.scrollToFirstError();
        return;
        
      }

      const payload = this.buildHealthDeclarationPayload();
      console.log('FINAL JSON PAYLOAD:', structuredClone(payload));

      this.isFinished.set(true);
    }
  onWeiterClick() {
  const payload = this.buildHealthDeclarationPayload();

    const request$ =
  this.isEditMode && this.editId
    ? this.medicalFormService.updateMedicalForm(this.editId, payload)
    : this.medicalFormService.addMedicalForm(payload);

    request$.subscribe({
      next: (response) => {
        console.log(this.isEditMode ? 'Updated successfully:' : 'Saved successfully:', response);

        const savedId = response?.id ?? this.editId;

        if (savedId == null) {
          console.error('Missing saved id for report upload');
          return;
        }

        this.uploadReportIfNeeded(savedId, () => {
          this.editFormState.clear();
          this.isFinished.set(true);

          setTimeout(() => {
            this.router.navigate(['/preview']);
          }, 3000);
        });
      },
      error: (error) => {
        console.error(this.isEditMode ? 'Update failed:' : 'Save failed:', error);
      }
    });
  }

  scrollToFirstError() {
    setTimeout(() => {
      const el = document.querySelector(
        '.is-invalid input, ' +
        '.is-invalid textarea, ' +
        '.is-invalid button, ' +
        '.upload.is-invalid input, ' +
        '.upload.is-invalid button, ' +
        '[aria-invalid="true"]'
      ) as HTMLElement | null;

      if (!el) return;

      el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      const focusTarget =
        el.matches('input,textarea,button')
          ? el
          : (el.querySelector('input,textarea,button') as HTMLElement | null);

      focusTarget?.focus();
    }, 0);
  }

    scrollToStepBody(step: number) {
    this.goToStep(step);

    setTimeout(() => {
      const el = document.querySelector(`[data-step-body="${step}"]`);
      if (!el) return;

      const yOffset = -80;
      const y =
        (el as HTMLElement).getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;

      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }, 300); 
  }
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

