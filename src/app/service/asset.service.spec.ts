import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AssetService } from './asset.service';

describe('AssetServiceService', () => {
  let service: AssetService;
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
    service = TestBed.inject(AssetService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('saveAssetData should POST assetDetail and refresh asset data', () => {
    service.saveAssetData({ name: 'House', value: 100000 });

    const postReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'asset/assetDetail' &&
      r.method === 'POST'
    );
    expect(postReq.request.body).toEqual({ name: 'House', value: 100000 });
    postReq.flush({});

    const fetchReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'asset/assetDetails' &&
      r.method === 'GET'
    );
    fetchReq.flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Asset Data created successfully', jasmine.any(String), jasmine.any(Object));
  });

  it('fetchAssetData should GET assetDetails and push data', () => {
    const expected = [{ id: 1, name: 'Car' }];

    let result: any;
    service.fetchAssetData().subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'asset/assetDetails' &&
      r.method === 'GET'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.assetDataResponse.getValue()).toEqual(expected as any);
  });

  it('deleteRow should DELETE asset/:id and refresh asset data', () => {
    service.deleteRow({ id: 5 });

    const delReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'asset/5' &&
      r.method === 'DELETE'
    );
    delReq.flush({ message: 'Deleted' });

    httpMock.expectOne(r =>
      r.url === baseUrl + 'asset/assetDetails' &&
      r.method === 'GET'
    ).flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Deleted', jasmine.any(String), jasmine.any(Object));
  });

  it('updateAssetStatus should PATCH assetDetail and refresh asset data', () => {
    service.updateAssetStatus({ id: 2, status: 'sold' });

    const patchReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'asset/assetDetail' &&
      r.method === 'PATCH'
    );
    patchReq.flush({ message: 'Updated' });

    httpMock.expectOne(r =>
      r.url === baseUrl + 'asset/assetDetails' &&
      r.method === 'GET'
    ).flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Updated', jasmine.any(String), jasmine.any(Object));
  });

  it('fetchAssetTypesDropdownData should GET dropdown with key AssetTypes', () => {
    const expected = [{ value: 'Car', label: 'Car' }];

    let result: any;
    service.fetchAssetTypesDropdownData().subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url.includes('/config/dropDown') &&
      r.url.includes('key=AssetTypes') &&
      r.method === 'GET'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.assetTypesResponse.getValue()).toEqual(expected as any);
  });

  it('fetchAssetDropdownData should GET dropdown with key Assets', () => {
    const expected = [{ value: 'House', label: 'House' }];

    let result: any;
    service.fetchAssetDropdownData().subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url.includes('/config/dropDown') &&
      r.url.includes('key=Assets') &&
      r.method === 'GET'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.assetsResponse.getValue()).toEqual(expected as any);
  });

  it('fetchAssetStatusDropdownData should GET dropdown with key AssetStatus', () => {
    const expected = [{ value: 'Active', label: 'Active' }];

    let result: any;
    service.fetchAssetStatusDropdownData().subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url.includes('/config/dropDown') &&
      r.url.includes('key=AssetStatus') &&
      r.method === 'GET'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.assetStatusResponse.getValue()).toEqual(expected as any);
  });
});