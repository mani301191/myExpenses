import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DocumentService } from './document.service';

describe('DocumentService', () => {
  let service: DocumentService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:8003/api/';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) }
      ]
    });
    service = TestBed.inject(DocumentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('fetchDocuments without keyword should GET documents', () => {
    const expected = [{ documentId: '1', fileName: 'a.pdf' }];

    let result: any;
    service.fetchDocuments().subscribe(r => result = r);

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'document/documents' && r.method === 'GET');
    expect(req.request.params.has('keyword')).toBeFalse();
    req.flush(expected);

    expect(result).toEqual(expected as any);
    expect(service.documentsResponse.getValue()).toEqual(expected as any);
  });

  it('fetchDocuments with keyword should send keyword param', () => {
    service.fetchDocuments('invoice');

    const req = httpMock.expectOne(r =>
      r.url === baseUrl + 'document/documents' && r.method === 'GET');
    expect(req.request.params.get('keyword')).toBe('invoice');
    req.flush([]);
  });

  it('uploadDocument should POST multipart and refresh the list', () => {
    const file = new File(['hello'], 'note.txt', { type: 'text/plain' });
    service.uploadDocument(file, 'note,hello');

    const postReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'document/upload' && r.method === 'POST');
    expect(postReq.request.body instanceof FormData).toBeTrue();
    expect((postReq.request.body as FormData).get('file')).toBe(file);
    expect((postReq.request.body as FormData).get('keywords')).toBe('note,hello');
    postReq.flush({});

    httpMock.expectOne(r =>
      r.url === baseUrl + 'document/documents' && r.method === 'GET').flush([]);
  });

  it('uploadDocument should not POST when no file is selected', () => {
    service.uploadDocument(null);
    httpMock.expectNone(baseUrl + 'document/upload');
  });

  it('deleteRow should DELETE document/:id and refresh the list', () => {
    service.deleteRow({ documentId: '42' } as any);

    const delReq = httpMock.expectOne(r =>
      r.url === baseUrl + 'document/42' && r.method === 'DELETE');
    delReq.flush({ message: 'Deleted' });

    httpMock.expectOne(r =>
      r.url === baseUrl + 'document/documents' && r.method === 'GET').flush([]);
  });

  it('downloadUrl and previewUrl should build the correct endpoints', () => {
    expect(service.downloadUrl('abc')).toBe(baseUrl + 'document/abc/download');
    expect(service.previewUrl('abc')).toBe(baseUrl + 'document/abc/preview');
  });
});
