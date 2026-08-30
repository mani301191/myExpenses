import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { InsuranceService } from './insurance.service';

describe('InsuranceService', () => {
  let service: InsuranceService;
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
    service = TestBed.inject(InsuranceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('saveInsuranceData should POST insuranceDetail with formatted dates and refresh data', () => {
    const data: any = {
      policy: 'POL-1',
      startDate: new Date(2024, 3, 5),
      endDate: new Date(2024, 11, 20)
    };
    service.saveInsuranceData(data);

    const postReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'insurance/insuranceDetail' &&
      r.method === 'POST'
    );
    expect(postReq.request.body.startDate).toBe('05/4/2024');
    expect(postReq.request.body.endDate).toBe('20/12/2024');
    postReq.flush([]);

    const fetchReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'insurance/insuranceDetails' &&
      r.method === 'GET'
    );
    fetchReq.flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Insurance Data created successfully', jasmine.any(String), jasmine.any(Object));
  });

  it('saveInsuranceData should not add date fields when they are missing', () => {
    const data: any = { policy: 'POL-2' };
    service.saveInsuranceData(data);

    const postReq = httpMock.expectOne(baseUrl + 'insurance/insuranceDetail');
    expect(postReq.request.body.startDate).toBeUndefined();
    expect(postReq.request.body.endDate).toBeUndefined();
    postReq.flush([]);

    httpMock.expectOne(r =>
      r.url === baseUrl + 'insurance/insuranceDetails' &&
      r.method === 'GET'
    ).flush([]);
  });

  it('fetchInsuranceData should GET insuranceDetails and push data', () => {
    const expected = [{ insuranceId: 1, policy: 'POL-1' }];

    let result: any;
    service.fetchInsuranceData().subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'insurance/insuranceDetails' &&
      r.method === 'GET'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.insuranceDataResponse.getValue()).toEqual(expected as any);
  });

  it('updateInsurance should PATCH insuranceDetail and refresh data', () => {
    service.updateInsurance({ insuranceId: 1, amount: 500 });

    const patchReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'insurance/insuranceDetail' &&
      r.method === 'PATCH'
    );
    patchReq.flush({ message: 'Updated' });

    httpMock.expectOne(r =>
      r.url === baseUrl + 'insurance/insuranceDetails' &&
      r.method === 'GET'
    ).flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Updated', jasmine.any(String), jasmine.any(Object));
  });

  it('deleteRow should DELETE insurance/:insuranceId and refresh data', () => {
    service.deleteRow({ insuranceId: 6 });

    const delReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'insurance/6' &&
      r.method === 'DELETE'
    );
    delReq.flush({ message: 'Deleted' });

    httpMock.expectOne(r =>
      r.url === baseUrl + 'insurance/insuranceDetails' &&
      r.method === 'GET'
    ).flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Deleted', jasmine.any(String), jasmine.any(Object));
  });

  it('fetchInsuranceTypeDropdownData should GET dropdown with key InsurenceType', () => {
    const expected = [{ value: 'Health', label: 'Health' }];

    let result: any;
    service.fetchInsuranceTypeDropdownData().subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url.includes('/config/dropDown') &&
      r.url.includes('key=InsurenceType') &&
      r.method === 'GET'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.insuranceTypesResponse.getValue()).toEqual(expected as any);
  });
});