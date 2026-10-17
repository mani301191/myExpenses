import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EventsService } from './events.service';

describe('EventsService', () => {
  let service: EventsService;
  let httpMock: HttpTestingController;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  const baseUrl = 'http://localhost:8003/api/';

  beforeEach(() => {
    snackBar = jasmine.createSpyObj('MatSnackBar', ['open']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: snackBar }
      ]
    });
    service = TestBed.inject(EventsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('saveEventData should POST eventDetail with formatted eventDate and refresh data', () => {
    const data: any = {
      name: 'Birthday',
      eventDate: new Date(2024, 3, 5)
    };
    service.saveEventData(data);

    const postReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'event/eventDetail' &&
      r.method === 'POST'
    );
    expect(postReq.request.body.eventDate).toBe('05/4/2024');
    postReq.flush([]);

    const fetchReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'event/eventDetail' &&
      r.method === 'GET'
    );
    fetchReq.flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Event Data created successfully', jasmine.any(String), jasmine.any(Object));
  });

  it('saveEventData should not add eventDate when missing', () => {
    const data: any = { name: 'Meeting' };
    service.saveEventData(data);

    const postReq = httpMock.expectOne(baseUrl + 'event/eventDetail');
    expect(postReq.request.body.eventDate).toBeUndefined();
    postReq.flush([]);

    httpMock.expectOne(r =>
      r.url === baseUrl + 'event/eventDetail' &&
      r.method === 'GET'
    ).flush([]);
  });

  it('fetchEventData should GET eventDetail and push data', () => {
    const expected = [{ eventId: 1, name: 'Party' }];

    let result: any;
    service.fetchEventData().subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'event/eventDetail' &&
      r.method === 'GET'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.eventDataResponse.getValue()).toEqual(expected as any);
  });

  it('deleteRow should DELETE event/:eventId and refresh data', () => {
    service.deleteRow({ eventId: 3 });

    const delReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'event/3' &&
      r.method === 'DELETE'
    );
    delReq.flush({ message: 'Deleted' });

    httpMock.expectOne(r =>
      r.url === baseUrl + 'event/eventDetail' &&
      r.method === 'GET'
    ).flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Deleted', jasmine.any(String), jasmine.any(Object));
  });

  it('fetchEventTypeDropdownData should GET dropdown with key EventType', () => {
    const expected = [{ value: 'Birthday', label: 'Birthday' }];

    let result: any;
    service.fetchEventTypeDropdownData().subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url.includes('config/dropDown') &&
      r.url.includes('key=EventType') &&
      r.method === 'GET'
    );
    req.flush(expected);

    expect(result).toEqual(expected);
    expect(service.eventDropDownResponse.getValue()).toEqual(expected as any);
  });

  it('uploadEventFile should POST uploadEvents as FormData and refresh data', () => {
    const file = new File(['data'], 'events.txt', { type: 'text/plain' });
    service.uploadEventFile(file);

    const postReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'event/uploadEvents' &&
      r.method === 'POST'
    );
    expect(postReq.request.body instanceof FormData).toBeTrue();
    expect((postReq.request.body as FormData).get('file')).toBe(file);
    postReq.flush('Events uploaded successfully!');

    httpMock.expectOne(r =>
      r.url === baseUrl + 'event/eventDetail' &&
      r.method === 'GET'
    ).flush([]);

    expect(snackBar.open).toHaveBeenCalledWith('Events uploaded successfully!', jasmine.any(String), jasmine.any(Object));
  });

  it('uploadEventFile should warn when no file is selected', () => {
    service.uploadEventFile(null);

    httpMock.expectNone(baseUrl + 'event/uploadEvents');
    expect(snackBar.open).toHaveBeenCalledWith('Please select a file to upload', jasmine.any(String), jasmine.any(Object));
    expect(service.uploadingResponse.getValue()).toBeFalse();
  });

  it('uploadEventFile should toggle uploading flag while the request is in flight', () => {
    const flags: boolean[] = [];
    service.uploading.subscribe(v => flags.push(v));
    flags.length = 0;

    const file = new File(['data'], 'events.txt', { type: 'text/plain' });
    service.uploadEventFile(file);
    expect(service.uploadingResponse.getValue()).toBeTrue();

    const postReq = httpMock.expectOne(r => r.url === baseUrl + 'event/uploadEvents');
    postReq.flush('ok');
    httpMock.expectOne(r => r.url === baseUrl + 'event/eventDetail').flush([]);

    expect(flags).toEqual([true, false]);
    expect(service.uploadingResponse.getValue()).toBeFalse();
  });
});