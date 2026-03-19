import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { MedicalFormService } from './_service/medical-form.service';

export const medicalFormDetailsResolver: ResolveFn<any> = (route) => {
  const medicalFormService = inject(MedicalFormService);
  const id = Number(route.paramMap.get('id'));

  if (!id) {
    throw new Error('ID nuk u gjet.');
  }

  return medicalFormService.getMedicalFormById(id);
};

export const medicalFormsListResolver: ResolveFn<any> = () => {
  const medicalFormService = inject(MedicalFormService);
  return medicalFormService.getAllMedicalForms();
};