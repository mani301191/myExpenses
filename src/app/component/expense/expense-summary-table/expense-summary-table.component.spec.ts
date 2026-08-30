import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { ExpenseSummaryTableComponent } from './expense-summary-table.component';
import { CommonService } from '../../../service/common.service';

describe('ExpenseSummaryTableComponent', () => {
  let component: ExpenseSummaryTableComponent;
  let fixture: ComponentFixture<ExpenseSummaryTableComponent>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let router: Router;

  const summaryRows = () => [
    { year: 2025, month: 'January', income: 5000, expense: 3000, savings: 2000, estimated: 2500 },
    { year: 2025, month: 'February', income: 5000, expense: 4000, savings: 1000, estimated: 2500 },
    { year: 2026, month: 'January', income: 6000, expense: 5500, savings: 500, estimated: 6000 }
  ];

  beforeEach(async () => {
    commonServiceSpy = jasmine.createSpyObj('CommonService', ['fetchSummaryData']);
    commonServiceSpy.fetchSummaryData.and.returnValue(of(summaryRows() as any) as any);

    await TestBed.configureTestingModule({
      imports: [ExpenseSummaryTableComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        provideRouter([]),
        { provide: CommonService, useValue: commonServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseSummaryTableComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('fetchSummaryData', () => {
    it('should populate the table and chart on init', () => {
      expect(commonServiceSpy.fetchSummaryData).toHaveBeenCalled();
      expect(component.dataSource).toBeDefined();
      expect(component.dataSource.data.length).toBe(3);
      expect(component.chartOptions).toBeDefined();
    });
  });

  describe('navigation', () => {
    it('openYearComponent should navigate to /year/:year', () => {
      component.openYearComponent(2026);
      expect(router.navigate).toHaveBeenCalledWith(['/year', 2026]);
    });

    it('openMonthComponent should navigate to /month/:month/:year', () => {
      component.openMonthComponent('March', 2026);
      expect(router.navigate).toHaveBeenCalledWith(['/month', 'March', 2026]);
    });
  });

  describe('closeDatePicker', () => {
    it('should update selectedDate, close the picker and refetch', () => {
      const dp = jasmine.createSpyObj('dp', ['close']);
      const date = new Date(2026, 5, 1);
      commonServiceSpy.fetchSummaryData.calls.reset();
      component.closeDatePicker(date, dp);
      expect(component.selectedDate).toBe(date);
      expect(dp.close).toHaveBeenCalled();
      expect(commonServiceSpy.fetchSummaryData).toHaveBeenCalledWith(date);
    });
  });

  describe('applyFilter', () => {
    it('should set the filter on the data source', () => {
      component.applyFilter({ target: { value: 'JANUARY' } } as any);
      expect(component.dataSource.filter).toBe('january');
    });
  });

  describe('chartData', () => {
    it('should build estimate and expense series from the data', () => {
      component.chartData(summaryRows() as any);
      expect(component.chartOptions).toBeDefined();
      expect(component.chartOptions.data.length).toBe(2);
      expect(component.chartOptions.data[0].dataPoints).toEqual(summaryRows().map(x => ({ label: x.month, y: x.estimated })));
      expect(component.chartOptions.data[1].dataPoints).toEqual(summaryRows().map(x => ({ label: x.month, y: x.expense })));
    });
  });
});