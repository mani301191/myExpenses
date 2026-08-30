import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { InsuranceComponent } from './insurance.component';
import { InsuranceService } from '../../service/insurance.service';

function toDmy(date: Date): string {
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  return `${day}/${month}/${date.getFullYear()}`;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

describe('InsuranceComponent', () => {
  let component: InsuranceComponent;
  let fixture: ComponentFixture<InsuranceComponent>;
  let insuranceServiceSpy: jasmine.SpyObj<InsuranceService>;

  beforeEach(async () => {
    const now = new Date();

    insuranceServiceSpy = jasmine.createSpyObj('InsuranceService', [
      'fetchInsuranceTypeDropdownData',
      'fetchInsuranceData',
      'saveInsuranceData',
      'deleteRow',
      'updateInsurance'
    ]);
    insuranceServiceSpy.fetchInsuranceTypeDropdownData.and.returnValue(
      of([{ id: 1, value: 'Health' }, { id: 2, value: 'Vehicle' }] as any)
    );
    insuranceServiceSpy.fetchInsuranceData.and.returnValue(
      of([
        { insuranceType: 'Health', insuranceProvider: 'Care', policyNumber: '1', endDate: toDmy(addDays(now, 30)) },
        { insuranceType: 'Vehicle', insuranceProvider: 'Acko', policyNumber: '2', endDate: toDmy(addDays(now, 90)) },
        { insuranceType: 'Health', insuranceProvider: 'HDFC', policyNumber: '3', endDate: toDmy(addDays(now, -60)) },
        { insuranceType: 'Term', insuranceProvider: 'LIC', policyNumber: '4', endDate: '' }
      ] as any)
    );

    await TestBed.configureTestingModule({
      imports: [InsuranceComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
        { provide: InsuranceService, useValue: insuranceServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('fetchInsuranceData', () => {
    it('should load the dropdown data on init', () => {
      expect(component.insuranceTypes.length).toBe(2);
      expect(component.insuranceTypes[0].value).toBe('Health');
    });

    it('should mark expired policies and sort them to the end', () => {
      expect(component.dataSource.data.length).toBe(4);
      expect(component.dataSource.data[0].policyNumber).toBe('1');
      expect(component.dataSource.data[3].policyNumber).toBe('3');
      expect((component.dataSource.data[3] as any).isPast).toBeTrue();
      expect((component.dataSource.data[2] as any).isPast).toBeFalsy();
    });

    it('should keep only active policies in activeInsuranceData', () => {
      expect(component.activeInsuranceData.length).toBe(2);
      expect(component.activeInsuranceData[0].policyNumber).toBe('1');
    });
  });

  describe('form validation', () => {
    it('should require the mandatory fields', () => {
      expect(component.formGroup.valid).toBeFalse();
      expect(component.formGroup.get('insuranceType')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.get('policyNumber')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.get('endDate')!.errors?.['required']).toBeTruthy();
    });

    it('should become valid once required fields are filled', () => {
      component.formGroup.setValue({
        insuranceType: 'Health',
        insuranceProvider: 'Care',
        policyNumber: 'P9',
        nominee: 'John',
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2027, 0, 1),
        additionalDetails: 'family'
      });
      expect(component.formGroup.valid).toBeTrue();
    });
  });

  describe('onSubmit', () => {
    it('should save a valid form and clear it', () => {
      const value = {
        insuranceType: 'Health',
        insuranceProvider: 'Care',
        policyNumber: 'P9',
        nominee: 'John',
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2027, 0, 1),
        additionalDetails: 'family'
      };
      component.formGroup.setValue(value);
      component.onSubmit(component.formGroup.value);
      expect(insuranceServiceSpy.saveInsuranceData).toHaveBeenCalledWith(value);
      expect(component.formGroup.get('policyNumber')!.value).toBeNull();
    });

    it('should not save an invalid form', () => {
      component.onSubmit(component.formGroup.value);
      expect(insuranceServiceSpy.saveInsuranceData).not.toHaveBeenCalled();
    });
  });

  describe('deleteRow', () => {
    it('should delegate to the service', () => {
      const row: any = { policyNumber: 'P9' };
      component.deleteRow(row);
      expect(insuranceServiceSpy.deleteRow).toHaveBeenCalledWith(row);
    });
  });

  describe('row editing', () => {
    it('enableEdit should flag the row as editing', () => {
      const row: any = { policyNumber: 'P9' };
      component.enableEdit(row);
      expect(row.isEditing).toBeTrue();
    });

    it('updateRecord should unflag the row and call the service', () => {
      const row: any = { policyNumber: 'P9' };
      component.updateRecord(row);
      expect(row.isEditing).toBeFalse();
      expect(insuranceServiceSpy.updateInsurance).toHaveBeenCalledWith(row);
    });
  });

  describe('applyFilter', () => {
    it('should set the table filter', () => {
      component.applyFilter({ target: { value: 'Care' } } as any);
      expect(component.dataSource.filter).toBe('care');
    });
  });
});