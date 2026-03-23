import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

type PreviewItem = {
  label: string;
  value: any;
};

type PreviewSection = {
  title: string;
  items: PreviewItem[];
};

@Component({
  selector: 'app-preview-details-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview-details-page.html',
  styleUrl: './preview-details-page.scss'
})
export class PreviewDetailsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  form: any = null;
  parsedQuestions: any = null;
  error = '';
  sections: PreviewSection[] = [];

  ngOnInit(): void {
    const resolvedForm = this.route.snapshot.data['form'];

    if (!resolvedForm) {
      this.error = 'Gabim gjatë marrjes së rekordit.';
      return;
    }

    this.form = resolvedForm;

    try {
      const rawData =
        this.form?.healthDeclarationJson ??
        this.form?.HealthDeclarationJson;

      let parsedJson: any = null;

      if (typeof rawData === 'string' && rawData.trim() !== '') {
        parsedJson = JSON.parse(rawData);
      } else if (typeof rawData === 'object' && rawData !== null) {
        parsedJson = rawData;
      }

      this.parsedQuestions =
        parsedJson?.healthDeclarationQuestions ??
        parsedJson?.HealthDeclarationQuestions ??
        parsedJson ??
        null;

      if (!this.parsedQuestions) {
        this.error = 'Nuk u gjetën të dhënat e formularit për këtë rekord.';
        this.sections = [];
        return;
      }

      this.sections = this.buildPreviewSections();

      console.log('FORM:', this.form);
      console.log('RAW DATA:', rawData);
      console.log('PARSED JSON:', parsedJson);
      console.log('PARSED QUESTIONS:', this.parsedQuestions);
    } catch (e) {
      console.error('JSON parse error:', e);
      this.error = 'Gabim gjatë leximit të të dhënave.';
      this.sections = [];
    }
  }

  buildPreviewSections(): PreviewSection[] {
    const q = this.parsedQuestions;
    if (!q) return [];

    const sections: PreviewSection[] = [
      {
        title: 'General Information',
        items: this.buildItems([
          ['Record ID', this.form?.id],
          ['Created At', this.form?.createdAt],
          ['Updated At', this.form?.updatedAt],
          ['Height (cm)', q.step1?.heightCm],
          ['Weight (kg)', q.step1?.weightKg]
        ])
      },
      {
        title: 'Medication',
        items: this.buildItems([
          ['Medication', q.step2?.medication],
          ['Medication Name', q.step2?.medName],
          ['Medication Reason', q.step2?.medReason],
          ['Illnesses Med', q.step2?.illnessesMed]
        ])
      },
      {
        title: 'Illnesses',
        items: this.buildItems([
          ['Illness Question', q.step3?.illnessQ],
          ['Illnesses Ill', q.step3?.illnessesIll]
        ])
      },
      {
        title: 'Operations',
        items: this.buildItems([
          ['Operations Question', q.step4?.opsQ],
          ['Ops A', q.step4?.opsA],
          ['Ops B', q.step4?.opsB],
          ['Ops C', q.step4?.opsC],
          ['Ops D', q.step4?.opsD],
          ['OpsB Items', q.step4?.opsBItems]
        ])
      },
      {
        title: 'Doctor Information',
        items: this.buildItems([
          ['Doctor First Name', q.step5?.doctorFirstName],
          ['Doctor Last Name', q.step5?.doctorLastName],
          ['Doctor Street', q.step5?.doctorStreet],
          ['Doctor Number', q.step5?.doctorNumber],
          ['Doctor City', q.step5?.doctorCity]
        ])
      },
      {
        title: 'Documents',
        items: this.buildItems([
          ['Report File', q.step6?.reportFile]
        ])
      },
      {
        title: 'Dental Overview',
        items: this.buildItems([
          ['Teeth Condition', q.step7?.teethCondition],
          ['Teeth Condition Note', q.step7?.teethConditionNote],
          ['Hygiene', q.step8?.hygiene],
          ['Occlusion', q.step9?.occlusion],
          ['Crowns Condition', q.step10?.crownsCondition],
          ['Crowns Note', q.step10?.crownsNote],
          ['Bridges Condition', q.step11?.bridgesCondition],
          ['Bridges Note', q.step11?.bridgesNote],
          ['Partial Dentures Condition', q.step12?.partialDenturesCondition],
          ['Partial Dentures Note', q.step12?.partialDenturesNote],
          ['Dentition', q.step13?.dentition],
          ['Dentition Note', q.step13?.dentitionNote],
          ['Jaw', q.step14?.jaw],
          ['Jaw Note', q.step14?.jawNote],
          ['Future Teeth Disease', q.step15?.futureTeethDisease],
          ['Future Teeth Disease Note', q.step15?.futureTeethDiseaseNote]
        ])
      },
      {
        title: 'Teeth Details',
        items: this.buildItems([
          ['Missing Teeth Question', q.step16?.missingTeethQ],
          ['Missing Teeth', q.step16?.missingTeeth],
          ['Missing Permanent', q.step16?.missingPermanent],
          ['Fillings Question', q.step17?.fillingsQ],
          ['Fillings Teeth', q.step17?.fillingsTeeth],
          ['Fillings Permanent', q.step17?.fillingsPermanent],
          ['Caries Question', q.step18?.cariesQ],
          ['Caries Teeth', q.step18?.cariesTeeth],
          ['Caries Permanent', q.step18?.cariesPermanent],
          ['Root Canal Question', q.step19?.rootCanalQ],
          ['Root Canal Teeth', q.step19?.rootCanalTeeth],
          ['Root Canal Permanent', q.step19?.rootCanalPermanent]
        ])
      },
      {
        title: 'Treatment & Remarks',
        items: this.buildItems([
          ['Dental Treatment Question', q.step20?.dentalTreatQ],
          ['Dental Treatment Which', q.step20?.dentalTreatWhich],
          ['Last Radiography Date', q.step21?.lastRadiographyDate],
          ['Remarks', q.step22?.remarks]
        ])
      }
    ];

    return sections.filter(section => section.items.length > 0);
  }

  private buildItems(entries: [string, any][]): PreviewItem[] {
    return entries
      .filter(([_, value]) => this.hasDisplayValue(value))
      .map(([label, value]) => ({ label, value }));
  }

  hasDisplayValue(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (typeof value === 'number' || typeof value === 'boolean') return true;

    if (Array.isArray(value)) {
      return value.some(item => this.hasDisplayValue(item));
    }

    if (typeof value === 'object') {
      return Object.values(value).some(v => this.hasDisplayValue(v));
    }

    return false;
  }

  isSimpleValue(value: any): boolean {
    return (
      value === null ||
      value === undefined ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    );
  }

  isArrayValue(value: any): boolean {
    return Array.isArray(value);
  }

  isObjectValue(value: any): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  getObjectEntries(value: any): { key: string; value: any }[] {
    if (!this.isObjectValue(value)) return [];

    return Object.entries(value)
      .filter(([_, val]) => this.hasDisplayValue(val))
      .map(([key, val]) => ({ key, value: val }));
  }

  getArrayItems(value: any): any[] {
    if (!Array.isArray(value)) return [];
    return value.filter(item => this.hasDisplayValue(item));
  }

  formatValue(value: any): string {
    if (Array.isArray(value)) {
      const cleanValues = value.filter(item => this.hasDisplayValue(item));
      return cleanValues.length ? cleanValues.join(', ') : '';
    }

    if (typeof value === 'object' && value !== null) return '';
    if (value === true) return 'Yes';
    if (value === false) return 'No';
    if (value === null || value === undefined || value === '') return '';

    return String(value);
  }

  formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^./, char => char.toUpperCase());
  }

  formatDateTime(value: string | null | undefined): string {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('de-DE', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  }

  trackBySection(index: number, section: PreviewSection): string {
    return section.title;
  }

  trackByItem(index: number, item: PreviewItem): string {
    return item.label;
  }

  trackByArrayItem(index: number): number {
    return index;
  }

  trackByObjectEntry(index: number, entry: { key: string; value: any }): string {
    return entry.key;
  }

  goBack(): void {
    this.router.navigate(['/preview']);
  }
}