import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { InsuranceAddComponent } from './insurance-add.component';
import { InsuranceService } from '../../service/insurance.service';

describe('InsuranceAddComponent', () => {
  let component: InsuranceAddComponent;
  let fixture: ComponentFixture<InsuranceAddComponent>;
  let insuranceServiceSpy: jasmine.SpyObj<InsuranceService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<InsuranceAddComponent>>;

  beforeEach(async () => {
    insuranceServiceSpy = jasmine.createSpyObj('InsuranceService', [
      'fetchInsuranceTypeDropdownData',
      'saveInsuranceData'
    ]);
    insuranceServiceSpy.fetchInsuranceTypeDropdownData.and.returnValue(
      of([{ id: 1, value: 'Health' }, { id: 2, value: 'Vehicle' }] as any)
    );

    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [InsuranceAddComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: InsuranceService, useValue: insuranceServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsuranceAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the insurance types on init', () => {
    expect(insuranceServiceSpy.fetchInsuranceTypeDropdownData).toHaveBeenCalledTimes(1);
    expect(component.insuranceTypes.length).toBe(2);
  });

  describe('form validation', () => {
    it('should require the mandatory fields', () => {
      expect(component.formGroup.valid).toBeFalse();
      expect(component.formGroup.get('insuranceType')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.get('startDate')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.get('endDate')!.errors?.['required']).toBeTruthy();
    });

    it('should become valid once required fields are filled', () => {
      component.formGroup.setValue({
        insuranceType: 'Health',
        insuranceProvider: 'Care',
        policyNumber: 'P1',
        nominee: 'John',
        startDate: new Date(2026, 0, 1),
        endDate: new Date(2027, 0, 1),
        additionalDetails: 'notes'
      });
      expect(component.formGroup.valid).toBeTrue();
    });
  });

  describe('onSubmit', () => {
    it('should save a valid form and clear it', () => {
      const value = {
        insuranceType: 'Health',
        insuranceProvider: 'Care',
        policyNumber: 'P1',
        nominee: 'John',
        startDate: new Date(2026, 0, 1),
        endDate: new Date(2027, 0, 1),
        additionalDetails: 'notes'
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

  describe('close', () => {
    it('should close the dialog', () => {
      component.close();
      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });
});
