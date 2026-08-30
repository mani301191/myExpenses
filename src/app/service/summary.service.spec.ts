import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { SummaryService } from './summary.service';

describe('SummaryService', () => {
  let service: SummaryService;
  let httpMock: HttpTestingController;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const baseUrl = 'http://localhost:8003/api/';

  beforeEach(() => {
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: snackBar }
      ]
    });
    service = TestBed.inject(SummaryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('fetchDashboardData should GET summary and push data to the observable', () => {
    const expected: any = {
      expenseTrackingData: {
        income: 1000,
        estimate: 800,
        expense: 600,
        currentMonth: 'April'
      },
      fitnessData: [{ personName: 'John' }],
      insuranceData: [{ policy: 'A' }],
      assetData: [{ asset: 'House' }],
      dayWiseExpenses: [{ day: '01', amount: 50 }]
    };

    let result: any;
    service.fetchDashboardData().subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'summary' &&
      r.method === 'GET'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.dashboardDataResponse.getValue()).toEqual(expected as any);
  });

  it('fetchDashboardData should display error message on failure', () => {
    service.fetchDashboardData().subscribe();

    const req = httpMock.expectOne(baseUrl + 'summary');
    req.flush('Server Error', { status: 500, statusText: 'Error' });

    expect(snackBar.open).toHaveBeenCalledWith('Error Occured, Contact System Admin', 'dismiss', jasmine.any(Object));
  });
});