import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CareerService } from './career.service';

describe('CareerService', () => {
  let service: CareerService;
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
    service = TestBed.inject(CareerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('saveCareerData should POST careerDetail with formatted dates and refresh data', () => {
    const data: any = {
      company: 'ACME',
      startDate: new Date(2024, 0, 5),
      endDate: new Date(2024, 3, 20)
    };
    service.saveCareerData(data);

    const postReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'career/careerDetail' &&
      r.method === 'POST'
    );
    expect(postReq.request.body.startDate).toBe('05/1/2024');
    expect(postReq.request.body.endDate).toBe('20/4/2024');
    postReq.flush([]);

    const fetchReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'career/careerDetail' &&
      r.method === 'GET'
    );
    fetchReq.flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('career Data created successfully', jasmine.any(String), jasmine.any(Object));
  });

  it('saveCareerData should not add date fields when they are missing', () => {
    const data: any = { company: 'ACME' };
    service.saveCareerData(data);

    const postReq = httpMock.expectOne(baseUrl + 'career/careerDetail');
    expect(postReq.request.body.startDate).toBeUndefined();
    expect(postReq.request.body.endDate).toBeUndefined();
    postReq.flush([]);

    httpMock.expectOne(r =>
      r.url === baseUrl + 'career/careerDetail' &&
      r.method === 'GET'
    ).flush([]);
  });

  it('fetchCareerData should GET careerDetail and push data', () => {
    const expected = [{ id: 1, company: 'ACME' }];

    let result: any;
    service.fetchCareerData().subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'career/careerDetail' &&
      r.method === 'GET'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.careerDataResponse.getValue()).toEqual(expected as any);
  });

  it('updateCareertDetail should PATCH careerDetail', () => {
    service.updateCareertDetail({ id: 1, company: 'NEWCO' });

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'career/careerDetail' &&
      r.method === 'PATCH'
    );
    req.flush({ message: 'Updated' });

    expect(snackBar.open).toHaveBeenCalledWith('Updated', jasmine.any(String), jasmine.any(Object));
  });

  it('deleteRow should DELETE career/:id and refresh data', () => {
    service.deleteRow({ id: 4 });

    const delReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'career/4' &&
      r.method === 'DELETE'
    );
    delReq.flush({ message: 'Deleted' });

    httpMock.expectOne(r =>
      r.url === baseUrl + 'career/careerDetail' &&
      r.method === 'GET'
    ).flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Deleted', jasmine.any(String), jasmine.any(Object));
  });
});