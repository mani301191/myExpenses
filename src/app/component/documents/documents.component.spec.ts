import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { DocumentsComponent } from './documents.component';
import { DocumentService } from '../../service/document.service';
import { DocumentData } from './document-data';

describe('DocumentsComponent', () => {
  let component: DocumentsComponent;
  let fixture: ComponentFixture<DocumentsComponent>;
  let documentServiceSpy: jasmine.SpyObj<DocumentService>;

  const rows: DocumentData[] = [
    { documentId: '1', fileName: 'photo.png', contentType: 'image/png', fileSize: 2048, keywords: 'trip', uploadedDate: '01/01/2024' },
    { documentId: '2', fileName: 'report.pdf', contentType: 'application/pdf', fileSize: 1048576, keywords: 'work', uploadedDate: '02/01/2024' }
  ];

  beforeEach(async () => {
    documentServiceSpy = jasmine.createSpyObj('DocumentService', [
      'fetchDocuments', 'uploadDocument', 'deleteRow', 'downloadUrl', 'previewUrl'
    ]);
    documentServiceSpy.fetchDocuments.and.returnValue(of(rows));
    documentServiceSpy.downloadUrl.and.callFake((id: string) => `http://localhost:8003/api/document/${id}/download`);
    documentServiceSpy.previewUrl.and.callFake((id: string) => `http://localhost:8003/api/document/${id}/preview`);

    await TestBed.configureTestingModule({
      imports: [DocumentsComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: DocumentService, useValue: documentServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load documents on init', () => {
    expect(documentServiceSpy.fetchDocuments).toHaveBeenCalled();
    expect(component.documents.length).toBe(2);
    expect(component.dataSource.data.length).toBe(2);
  });

  it('should wire the paginator and sort to the table data source', () => {
    expect(component.dataSource.paginator).toBe(component.paginator);
    expect(component.dataSource.sort).toBe(component.sort);
  });

  it('search should call the service with the keyword', () => {
    component.searchKeyword = 'work';
    component.search();
    expect(documentServiceSpy.fetchDocuments).toHaveBeenCalledWith('work');
  });

  it('clearSearch should reset the keyword and reload', () => {
    component.searchKeyword = 'work';
    component.clearSearch();
    expect(component.searchKeyword).toBe('');
    expect(documentServiceSpy.fetchDocuments).toHaveBeenCalledWith();
  });

  it('upload should delegate to the service and reset the form', () => {
    const file = new File(['x'], 'x.txt');
    component.selectedFile = file;
    component.keywords = 'k';
    component.upload();
    expect(documentServiceSpy.uploadDocument).toHaveBeenCalledWith(file, 'k');
    expect(component.selectedFile).toBeNull();
    expect(component.keywords).toBe('');
  });

  it('deleteRow should delegate to the service', () => {
    component.deleteRow(rows[0]);
    expect(documentServiceSpy.deleteRow).toHaveBeenCalledWith(rows[0]);
  });

  it('isImage should detect image content types', () => {
    expect(component.isImage(rows[0])).toBeTrue();
    expect(component.isImage(rows[1])).toBeFalse();
  });

  it('formatSize should render bytes, KB and MB', () => {
    expect(component.formatSize(512)).toBe('512 B');
    expect(component.formatSize(2048)).toBe('2.0 KB');
    expect(component.formatSize(1048576)).toBe('1.0 MB');
    expect(component.formatSize(null)).toBe('');
  });
});
