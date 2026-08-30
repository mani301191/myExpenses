import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, of } from 'rxjs';

import { HomeComponent } from './home.component';
import { CommonService } from '../../service/common.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let queryParamsSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    queryParamsSubject = new BehaviorSubject<any>({});

    const commonServiceMock = jasmine.createSpyObj('CommonService', [
      'fetchSummaryData',
      'fetchExpenseData',
      'plannedExpense',
      'dailySummary',
      'fetchIncomeData',
      'fetchEstimateData',
      'plannedExpenseStatus',
      'fetchyearlyData'
    ]);
    commonServiceMock.fetchSummaryData.and.returnValue(of([]));
    commonServiceMock.fetchExpenseData.and.returnValue(of([]));
    commonServiceMock.plannedExpense.and.returnValue(of([]));
    commonServiceMock.dailySummary.and.returnValue(of([]));
    commonServiceMock.fetchIncomeData.and.returnValue(of([]));
    commonServiceMock.fetchEstimateData.and.returnValue(of([]));
    commonServiceMock.plannedExpenseStatus.and.returnValue(of([]));
    commonServiceMock.fetchyearlyData.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [HomeComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { queryParams: queryParamsSubject.asObservable() } },
        { provide: CommonService, useValue: commonServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to the summary view', () => {
    expect(component.selectedView).toBe('summary');
  });

  it('should switch to the monthly view when view=monthly', () => {
    queryParamsSubject.next({ view: 'monthly' });
    expect(component.selectedView).toBe('monthly');
  });

  it('should switch to the yearly view when view=yearly', () => {
    queryParamsSubject.next({ view: 'yearly' });
    expect(component.selectedView).toBe('yearly');
  });

  it('should fall back to summary for an unsupported view value', () => {
    queryParamsSubject.next({ view: 'weekly' });
    expect(component.selectedView).toBe('summary');
  });

  it('should fall back to summary when no view param is present', () => {
    queryParamsSubject.next({});
    expect(component.selectedView).toBe('summary');
  });

  it('should keep the summary view selected when switching back', () => {
    queryParamsSubject.next({ view: 'yearly' });
    queryParamsSubject.next({ view: 'summary' });
    expect(component.selectedView).toBe('summary');
  });
});