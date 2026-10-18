import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../service/document.service';
import { DocumentData } from './document-data';

@Component({
  selector: 'app-documents',
  imports: [MatIconModule, MatInputModule, MatFormFieldModule, MatButtonModule, MatPaginatorModule,
    MatSortModule, MatTableModule, MatTooltipModule, FormsModule],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class DocumentsComponent {
  displayedColumns: string[] = ['preview', 'fileName', 'keywords', 'fileSize', 'uploadedDate', 'actionsColumn'];
  dataSource: MatTableDataSource<DocumentData>;
  documents: DocumentData[] = [];
  selectedFile: File = null;
  keywords = '';
  searchKeyword = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('fileInput') fileInput: ElementRef;

  constructor(private documentService: DocumentService) { }

  ngOnInit() {
    this.fetchDocuments();
  }

  fetchDocuments() {
    this.documentService.fetchDocuments().subscribe((res) => {
      this.documents = res;
      this.dataSource = new MatTableDataSource(res);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  upload() {
    this.documentService.uploadDocument(this.selectedFile, this.keywords);
    this.resetForm();
  }

  resetForm() {
    this.selectedFile = null;
    this.keywords = '';
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  search() {
    this.documentService.fetchDocuments(this.searchKeyword).subscribe((res) => {
      this.documents = res;
      this.dataSource = new MatTableDataSource(res);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  clearSearch() {
    this.searchKeyword = '';
    this.fetchDocuments();
  }

  deleteRow(row: DocumentData) {
    this.documentService.deleteRow(row);
  }

  downloadUrl(documentId: string): string {
    return this.documentService.downloadUrl(documentId);
  }

  previewUrl(documentId: string): string {
    return this.documentService.previewUrl(documentId);
  }

  isImage(row: DocumentData): boolean {
    return !!row.contentType && row.contentType.startsWith('image/');
  }

  formatSize(bytes: number): string {
    if (bytes === null || bytes === undefined) {
      return '';
    }
    if (bytes < 1024) {
      return bytes + ' B';
    }
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    }
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
