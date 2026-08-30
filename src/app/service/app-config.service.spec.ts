import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AppConfigService } from './app-config.service';

describe('AppConfigService', () => {
  let service: AppConfigService;
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
    service = TestBed.inject(AppConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('saveConfigData should POST config/appConfig and refresh config data', () => {
    service.saveConfigData({ key: 'X', value: 'Y' });

    const postReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'config/appConfig' &&
      r.method === 'POST'
    );
    expect(postReq.request.body).toEqual({ key: 'X', value: 'Y' });
    postReq.flush([{ key: 'X', value: 'Y' }]);

    const fetchReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'config/appConfig' &&
      r.method === 'GET'
    );
    fetchReq.flush([{ key: 'X', value: 'Y' }]);

    expect(snackBar.open).toHaveBeenCalledWith('Config Data created successfully', jasmine.any(String), jasmine.any(Object));
    expect(service.configDataResponse.getValue()).toEqual([{ key: 'X', value: 'Y' }]);
  });

  it('saveConfigData should display error message on failure', () => {
    service.saveConfigData({ key: 'X' });

    const postReq = httpMock.expectOne(baseUrl + 'config/appConfig');
    postReq.flush('err', { status: 500, statusText: 'Error' });

    expect(snackBar.open).toHaveBeenCalledWith('Error Occured, Contact System Admin', jasmine.any(String), jasmine.any(Object));
  });

  it('fetchConfigData should GET config/appConfig and push data', () => {
    const expected = [{ key: 'A', value: '1' }];

    let result: any;
    service.fetchConfigData().subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'config/appConfig' &&
      r.method === 'GET'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.configDataResponse.getValue()).toEqual(expected as any);
  });

  it('deleteRow should DELETE config/:key and refresh config data', () => {
    service.deleteRow({ key: 'K' });

    const delReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'config/K' &&
      r.method === 'DELETE'
    );
    delReq.flush({ message: 'Deleted' });

    const fetchReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'config/appConfig' &&
      r.method === 'GET'
    );
    fetchReq.flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Deleted', jasmine.any(String), jasmine.any(Object));
  });

  it('saveDefaultConfigData should POST config/default and refresh config data', () => {
    service.saveDefaultConfigData();

    const postReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'config/default' &&
      r.method === 'POST'
    );
    expect(postReq.request.body).toBeNull();
    postReq.flush([]);

    const fetchReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'config/appConfig' &&
      r.method === 'GET'
    );
    fetchReq.flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Config Data created successfully', jasmine.any(String), jasmine.any(Object));
  });
});