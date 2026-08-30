import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { InvestmentService } from './investment.service';

describe('InvestmentService', () => {
  let service: InvestmentService;
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
    service = TestBed.inject(InvestmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('saveInvestmentData should POST investDetail and refresh investment data', () => {
    service.saveInvestmentData({ name: 'Mutual Fund', amount: 10000 });

    const postReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'investment/investDetail' &&
      r.method === 'POST'
    );
    expect(postReq.request.body).toEqual({ name: 'Mutual Fund', amount: 10000 });
    postReq.flush({});

    const fetchReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'investment/investments' &&
      r.method === 'GET'
    );
    fetchReq.flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Investment Data created successfully', jasmine.any(String), jasmine.any(Object));
  });

  it('fetchInvestmentData should GET investments and push data', () => {
    const expected = [{ investId: 1, name: 'Mutual Fund' }];

    let result: any;
    service.fetchInvestmentData().subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'investment/investments' &&
      r.method === 'GET'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.investmentDataResponse.getValue()).toEqual(expected as any);
  });

  it('updateInvestmentStatus should PATCH investDetail and refresh data', () => {
    service.updateInvestmentStatus({ investId: 1, status: 'active' });

    const patchReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'investment/investDetail' &&
      r.method === 'PATCH'
    );
    patchReq.flush({ message: 'Updated' });

    httpMock.expectOne(r =>
      r.url === baseUrl + 'investment/investments' &&
      r.method === 'GET'
    ).flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Updated', jasmine.any(String), jasmine.any(Object));
  });

  it('deleteRow should DELETE investment/:investId and refresh data', () => {
    service.deleteRow({ investId: 4 });

    const delReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'investment/4' &&
      r.method === 'DELETE'
    );
    delReq.flush({ message: 'Deleted' });

    httpMock.expectOne(r =>
      r.url === baseUrl + 'investment/investments' &&
      r.method === 'GET'
    ).flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Deleted', jasmine.any(String), jasmine.any(Object));
  });

  it('fetchInvestmentDropdownData should GET dropdown with key Investment', () => {
    const expected = [{ value: 'MF', label: 'Mutual Fund' }];

    let result: any;
    service.fetchInvestmentDropdownData().subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url.includes('/config/dropDown') &&
      r.url.includes('key=Investment') &&
      r.method === 'GET'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.investmentResponse.getValue()).toEqual(expected as any);
  });

  it('fetchInvestmentStatusDropdownData should GET dropdown with key InvestmentStatus', () => {
    const expected = [{ value: 'Active', label: 'Active' }];

    let result: any;
    service.fetchInvestmentStatusDropdownData().subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url.includes('/config/dropDown') &&
      r.url.includes('key=InvestmentStatus') &&
      r.method === 'GET'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.investmentStatusResponse.getValue()).toEqual(expected as any);
  });

  it('saveFixedDeposit should POST fixedDeposit and refresh fixed deposits', () => {
    service.saveFixedDeposit({ amount: 50000, months: 12 });

    const postReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'investment/fixedDeposit' &&
      r.method === 'POST'
    );
    expect(postReq.request.body).toEqual({ amount: 50000, months: 12 });
    postReq.flush({});

    const fetchReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'investment/fixedDeposits' &&
      r.method === 'GET'
    );
    fetchReq.flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('fixedDeposit Data created successfully', jasmine.any(String), jasmine.any(Object));
  });

  it('fetchFixedDeposits should GET fixedDeposits and push data', () => {
    const expected = [{ id: 1, amount: 50000 }];

    let result: any;
    service.fetchFixedDeposits().subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'investment/fixedDeposits' &&
      r.method === 'GET'
    );
    req.flush(expected);

    expect(service.fixedDepositResponse.getValue()).toEqual(expected as any);
  });

  it('deleteFixedDeposit should DELETE fixedDeposit/:id and refresh data', () => {
    service.deleteFixedDeposit({ id: 2 });

    const delReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'investment/fixedDeposit/2' &&
      r.method === 'DELETE'
    );
    delReq.flush({ message: 'Deleted' });

    httpMock.expectOne(r =>
      r.url === baseUrl + 'investment/fixedDeposits' &&
      r.method === 'GET'
    ).flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Deleted', jasmine.any(String), jasmine.any(Object));
  });

  it('updateFixedDeposit should PATCH fixedDeposit and refresh data', () => {
    service.updateFixedDeposit({ id: 1, amount: 60000 });

    const patchReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'investment/fixedDeposit' &&
      r.method === 'PATCH'
    );
    patchReq.flush({ message: 'Updated' });

    httpMock.expectOne(r =>
      r.url === baseUrl + 'investment/fixedDeposits' &&
      r.method === 'GET'
    ).flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Updated', jasmine.any(String), jasmine.any(Object));
  });
});