import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { ExpenseYearlyComponent } from './expense-yearly.component';
import { CommonService } from '../../../service/common.service';

describe('ExpenseYearlyComponent', () => {
  let component: ExpenseYearlyComponent;
  let fixture: ComponentFixture<ExpenseYearlyComponent>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;

  const yearlyData = () => [
    {
      year: 2026,
      expense: 1000,
      income: 5000,
      savings: 4000,
      estimated: 1200,
      category: [{ expenseType: 'Food', amount: 300 }]
    }
  ];

  const monthlyCategoryData = () => [
    { category: 'Food', January: 100, February: 200, March: 0, April: 0, May: 0, June: 0, July: 0, August: 0, September: 0, October: 0, November: 0, December: 0, total: 0 }
  ];

  beforeEach(async () => {
    commonServiceSpy = jasmine.createSpyObj('CommonService', [
      'fetchyearlyData',
      'fetchMonthlyExpByCatagory'
    ]);
    commonServiceSpy.fetchyearlyData.and.returnValue(of(yearlyData() as any) as any);
    commonServiceSpy.fetchMonthlyExpByCatagory.and.returnValue(of(monthlyCategoryData() as any) as any);

    await TestBed.configureTestingModule({
      imports: [ExpenseYearlyComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ year: '2026' }) } } },
        { provide: CommonService, useValue: commonServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseYearlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('loadBasedOnYear', () => {
    it('should set selectedDate to January of the given year and load data', () => {
      expect(commonServiceSpy.fetchyearlyData).toHaveBeenCalled();
      expect(component.selectedDate.getFullYear()).toBe(2026);
      expect(component.selectedDate.getMonth()).toBe(0);
      expect(component.dataSource).toBeDefined();
      expect(component.dataSource.data.length).toBe(1);
      expect(component.chartOptions).toBeDefined();
    });

    it('should load data with the current year when no year is provided', () => {
      commonServiceSpy.fetchyearlyData.calls.reset();
      component.loadBasedOnYear(null);
      expect(commonServiceSpy.fetchyearlyData).toHaveBeenCalledWith(null);
      expect(component.selectedDate.getFullYear()).toBe(new Date().getFullYear());
    });
  });

  describe('openYearComponent', () => {
    it('should reload data for the selected year', () => {
      commonServiceSpy.fetchyearlyData.calls.reset();
      component.openYearComponent(2024);
      expect(component.selectedDate.getFullYear()).toBe(2024);
      expect(commonServiceSpy.fetchyearlyData).toHaveBeenCalled();
    });
  });

  describe('closeDatePicker', () => {
    it('should update selectedDate, close the picker and reload', () => {
      const dp = jasmine.createSpyObj('dp', ['close']);
      const date = new Date(2025, 5, 1);
      commonServiceSpy.fetchyearlyData.calls.reset();
      component.closeDatePicker(date, dp);
      expect(component.selectedDate).toBe(date);
      expect(dp.close).toHaveBeenCalled();
      expect(commonServiceSpy.fetchyearlyData).toHaveBeenCalledWith(date);
    });
  });

  describe('toggleTable', () => {
    it('should load monthly category data with computed totals when expanded', () => {
      component.toggleTable();
      expect(component.showMonthlyTable).toBeTrue();
      expect(commonServiceSpy.fetchMonthlyExpByCatagory).toHaveBeenCalled();
      expect(component.monthlyDataSource).toBeDefined();
      expect(component.monthlyDataSource.data[0].total).toBe(300);
    });

    it('should collapse and reload the yearly summary when toggled off', () => {
      component.toggleTable();
      commonServiceSpy.fetchyearlyData.calls.reset();
      component.toggleTable();
      expect(component.showMonthlyTable).toBeFalse();
      expect(commonServiceSpy.fetchyearlyData).toHaveBeenCalledWith(null);
    });
  });

  describe('printYearlyData', () => {
    it('should log an error when no chart canvas is present', () => {
      spyOn(console, 'error');
      Array.from(document.getElementsByTagName('canvas')).forEach(c => c.remove());
      component.printYearlyData();
      expect(console.error).toHaveBeenCalledWith('Chart canvas not found!');
    });
  });
});