import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FitnessService } from './fitness.service';

describe('FitnessService', () => {
  let service: FitnessService;
  let httpMock: HttpTestingController;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const baseUrl = 'http://localhost:8003/api/fitness/';

  beforeEach(() => {
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: snackBar }
      ]
    });
    service = TestBed.inject(FitnessService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('savePersonDetails should POST personDetail and push success', () => {
    let result: any;
    service.savePersonDetails({ personName: 'John' }).subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'personDetail' &&
      r.method === 'POST'
    );
    req.flush({});

    expect(result).toBe('success');
    expect(service.savePersonDetailsResponse.getValue()).toBe('success');
    expect(snackBar.open).toHaveBeenCalledWith('Person Data created successfully', jasmine.any(String), jasmine.any(Object));
  });

  it('fetchPersonDetails should GET personDetails and push data', () => {
    const expected = [{ personName: 'John' }];

    let result: any;
    service.fetchPersonDetails().subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'personDetails' &&
      r.method === 'GET'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.personDetailResponse.getValue()).toEqual(expected as any);
  });

  it('savePersonWeight should POST personDetail/weight with formatted date', () => {
    let result: any;
    service.savePersonWeight({ personName: 'John', date: new Date(2024, 3, 5), weight: 70 })
      .subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'personDetail/weight' &&
      r.method === 'POST'
    );
    expect(req.request.body.date).toBe('05/4/2024');
    req.flush({});

    expect(result).toBe('success');
    expect(service.savePersonWeightResponse.getValue()).toBe('success');
  });

  it('fetchPersonWeight should GET personDetail/weight with personName param', () => {
    const expected = [{ date: '05/4/2024', weight: 70 }];

    let result: any;
    service.fetchPersonWeight('John').subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'personDetail/weight' &&
      r.params.get('personName') === 'John' &&
      r.method === 'GET'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.personWeightResponse.getValue()).toEqual(expected as any);
  });

  it('saveMedicalDetails should POST medicalDetail with formatted date', () => {
    let result: any;
    service.saveMedicalDetails({ patientName: 'John', date: new Date(2024, 0, 15), info: 'ok' })
      .subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'medicalDetail' &&
      r.method === 'POST'
    );
    expect(req.request.body.date).toBe('15/1/2024');
    req.flush({});

    expect(result).toBe('success');
    expect(service.saveMedicalDetailsResponse.getValue()).toBe('success');
  });

  it('fetchMedicalDetails should GET medicalDetails with patientName param', () => {
    const expected = [{ id: 1, info: 'ok' }];

    let result: any;
    service.fetchMedicalDetails('John').subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'medicalDetails' &&
      r.params.get('patientName') === 'John' &&
      r.method === 'GET'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.medicalDetailsResponse.getValue()).toEqual(expected as any);
  });

  it('fetchPersonNames should GET personNames and push data', () => {
    const expected = [{ personName: 'John' }];

    let result: any;
    service.fetchPersonNames().subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'personNames' &&
      r.method === 'GET'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.personNamesResponse.getValue()).toEqual(expected as any);
  });

  it('deletePersonData should DELETE person/:personName and refresh person details', () => {
    service.deletePersonData({ personName: 'John' });

    const delReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'person/John' &&
      r.method === 'DELETE'
    );
    delReq.flush({ message: 'Deleted' });

    const fetchReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'personDetails' &&
      r.method === 'GET'
    );
    fetchReq.flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Deleted', jasmine.any(String), jasmine.any(Object));
  });

  it('deletePersonWeightData should DELETE weight and refresh person weight', () => {
    service.deletePersonWeightData({ id: 2, personName: 'John' });

    const delReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'personDetail/weight/2' &&
      r.method === 'DELETE'
    );
    delReq.flush({ message: 'Deleted' });

    const fetchReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'personDetail/weight' &&
      r.params.get('personName') === 'John' &&
      r.method === 'GET'
    );
    fetchReq.flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Deleted', jasmine.any(String), jasmine.any(Object));
  });

  it('deleteMedicalDetailData should DELETE medicalDetail and refresh medical details', () => {
    service.deleteMedicalDetailData({ id: 3, patientName: 'John' });

    const delReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'medicalDetail/3' &&
      r.method === 'DELETE'
    );
    delReq.flush({ message: 'Deleted' });

    const fetchReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'medicalDetails' &&
      r.params.get('patientName') === 'John' &&
      r.method === 'GET'
    );
    fetchReq.flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Deleted', jasmine.any(String), jasmine.any(Object));
  });

  it('updateMedicalDetail should PATCH medicalDetail', () => {
    service.updateMedicalDetail({ id: 1, info: 'updated' });

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'medicalDetail' &&
      r.method === 'PATCH'
    );
    req.flush({ message: 'Updated' });

    expect(snackBar.open).toHaveBeenCalledWith('Updated', jasmine.any(String), jasmine.any(Object));
  });

  it('updateWeightDetail should PATCH personDetail/weight', () => {
    service.updateWeightDetail({ id: 1, weight: 72 });

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'personDetail/weight' &&
      r.method === 'PATCH'
    );
    req.flush({ message: 'Updated' });

    expect(snackBar.open).toHaveBeenCalledWith('Updated', jasmine.any(String), jasmine.any(Object));
  });

  it('getFormattedDate should format date as DD/M/YYYY', () => {
    expect(service.getFormattedDate(new Date(2024, 0, 5))).toBe('05/1/2024');
    expect(service.getFormattedDate(new Date(2024, 11, 20))).toBe('20/12/2024');
  });

  it('savePersonDetails should display error message on failure', () => {
    service.savePersonDetails({ personName: 'John' }).subscribe();

    const req = httpMock.expectOne(baseUrl + 'personDetail');
    req.flush('err', { status: 500, statusText: 'Error' });

    expect(snackBar.open).toHaveBeenCalledWith('Error Occured, Contact System Admin', jasmine.any(String), jasmine.any(Object));
  });
});