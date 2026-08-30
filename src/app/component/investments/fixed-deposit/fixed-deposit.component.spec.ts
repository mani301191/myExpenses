import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { FixedDepositComponent } from './fixed-deposit.component';
import { InvestmentService } from '../../../service/investment.service';

describe('FixedDepositComponent', () => {
  let component: FixedDepositComponent;
  let fixture: ComponentFixture<FixedDepositComponent>;
  let investmentServiceSpy: jasmine.SpyObj<InvestmentService>;

  beforeEach(async () => {
    investmentServiceSpy = jasmine.createSpyObj('InvestmentService', [
      'fetchFixedDeposits',
      'updateFixedDeposit',
      'saveFixedDeposit',
      'deleteFixedDeposit'
    ]);
    (investmentServiceSpy as any).fixedDeposit = of([
      { id: 1, bankName: 'SBI', accountNumber: '123', openedDate: '2024-01-01', maturityDate: '2026-01-01', interestRate: 7, nomineeName: 'A', depositAmount: 10000, expectedMaturityAmount: 11400 },
      { id: 2, bankName: 'HDFC', accountNumber: '456', openedDate: '2025-01-01', maturityDate: '2027-01-01', interestRate: 7, nomineeName: 'B', depositAmount: 20000, expectedMaturityAmount: 23000 }
    ] as any);

    await TestBed.configureTestingModule({
      imports: [FixedDepositComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
        { provide: InvestmentService, useValue: investmentServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FixedDepositComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load and sort fixed deposits by maturity date ascending', () => {
    expect(component.fixedDeposits.length).toBe(2);
    expect(component.fixedDeposits[0].bankName).toBe('SBI');
    expect(component.fixedDeposits[1].bankName).toBe('HDFC');
  });

  it('should expose the total deposit', () => {
    expect(component.totalDeposit).toBe(30000);
  });

  it('should expose the total current value based on the current value of each deposit', () => {
    expect(component.totalCurrentValue).toBe(
      component.fixedDeposits.reduce((sum, fd) => sum + component.calculateCurrentValue(fd), 0)
    );
  });

  describe('calculateMaturityAmount', () => {
    it('should compute simple interest over one year', () => {
      // 2023 -> 2024 avoids the leap day
      expect(component.calculateMaturityAmount(10000, 10, '2023-01-01', '2024-01-01')).toBe(11000);
    });

    it('should compute simple interest over multiple years', () => {
      // 10000 at 7% for 2 years (2022 -> 2024)
      expect(component.calculateMaturityAmount(10000, 7, '2022-01-01', '2024-01-01')).toBe(11400);
    });
  });

  describe('calculateCurrentValue', () => {
    it('should return the deposit amount when the maturity precedes the opening date', () => {
      const fd: any = { openedDate: '2024-01-01', maturityDate: '2023-01-01', depositAmount: 100, expectedMaturityAmount: 200 };
      expect(component.calculateCurrentValue(fd)).toBe(100);
    });

    it('should return the full expected maturity for fully matured deposits', () => {
      const fd: any = { openedDate: '2024-01-01', maturityDate: '2025-01-01', depositAmount: 100, expectedMaturityAmount: 200 };
      expect(component.calculateCurrentValue(fd)).toBe(200);
    });

    it('should return a value between deposit and maturity for an ongoing deposit', () => {
      const fd: any = { openedDate: '2024-01-01', maturityDate: '2030-01-01', depositAmount: 100, expectedMaturityAmount: 200 };
      const value = component.calculateCurrentValue(fd);
      expect(value).toBeGreaterThan(fd.depositAmount);
      expect(value).toBeLessThan(fd.expectedMaturityAmount);
    });

    it('should not exceed the maturity value once elapsed', () => {
      const fd: any = { openedDate: '2024-01-01', maturityDate: '2025-01-01', depositAmount: 100, expectedMaturityAmount: 200 };
      expect(component.calculateCurrentValue(fd)).toBeLessThan(fd.expectedMaturityAmount * 2);
    });
  });

  describe('dateRangeValidator', () => {
    it('should accept a maturity date after the opening date', () => {
      component.fdForm.patchValue({ openedDate: '2026-12-01', maturityDate: '2027-01-01' });
      component.fdForm.updateValueAndValidity();
      expect(component.fdForm.get('maturityDate')!.hasError('dateRangeInvalid')).toBeFalse();
    });

    it('should flag a maturity date before the opening date', () => {
      component.fdForm.patchValue({ openedDate: '2026-12-01', maturityDate: '2026-06-01' });
      component.fdForm.updateValueAndValidity();
      expect(component.fdForm.get('maturityDate')!.hasError('dateRangeInvalid')).toBeTrue();
    });

    it('should clear the range error once the maturity date moves after the opening date', () => {
      component.fdForm.patchValue({ openedDate: '2026-12-01', maturityDate: '2026-06-01' });
      component.fdForm.updateValueAndValidity();
      expect(component.fdForm.get('maturityDate')!.hasError('dateRangeInvalid')).toBeTrue();

      component.fdForm.patchValue({ maturityDate: '2027-06-01' });
      component.fdForm.updateValueAndValidity();
      expect(component.fdForm.get('maturityDate')!.hasError('dateRangeInvalid')).toBeFalse();
    });

    it('should not mark anything invalid when dates are empty', () => {
      component.fdForm.updateValueAndValidity();
      expect(component.fdForm.get('maturityDate')!.errors).toBeNull();
    });
  });

  describe('editFD', () => {
    it('should set the editing id and populate the form with the deposit', () => {
      const fd = component.fixedDeposits[0];
      component.editFD(fd);
      expect(component.editingId).toBe(fd.id);
      expect(component.fdForm.get('bankName')!.value).toBe('SBI');
      expect(component.fdForm.get('depositAmount')!.value).toBe(10000);
    });
  });

  describe('saveFD', () => {
    it('should create a new deposit with the computed maturity amount', () => {
      component.fdForm.setValue({
        bankName: 'PNB',
        accountNumber: '789',
        openedDate: '2022-01-01',
        maturityDate: '2024-01-01',
        interestRate: 7,
        nomineeName: 'C',
        depositAmount: 10000
      });
      component.saveFD();

      expect(investmentServiceSpy.saveFixedDeposit).toHaveBeenCalledWith(
        jasmine.objectContaining({ bankName: 'PNB', expectedMaturityAmount: 11400 })
      );
      expect(component.editingId).toBeNull();
    });

    it('should update an existing deposit when editing', () => {
      component.editingId = 5;
      component.fdForm.setValue({
        bankName: 'HDFC',
        accountNumber: '999',
        openedDate: '2022-01-01',
        maturityDate: '2024-01-01',
        interestRate: 7,
        nomineeName: 'B',
        depositAmount: 20000
      });
      component.saveFD();

      expect(investmentServiceSpy.updateFixedDeposit).toHaveBeenCalledWith(
        jasmine.objectContaining({ id: 5, bankName: 'HDFC', expectedMaturityAmount: 22800 })
      );
    });

    it('should do nothing when the form is invalid', () => {
      component.saveFD();
      expect(investmentServiceSpy.saveFixedDeposit).not.toHaveBeenCalled();
      expect(investmentServiceSpy.updateFixedDeposit).not.toHaveBeenCalled();
    });
  });

  describe('deleteFD', () => {
    it('should delegate to the service', () => {
      component.deleteFD(3);
      expect(investmentServiceSpy.deleteFixedDeposit).toHaveBeenCalledWith({ id: 3 });
    });
  });

  describe('cancelEdit', () => {
    it('should clear the editing state and reset the form', () => {
      component.editingId = 4;
      component.cancelEdit();
      expect(component.editingId).toBeNull();
      expect(component.fdForm.get('bankName')!.value).toBeNull();
    });
  });
});