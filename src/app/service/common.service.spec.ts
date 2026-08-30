import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CommonService } from './common.service';

describe('CommonService', () => {
  let service: CommonService;
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
    service = TestBed.inject(CommonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('fetchExpenseData should GET expenseDetails with month/year and push data', () => {
    const date = new Date(2024, 3, 15);
    const expected = [{ expenseId: 1, expenseType: 'Food' }];

    let result: any;
    service.fetchExpenseData(date).subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'expenseTracker/expenseDetails' &&
      r.params.get('month') === 'April' &&
      r.params.get('year') === '2024'
    );
    expect(req.request.method).toBe('GET');
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.expenseDataResponse.getValue()).toEqual(expected as any);
    expect(service.currentMonth).toBe('April');
    expect(service.year).toBe(2024);
  });

  it('fetchExpenseData should display error message on failure', () => {
    service.fetchExpenseData(new Date(2024, 3, 15));
    const req = httpMock.expectOne(r => r.url === baseUrl + 'expenseTracker/expenseDetails');
    req.flush('Server Error', { status: 500, statusText: 'Error' });

    expect(snackBar.open).toHaveBeenCalledWith('Error Occured, Contact System Admin', 'dismiss', jasmine.any(Object));
    expect(service.expenseDataResponse.getValue()).toEqual([]);
  });

  it('fetchIncomeData should GET incomeDetails with month/year and push data', () => {
    const date = new Date(2024, 10, 2);
    const expected = [{ incomeId: 7, incomeType: 'Salary' }];

    let result: any;
    service.fetchIncomeData(date).subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'incomeTracker/incomeDetails' &&
      r.params.get('month') === 'November' &&
      r.params.get('year') === '2024'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.incomeDataResponse.getValue()).toEqual(expected as any);
  });

  it('fetchEstimateData should GET monthlyTarget and push data', () => {
    const expected = { amount: 1000 };

    let result: any;
    service.fetchEstimateData(new Date(2024, 3, 15)).subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'monthlyTarget' &&
      r.params.get('month') === 'April' &&
      r.params.get('year') === '2024'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.estimateResponse.getValue()).toEqual(expected as any);
  });

  it('fetchSummaryData should GET monthlySummary with year and push data', () => {
    const expected = [{ month: 'April', amount: 500 }];

    let result: any;
    service.fetchSummaryData(new Date(2024, 3, 15)).subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'monthlySummary' &&
      r.params.get('year') === '2024'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.expenseSummaryResponse.getValue()).toEqual(expected as any);
  });

  it('fetchyearlyData should GET yearlySummary with year when a date is provided', () => {
    const expected = [{ year: 2024, amount: 2000 }];

    let result: any;
    service.fetchyearlyData(new Date(2024, 3, 15)).subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'yearlySummary' &&
      r.params.get('year') === '2024'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.expenseYearlyResponse.getValue()).toEqual(expected as any);
  });

  it('fetchyearlyData should GET yearlySummary without year when no date is provided', () => {
    let result: any;
    service.fetchyearlyData(undefined as any).subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'yearlySummary' &&
      r.params.get('year') === null
    );
    req.flush([]);

    expect(result).toEqual([]);
  });

  it('fetchMonthlyExpByCatagory should GET monthlyExpByCatagory with year', () => {
    const expected = [{ category: 'Food', spent: 100 }];

    let result: any;
    service.fetchMonthlyExpByCatagory(new Date(2024, 3, 15)).subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'monthlyExpByCatagory' &&
      r.params.get('year') === '2024'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.monthlyExpByCatagoryResp.getValue()).toEqual(expected as any);
  });

  it('addExpenseDetail should POST expenseDetail and push apiResponse', () => {
    let result: any;
    service.addExpenseDetail({ expenseType: 'Food', amount: 200 }).subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'expenseTracker/expenseDetail' &&
      r.method === 'POST'
    );
    req.flush({ expenseId: 42 });

    expect(result).toEqual({ expenseId: 42 });
    expect(snackBar.open).toHaveBeenCalledWith('Record added sucessfully - ID :42', jasmine.any(String), jasmine.any(Object));
  });

  it('addExpenseDetail should display error on failure', () => {
    service.addExpenseDetail({}).subscribe();

    const req = httpMock.expectOne(baseUrl + 'expenseTracker/expenseDetail');
    req.flush('err', { status: 500, statusText: 'Error' });

    expect(snackBar.open).toHaveBeenCalledWith('Error Occured, Contact System Admin', jasmine.any(String), jasmine.any(Object));
  });

  it('updateExpenseDetail should PATCH and refresh expense data', () => {
    service.selectedDate = new Date(2024, 3, 15);
    service.updateExpenseDetail({ expenseId: 1, amount: 300 });

    const patchReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'expenseTracker/expenseDetail' &&
      r.method === 'PATCH'
    );
    patchReq.flush({ message: 'Expense updated' });

    const fetchReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'expenseTracker/expenseDetails' &&
      r.params.get('month') === 'April' &&
      r.params.get('year') === '2024'
    );
    fetchReq.flush([{ expenseId: 1, amount: 300 }]);

    expect(snackBar.open).toHaveBeenCalledWith('Expense updated', jasmine.any(String), jasmine.any(Object));
    expect(service.expenseDataResponse.getValue()).toEqual([{ expenseId: 1, amount: 300 }] as any);
  });

  it('deleteRow should DELETE expenseDetail and refresh expense, status and estimate data', () => {
    service.selectedDate = new Date(2024, 3, 15);
    service.deleteRow({ expenseId: 9 });

    const delReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'expenseTracker/expenseDetail/9' &&
      r.method === 'DELETE'
    );
    delReq.flush({ message: 'Deleted' });

    const expReq = httpMock.expectOne(r => r.url === baseUrl + 'expenseTracker/expenseDetails');
    expReq.flush([]);

    const statusReq = httpMock.expectOne(r => r.url === baseUrl + 'monthlyStatus');
    statusReq.flush([]);

    const estReq = httpMock.expectOne(r => r.url === baseUrl + 'monthlyTarget');
    estReq.flush({});

    expect(snackBar.open).toHaveBeenCalledWith('Deleted', jasmine.any(String), jasmine.any(Object));
  });

  it('addIncomeDetail should POST incomeDetail and push apiResponse', () => {
    let result: any;
    service.addIncomeDetail({ incomeType: 'Salary', amount: 1000 }).subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'incomeTracker/incomeDetail' &&
      r.method === 'POST'
    );
    req.flush({ incomeId: 5 });

    expect(result).toEqual({ incomeId: 5 });
    expect(snackBar.open).toHaveBeenCalledWith('Record created Successfully, Id : 5', jasmine.any(String), jasmine.any(Object));
  });

  it('deleteIncomeRecord should DELETE incomeDetail and refresh income data', () => {
    service.selectedDate = new Date(2024, 3, 15);
    service.deleteIncomeRecord({ incomeId: 3 });

    const delReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'incomeTracker/incomeDetail/3' &&
      r.method === 'DELETE'
    );
    delReq.flush({ message: 'Income deleted' });

    const fetchReq = httpMock.expectOne(r => r.url === baseUrl + 'incomeTracker/incomeDetails');
    fetchReq.flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Income deleted', jasmine.any(String), jasmine.any(Object));
  });

  it('saveProfileData should POST profileDetail', () => {
    service.saveProfileData({ name: 'Test' });

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'profile/profileDetail' &&
      r.method === 'POST'
    );
    expect(req.request.body).toEqual({ name: 'Test' });
    req.flush({});

    expect(snackBar.open).toHaveBeenCalledWith('Profile Data created/Updated successfully', jasmine.any(String), jasmine.any(Object));
  });

  it('profileData should GET profileDetail and push data', () => {
    const expected = { name: 'Test', annualIncome: 5000 };

    let result: any;
    service.profileData().subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'profile/profileDetail' &&
      r.method === 'GET'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.profileDataResponse.getValue()).toEqual(expected as any);
  });

  it('saveEstimateData should POST monthlyTarget', () => {
    service.saveEstimateData({ amount: 1000 });

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'monthlyTarget' &&
      r.method === 'POST'
    );
    req.flush({});

    expect(snackBar.open).toHaveBeenCalledWith('Record created Successfully ', jasmine.any(String), jasmine.any(Object));
  });

  it('cloneEstimateData should GET monthlyTarget/clone and push estimate', () => {
    const expected = { amount: 5000 };

    let result: any;
    service.cloneEstimateData(new Date(2024, 3, 15)).subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'monthlyTarget/clone' &&
      r.params.get('month') === 'April' &&
      r.params.get('year') === '2024'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.estimateResponse.getValue()).toEqual(expected as any);
    expect(snackBar.open).toHaveBeenCalledWith('Record created Successfully ', jasmine.any(String), jasmine.any(Object));
  });

  it('deleteMonthlyTargetData should DELETE monthlyTarget and refresh estimate data', () => {
    service.selectedDate = new Date(2024, 3, 15);
    service.deleteMonthlyTargetData({ id: 4 });

    const delReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'monthlyTarget/4' &&
      r.method === 'DELETE'
    );
    delReq.flush({ message: 'Target deleted' });

    const estReq = httpMock.expectOne(r => r.url === baseUrl + 'monthlyTarget');
    estReq.flush({});

    expect(snackBar.open).toHaveBeenCalledWith('Target deleted', jasmine.any(String), jasmine.any(Object));
  });

  it('plannedExpense should GET plannedExpense with month/year', () => {
    const expected: any = [{ label: 'A', value: 1 }];

    let result: any;
    service.plannedExpense(new Date(2024, 3, 15)).subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'plannedExpense' &&
      r.params.get('month') === 'April' &&
      r.params.get('year') === '2024'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.dropdownDataResponse.getValue()).toEqual(expected as any);
  });

  it('plannedExpenseStatus should GET monthlyStatus with month/year', () => {
    const expected: any = [{ status: 'Planned' }];

    let result: any;
    service.plannedExpenseStatus(new Date(2024, 3, 15)).subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'monthlyStatus' &&
      r.params.get('month') === 'April' &&
      r.params.get('year') === '2024'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.expenseStatusResponse.getValue()).toEqual(expected as any);
  });

  it('dailySummary should GET dailySummary with month/year', () => {
    const expected: any = [{ day: '01', amount: 50 }];

    let result: any;
    service.dailySummary(new Date(2024, 3, 15)).subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'dailySummary' &&
      r.params.get('month') === 'April' &&
      r.params.get('year') === '2024'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.dailySummaryResponse.getValue()).toEqual(expected as any);
  });

  it('uploadStatement should POST file and refresh income/status data', () => {
    service.selectedDate = new Date(2024, 3, 15);
    const file = new File(['statement'], 'statement.pdf');

    let result: any;
    service.uploadStatement(file).subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'expenseTracker/uploadStatement' &&
      r.method === 'POST'
    );
    expect(req.request.body).toEqual(jasmine.any(FormData));
    req.flush('Uploaded successfully');

    const incomeReq = httpMock.expectOne(r => r.url === baseUrl + 'incomeTracker/incomeDetails');
    incomeReq.flush([]);

    const statusReq = httpMock.expectOne(r => r.url === baseUrl + 'monthlyStatus');
    statusReq.flush([]);

    expect(result).toEqual(['Uploaded successfully']);
    expect(service.uploadResponse.getValue()).toEqual(['Uploaded successfully']);
    expect(snackBar.open).toHaveBeenCalledWith('Uploaded successfully', jasmine.any(String), jasmine.any(Object));
  });

  it('uploadStatement should return null and warn when no file is provided', () => {
    const result = service.uploadStatement(null as any);
    expect(result).toBeNull();
    expect(snackBar.open).toHaveBeenCalledWith('Please select a file to upload', jasmine.any(String), jasmine.any(Object));
  });

  it('getFormattedDate should format date as DD/M/YYYY', () => {
    expect(service.getFormattedDate(new Date(2024, 0, 5))).toBe('05/1/2024');
    expect(service.getFormattedDate(new Date(2024, 11, 20))).toBe('20/12/2024');
  });
});