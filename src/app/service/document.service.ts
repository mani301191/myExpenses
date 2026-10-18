import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { BaseService } from './base.service';
import { DocumentData } from '../component/documents/document-data';

@Injectable({
  providedIn: 'root'
})
export class DocumentService extends BaseService {

  documentsResponse = new BehaviorSubject<DocumentData[]>([]);
  documents = this.documentsResponse.asObservable();

  constructor(private http: HttpClient) {
    super();
  }

  /**
   * Fetch document metadata. When a keyword is supplied the backend filters on
   * file name and keywords.
   */
  fetchDocuments(keyword?: string) {
    let params = new HttpParams();
    if (keyword && keyword.trim()) {
      params = params.append('keyword', keyword.trim());
    }
    this.http.get<DocumentData[]>(this.baseUrl + 'document/documents', { params: params }).subscribe(
      (res) => {
        this.documentsResponse.next(res);
      },
      () => this.displayMessage('Error Occured, Contact System Admin'));
    return this.documents;
  }

  uploadDocument(file: File, keywords?: string) {
    if (!file) {
      this.displayMessage('Please select a file to upload');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    if (keywords) {
      formData.append('keywords', keywords);
    }
    this.http.post<DocumentData>(this.baseUrl + 'document/upload', formData).subscribe(
      () => {
        this.displayMessage('Document uploaded successfully');
        this.fetchDocuments();
      },
      () => this.displayMessage('Error Occured, Contact System Admin'));
  }

  deleteRow(data: DocumentData) {
    this.http.delete<any>(this.baseUrl + 'document/' + data.documentId).subscribe(
      (res) => {
        this.displayMessage(res.message);
        this.fetchDocuments();
      },
      () => this.displayMessage('Error Occured, Contact System Admin'));
  }

  downloadUrl(documentId: string): string {
    return this.baseUrl + 'document/' + documentId + '/download';
  }

  previewUrl(documentId: string): string {
    return this.baseUrl + 'document/' + documentId + '/preview';
  }
}
