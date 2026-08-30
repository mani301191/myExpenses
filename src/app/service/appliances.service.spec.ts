import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AppliancesService } from './appliances.service';

describe('AppliancesService', () => {
  let service: AppliancesService;
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
    service = TestBed.inject(AppliancesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('saveAppliancesData should POST formatted dates and refresh data', () => {
    const data: any = {
      name: 'Fridge',
      amcEndDate: new Date(2024, 3, 5),
      lastServicedDate: new Date(2024, 0, 15)
    };
    service.saveAppliancesData(data);

    const postReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'appliances/appliancesDetail' &&
      r.method === 'POST'
    );
    expect(postReq.request.body.amcEndDate).toBe('05/4/2024');
    expect(postReq.request.body.lastServicedDate).toBe('15/1/2024');
    postReq.flush([]);

    const fetchReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'appliances/appliancesDetail' &&
      r.method === 'GET'
    );
    fetchReq.flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Appliances Data created successfully', jasmine.any(String), jasmine.any(Object));
  });

  it('saveAppliancesData should not add date fields when they are missing', () => {
    const data: any = { name: 'AC' };
    service.saveAppliancesData(data);

    const postReq = httpMock.expectOne(baseUrl + 'appliances/appliancesDetail');
    expect(postReq.request.body.amcEndDate).toBeUndefined();
    expect(postReq.request.body.lastServicedDate).toBeUndefined();
    postReq.flush([]);

    httpMock.expectOne(r =>
      r.url === baseUrl + 'appliances/appliancesDetail' &&
      r.method === 'GET'
    ).flush([]);
  });

  it('fetchAppliancesData should GET appliancesDetail and push data', () => {
    const expected = [{ appliancesId: 1, name: 'Fridge' }];

    let result: any;
    service.fetchAppliancesData().subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'appliances/appliancesDetail' &&
      r.method === 'GET'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.appliancesDataResponse.getValue()).toEqual(expected as any);
  });

  it('updateAppliances should PATCH formatted long dates and refresh data', () => {
    const data: any = {
      appliancesId: 2,
      amcEndDate: new Date(2024, 3, 5),
      lastServicedDate: new Date(2024, 0, 15)
    };
    service.updateAppliances(data);

    const patchReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'appliances/appliancesDetail' &&
      r.method === 'PATCH'
    );
    expect(patchReq.request.body.amcEndDate).toBe('05/4/2024');
    expect(patchReq.request.body.lastServicedDate).toBe('15/1/2024');
    patchReq.flush({ message: 'Updated' });

    httpMock.expectOne(r =>
      r.url === baseUrl + 'appliances/appliancesDetail' &&
      r.method === 'GET'
    ).flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Updated', jasmine.any(String), jasmine.any(Object));
  });

  it('updateAppliances should not reformat already short dates or nulls', () => {
    const data: any = {
      appliancesId: 3,
      amcEndDate: null,
      lastServicedDate: '01/01/2024'
    };
    service.updateAppliances(data);

    const patchReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'appliances/appliancesDetail' &&
      r.method === 'PATCH'
    );
    expect(patchReq.request.body.amcEndDate).toBeNull();
    expect(patchReq.request.body.lastServicedDate).toBe('01/01/2024');
    patchReq.flush({ message: 'Updated' });

    httpMock.expectOne(r =>
      r.url === baseUrl + 'appliances/appliancesDetail' &&
      r.method === 'GET'
    ).flush([]);
  });

  it('deleteRow should DELETE appliances/:id and refresh data', () => {
    service.deleteRow({ appliancesId: 7 });

    const delReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'appliances/7' &&
      r.method === 'DELETE'
    );
    delReq.flush({ message: 'Deleted' });

    httpMock.expectOne(r =>
      r.url === baseUrl + 'appliances/appliancesDetail' &&
      r.method === 'GET'
    ).flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Deleted', jasmine.any(String), jasmine.any(Object));
  });
});