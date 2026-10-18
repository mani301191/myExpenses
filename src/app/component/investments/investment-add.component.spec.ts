import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { InvestmentAddComponent } from './investment-add.component';
import { InvestmentService } from '../../service/investment.service';

describe('InvestmentAddComponent', () => {
  let component: InvestmentAddComponent;
  let fixture: ComponentFixture<InvestmentAddComponent>;
  let investmentServiceSpy: jasmine.SpyObj<InvestmentService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<InvestmentAddComponent>>;

  beforeEach(async () => {
    investmentServiceSpy = jasmine.createSpyObj('InvestmentService', [
      'fetchInvestmentDropdownData',
      'fetchInvestmentStatusDropdownData',
      'saveInvestmentData'
    ]);
    investmentServiceSpy.fetchInvestmentDropdownData.and.returnValue(
      of([{ id: '1', value: 'PPF' }, { id: '2', value: 'FD' }] as any)
    );
    investmentServiceSpy.fetchInvestmentStatusDropdownData.and.returnValue(
      of([{ id: '1', value: 'Active' }, { id: '2', value: 'Inactive' }] as any)
    );

    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [InvestmentAddComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: InvestmentService, useValue: investmentServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestmentAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load both dropdowns on init', () => {
    expect(investmentServiceSpy.fetchInvestmentDropdownData).toHaveBeenCalledTimes(1);
    expect(investmentServiceSpy.fetchInvestmentStatusDropdownData).toHaveBeenCalledTimes(1);
    expect(component.investmentsList.length).toBe(2);
    expect(component.investStatusList.length).toBe(2);
  });

  describe('form validation', () => {
    it('should require the mandatory fields', () => {
      expect(component.formGroup.valid).toBeFalse();
      expect(component.formGroup.get('investment')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.get('vendorAccountNumber')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.get('status')!.errors?.['required']).toBeTruthy();
    });

    it('should become valid once required fields are filled', () => {
      component.formGroup.setValue({
        investment: 'PPF',
        investmentDetail: 'ACC',
        vendorAccountNumber: 'V9',
        nominee: 'John',
        status: 'Active',
        additionalDetails: 'notes'
      });
      expect(component.formGroup.valid).toBeTrue();
    });
  });

  describe('onSubmit', () => {
    it('should save a valid form and clear it', () => {
      const value = {
        investment: 'PPF',
        investmentDetail: 'ACC',
        vendorAccountNumber: 'V9',
        nominee: 'John',
        status: 'Active',
        additionalDetails: 'notes'
      };
      component.formGroup.setValue(value);
      component.onSubmit(component.formGroup.value);
      expect(investmentServiceSpy.saveInvestmentData).toHaveBeenCalledWith(value);
      expect(component.formGroup.get('investment')!.value).toBeNull();
    });

    it('should not save an invalid form', () => {
      component.onSubmit(component.formGroup.value);
      expect(investmentServiceSpy.saveInvestmentData).not.toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should reset the form', () => {
      component.formGroup.patchValue({ investmentDetail: 'ACC' });
      component.clear();
      expect(component.formGroup.get('investmentDetail')!.value).toBeNull();
    });
  });

  describe('close', () => {
    it('should close the dialog', () => {
      component.close();
      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });
});
