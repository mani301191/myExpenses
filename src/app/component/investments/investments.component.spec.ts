import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { InvestmentsComponent } from './investments.component';
import { InvestmentService } from '../../service/investment.service';

describe('InvestmentsComponent', () => {
  let component: InvestmentsComponent;
  let fixture: ComponentFixture<InvestmentsComponent>;
  let investmentServiceSpy: jasmine.SpyObj<InvestmentService>;

  beforeEach(async () => {
    investmentServiceSpy = jasmine.createSpyObj('InvestmentService', [
      'fetchInvestmentData',
      'fetchInvestmentDropdownData',
      'fetchInvestmentStatusDropdownData',
      'saveInvestmentData',
      'updateInvestmentStatus',
      'deleteRow'
    ]);
    investmentServiceSpy.fetchInvestmentData.and.returnValue(
      of([
        { investment: 'PPF', investmentDetail: 'ACC', vendorAccountNumber: 'V1', nominee: 'A', status: 'Active' },
        { investment: 'Shares', investmentDetail: 'RELIANCE', vendorAccountNumber: 'V2', nominee: 'B', status: 'Inactive' }
      ] as any)
    );
    investmentServiceSpy.fetchInvestmentDropdownData.and.returnValue(
      of([{ id: '1', value: 'PPF' }, { id: '2', value: 'FD' }])
    );
    investmentServiceSpy.fetchInvestmentStatusDropdownData.and.returnValue(
      of([{ id: '1', value: 'Active' }, { id: '2', value: 'Inactive' }])
    );

    await TestBed.configureTestingModule({
      imports: [InvestmentsComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
        { provide: InvestmentService, useValue: investmentServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvestmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('fetchInvestmentData', () => {
    it('should load the investment rows on init', () => {
      expect(component.dataSource.data.length).toBe(2);
    });

    it('should load the dropdown data on init', () => {
      expect(component.investmentsList.length).toBe(2);
      expect(component.investStatusList.length).toBe(2);
    });

    it('should keep only active investments in activeInvestmentData', () => {
      expect(component.activeInvestmentData.length).toBe(1);
      expect(component.activeInvestmentData[0].investment).toBe('PPF');
    });
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
    it('should save a valid form, refresh the table and clear the form', () => {
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
      expect(investmentServiceSpy.fetchInvestmentData).toHaveBeenCalledTimes(2);
      expect(component.formGroup.get('investment')!.value).toBeNull();
    });

    it('should not save an invalid form', () => {
      component.onSubmit(component.formGroup.value);
      expect(investmentServiceSpy.saveInvestmentData).not.toHaveBeenCalled();
    });
  });

  describe('deleteRow', () => {
    it('should delegate to the service', () => {
      const row: any = { vendorAccountNumber: 'V1' };
      component.deleteRow(row);
      expect(investmentServiceSpy.deleteRow).toHaveBeenCalledWith(row);
    });
  });

  describe('row editing', () => {
    it('enableEdit should flag the row as editing', () => {
      const row: any = { vendorAccountNumber: 'V1' };
      component.enableEdit(row);
      expect(row.isEditing).toBeTrue();
    });

    it('updateRecord should unflag the row and call the service', () => {
      const row: any = { vendorAccountNumber: 'V1' };
      component.updateRecord(row);
      expect(row.isEditing).toBeFalse();
      expect(investmentServiceSpy.updateInvestmentStatus).toHaveBeenCalledWith(row);
    });
  });

  describe('applyFilter', () => {
    it('should set the table filter', () => {
      component.applyFilter({ target: { value: 'PPF' } } as any);
      expect(component.dataSource.filter).toBe('ppf');
    });
  });
});