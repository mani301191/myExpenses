import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { MonthlyIncomeComponent } from './monthly-income.component';
import { CommonService } from '../../service/common.service';

describe('MonthlyIncomeComponent', () => {
  let component: MonthlyIncomeComponent;
  let fixture: ComponentFixture<MonthlyIncomeComponent>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;

  beforeEach(async () => {
    commonServiceSpy = jasmine.createSpyObj('CommonService', [
      'fetchIncomeData',
      'fetchExpenseData',
      'fetchEstimateData',
      'plannedExpenseStatus',
      'deleteIncomeRecord'
    ]);
    commonServiceSpy.fetchIncomeData.and.returnValue(
      of([
        { incomeDate: new Date('2026-03-01'), source: 'Salary', amount: 5000 },
        { incomeDate: new Date('2026-03-15'), source: 'Bonus', amount: 1000 }
      ])
    );
    commonServiceSpy.fetchExpenseData.and.returnValue(
      of([
        { amount: 1000, expenseType: 'Planned' },
        { amount: 2000, expenseType: 'UnPlanned' },
        { amount: 500, expenseType: 'Investment' },
        { amount: 600, expenseType: 'Planned' },
        { amount: 700, expenseType: 'UnPlanned' },
        { amount: 900, expenseType: 'Planned' }
      ] as any)
    );
    commonServiceSpy.fetchEstimateData.and.returnValue(
      of([{ date: new Date('2026-03-01'), description: 'Budget', amount: 6000 }]) as any
    );
    commonServiceSpy.plannedExpenseStatus.and.returnValue(of([]) as any);

    await TestBed.configureTestingModule({
      imports: [MonthlyIncomeComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ month: 'March', year: '2026' }) } } },
        { provide: CommonService, useValue: commonServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyIncomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should derive selectedDate from the route params', () => {
    expect(component.selectedDate.getFullYear()).toBe(2026);
    expect(component.selectedDate.getMonth()).toBe(2);
  });

  describe('initIncomeData', () => {
    it('should compute total income and savings', () => {
      expect(component.totalIncome).toBe(6000);
      expect(component.savings).toBe(component.totalIncome - component.totalExpense);
    });
  });

  describe('topExpenseData', () => {
    it('should keep the top 5 expenses sorted by amount descending', () => {
      expect(component.expenseData.length).toBe(5);
      expect(component.expenseData[0].amount).toBe(2000);
      expect(component.expenseData[4].amount).toBe(600);
    });

    it('should total the expenses and split them by type', () => {
      expect(component.totalExpense).toBe(5700);
      expect(component.plannedExpense).toBe(2500);
      expect(component.unPlannedExpense).toBe(2700);
      expect(component.investmentExpense).toBe(500);
    });
  });

  describe('estimateData', () => {
    it('should sum the monthly estimate', () => {
      expect(component.estimate).toBe(6000);
    });

    it('should reset the estimate to zero for an empty response', () => {
      commonServiceSpy.fetchEstimateData.and.returnValue(of([]) as any);
      component.estimateData();
      expect(component.estimate).toBe(0);
    });
  });

  describe('setMessage', () => {
    it('should set progress as expense/estimate percentage', () => {
      expect(component.progress).toBeCloseTo(95, 1);
    });

    it('should keep progress at zero when there is no expense', () => {
      component.totalExpense = 0;
      component.estimate = 6000;
      component.setMessage();
      expect(component.progress).toBe(0);
    });
  });

  describe('updateColor', () => {
    it('should return primary below 80%', () => {
      expect(component.updateColor(79)).toBe('primary');
    });

    it('should return warn between 80% and 100% inclusive', () => {
      expect(component.updateColor(80)).toBe('warn');
      expect(component.updateColor(100)).toBe('warn');
    });

    it('should return accent above 100%', () => {
      expect(component.updateColor(101)).toBe('accent');
    });
  });

  describe('deleteIncome', () => {
    it('should delegate to the service', () => {
      const row: any = { incomeId: 3 };
      component.deleteRow(row);
      expect(commonServiceSpy.deleteIncomeRecord).toHaveBeenCalledWith(row);
    });
  });
});