import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FitnessService {

  baseUrl = 'http://localhost:8003/api/fitness/';
  _snackBar = inject(MatSnackBar);
  personDetailResponse = new BehaviorSubject<any[]>([]);
  personDetail = this.personDetailResponse.asObservable();
  medicalDetailsResponse = new BehaviorSubject<any[]>([]);
  medicalDetails = this.medicalDetailsResponse.asObservable();
  personNamesResponse = new BehaviorSubject<any[]>([]);
  personNames = this.personNamesResponse.asObservable();
  personWeightResponse = new BehaviorSubject<any[]>([]);
  personWeight = this.personWeightResponse.asObservable();
  saveMedicalDetailsResponse = new BehaviorSubject<any>({} );
  savePersonDetailsResponse = new BehaviorSubject<any>({} );
  savePersonWeightResponse = new BehaviorSubject<any>({} );

  constructor(private http: HttpClient) { }

  displayMessage(message: string) {
    this._snackBar.open(message, 'dismiss', {
      verticalPosition: 'top',
      duration: 3000
    })
  }

  savePersonDetails(personData) {
    this.http.post<any>(this.baseUrl + 'personDetail', personData).subscribe(
      () => {
        this.savePersonDetailsResponse.next('success');
        this.displayMessage('Person Data created successfully');
      },
      () => {
        this.displayMessage('Error Occured, Contact System Admin');
      });
      return this.savePersonDetailsResponse;
  }

  saveMedicalDetails(medicalDetail) {
    medicalDetail.date=this.getFormattedDate(medicalDetail.date);
    this.http.post<any>(this.baseUrl + 'medicalDetail', medicalDetail).subscribe(
      () => {
        this.saveMedicalDetailsResponse.next('success');
        this.displayMessage('MedicalDetail Data created successfully');
      },
      () => {
        this.displayMessage('Error Occured, Contact System Admin');
      });
      return this.saveMedicalDetailsResponse;
  }

  savePersonWeight(weightDetail) {
    weightDetail.date=this.getFormattedDate(weightDetail.date);
    this.http.post<any>(this.baseUrl + 'personDetail/weight', weightDetail).subscribe(
      () => {
        this.savePersonWeightResponse.next('success');
        this.displayMessage('Person Weight Data created successfully');
      },
      () => {
        this.displayMessage('Error Occured, Contact System Admin');
      });
      return this.savePersonWeightResponse;
  }

  fetchPersonDetails() {
    this.http.get<any[]>(this.baseUrl + 'personDetails').subscribe(
      (res) => {
        this.personDetailResponse.next(res);
      },
      () => this.displayMessage('Error Occured, Contact System Admin')
    );
    return this.personDetail;
  }

  fetchMedicalDetails(patientName: string) {
    let params = new HttpParams();
    params = params.append('patientName', patientName);
    this.http.get<any[]>(this.baseUrl + 'medicalDetails',{params: params}).subscribe(
      (res) => {
        this.medicalDetailsResponse.next(res);
      },
      () => this.displayMessage('Error Occured, Contact System Admin')
    );
    return this.medicalDetails;
  }

  fetchPersonNames() {
    this.http.get<any[]>(this.baseUrl + 'personNames').subscribe(
      (res) => {
        this.personNamesResponse.next(res);
      },
      () => this.displayMessage('Error Occured, Contact System Admin')
    );
    return this.personNames;
  }

  fetchPersonWeight(personName:string) {
    let params = new HttpParams();
    params = params.append('personName', personName);
    this.http.get<any[]>(this.baseUrl + 'personDetail/weight',{params: params}).subscribe(
      (res) => {
        this.personWeightResponse.next(res);
      },
      () => this.displayMessage('Error Occured, Contact System Admin')
    );
    return this.personWeight;
  }

  deletePersonData(data) {
    this.http.delete<any>(this.baseUrl + 'person/' + data.personName).subscribe(
      (res) => {
        this.displayMessage(res.message);
        this.fetchPersonDetails();
      },
      () => this.displayMessage('Error Occured, Contact System Admin')
    );
  }

  deletePersonWeightData(data) {
    this.http.delete<any>(this.baseUrl + 'personDetail/weight/' + data.id).subscribe(
      (res) => {
        this.displayMessage(res.message);
        this.fetchPersonWeight(data.personName);
      },
      () => this.displayMessage('Error Occured, Contact System Admin')
    );
  }

  deleteMedicalDetailData(data) {
    this.http.delete<any>(this.baseUrl + 'medicalDetail/' + data.id).subscribe(
      (res) => {
        this.displayMessage(res.message);
        this.fetchMedicalDetails(data.patientName);
      },
      () => this.displayMessage('Error Occured, Contact System Admin')
    );
  }

  getFormattedDate(date) {
    let day = ('0' + date.getDate()).slice(-2);
    let month = date.getMonth() + 1;
    return day + '/' + month + '/' +  date.getFullYear();
}
}
