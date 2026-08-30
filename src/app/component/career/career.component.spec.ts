import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { CareerComponent } from './career.component';
import { CareerService } from '../../service/career.service';

function toDmy(date: Date): string {
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  return `${day}/${month}/${date.getFullYear()}`;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

describe('CareerComponent', () => {
  let component: CareerComponent;
  let fixture: ComponentFixture<CareerComponent>;
  let careerServiceSpy: jasmine.SpyObj<CareerService>;

  beforeEach(async () => {
    const now = new Date();
    const pastNth = 18;
    const nMy = 6;

    careerServiceSpy = jasmine.createSpyObj('CareerService', [
      'fetchCareerData',
      'saveCareerData',
      'deleteRow',
      'updateCareertDetail'
    ]);
    careerServiceSpy.fetchCareerData.and.returnValue(
      of([
        { recordType: 'Employment', orgName: 'Infosys', recordId: 'R1', designation: 'Engineer', startDate: toDmy(addMonths(now, -pastNth)), endDate: toDmy(addMonths(now, -nMy)), comments: 'first' },
        { recordType: 'Education', orgName: 'College', recordId: 'E1', designation: 'Student', startDate: toDmy(addMonths(now, -12 * 5)), endDate: toDmy(addMonths(now, -12 * 4)), comments: 'study' },
        { recordType: 'Employment', orgName: 'Wipro', recordId: 'R2', designation: 'Manager', startDate: toDmy(addMonths(now, -6)), endDate: '', comments: 'open-ended' }
      ] as any)
    );

    await TestBed.configureTestingModule({
      imports: [CareerComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
        { provide: CareerService, useValue: careerServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CareerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('fetchAppliancesData', () => {
    it('should load the career rows into the table', () => {
      expect(component.dataSource.data.length).toBe(3);
    });

    it('should keep only Employment records in employmentData, sorted by end date descending', () => {
      expect(component.employmentData.length).toBe(2);
      expect(component.employmentData[0].orgName).toBe('Wipro');
      expect(component.employmentData[1].orgName).toBe('Infosys');
    });
  });

  describe('form validation', () => {
    it('should require the mandatory fields', () => {
      expect(component.formGroup.valid).toBeFalse();
      expect(component.formGroup.get('recordType')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.get('orgName')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.get('recordId')!.errors?.['required']).toBeTruthy();
    });

    it('should become valid once all required fields are set', () => {
      component.formGroup.setValue({
        recordType: 'Employment',
        orgName: 'TCS',
        recordId: 'R3',
        designation: 'Lead',
        comments: 'x',
        startDate: new Date(2026, 0, 3),
        endDate: ''
      });
      expect(component.formGroup.valid).toBeTrue();
    });
  });

  describe('onSubmit', () => {
    it('should save a valid form and clear it', () => {
      const value = {
        recordType: 'Employment',
        orgName: 'TCS',
        recordId: 'R3',
        designation: 'Lead',
        comments: 'x',
        startDate: new Date(2026, 0, 3),
        endDate: ''
      };
      component.formGroup.setValue(value);
      component.onSubmit(component.formGroup.value);
      expect(careerServiceSpy.saveCareerData).toHaveBeenCalledWith(value);
      expect(component.formGroup.get('orgName')!.value).toBeNull();
    });

    it('should not save an invalid form', () => {
      component.onSubmit(component.formGroup.value);
      expect(careerServiceSpy.saveCareerData).not.toHaveBeenCalled();
    });
  });

  describe('deleteRow', () => {
    it('should delegate to the service', () => {
      const row: any = { recordId: 'R1' };
      component.deleteRow(row);
      expect(careerServiceSpy.deleteRow).toHaveBeenCalledWith(row);
    });
  });

  describe('calculateDuration', () => {
    it('should return zero years for same dates', () => {
      expect(component.calculateDuration('01/01/2024', '01/01/2026')).toBe('2 years, 0 months, 0 days');
    });

    it('should handle normal month/day differences', () => {
      expect(component.calculateDuration('01/01/2025', '26/02/2026')).toBe('1 years, 1 months, 25 days');
    });

    it('should borrow a month when days go negative', () => {
      expect(component.calculateDuration('15/03/2026', '12/06/2026')).toBe('0 years, 2 months, 28 days');
    });

    it('should default a missing end date to today', () => {
      const result = component.calculateDuration('15/06/2020', '');
      expect(result).toMatch(/^\d+ years, \d+ months, \d+ days$/);
    });
  });

  describe('row editing', () => {
    it('enableEdit should flag the row as editing', () => {
      const row: any = { orgName: 'Tata' };
      component.enableEdit(row);
      expect(row.isEditing).toBeTrue();
    });

    it('updateRecord should unflag the row and call the service', () => {
      const row: any = { orgName: 'Tata' };
      component.updateRecord(row);
      expect(row.isEditing).toBeFalse();
      expect(careerServiceSpy.updateCareertDetail).toHaveBeenCalledWith(row);
    });
  });

  describe('applyFilter', () => {
    it('should set the table filter', () => {
      component.applyFilter({ target: { value: 'Infosys' } } as any);
      expect(component.dataSource.filter).toBe('infosys');
    });
  });
});