import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CareerData } from '../component/career/career-data';
import { DropDownData } from '../config-data';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CareerService extends BaseService {

  careerDataResponse = new BehaviorSubject<CareerData[]>([]);
  careerData = this.careerDataResponse.asObservable();
  personNamesResponse = new BehaviorSubject<DropDownData[]>([]);
  personNames = this.personNamesResponse.asObservable();

  constructor(private http: HttpClient) {
    super();
  }

  saveCareerData(careerData) {
    if (careerData.startDate) {
      careerData.startDate = this.getFormattedDate(careerData.startDate);
    }
    if (careerData.endDate) {
      careerData.endDate = this.getFormattedDate(careerData.endDate);
    }
    this.http.post<CareerData[]>(this.baseUrl + 'career/careerDetail', careerData).subscribe(
      () => {
        this.displayMessage('career Data created successfully');
        this.fetchCareerData();
      },
      () => {
        this.displayMessage('Error Occured, Contact System Admin');
      });
  }

  fetchCareerData(personName?: string) {
    let params = new HttpParams();
    if (personName) {
      params = params.append('personName', personName);
    }
    this.http.get<CareerData[]>(this.baseUrl + 'career/careerDetail', { params: params }).subscribe(
      (res) => {
        this.careerDataResponse.next(res);
      },
      () => this.displayMessage('Error Occured, Contact System Admin'));
    return this.careerData;
  }

  fetchPersonNames() {
    this.http.get<DropDownData[]>(this.baseUrl + 'config/dropDown?key=PersonNames').subscribe(
      (res) => {
        this.personNamesResponse.next(res);
      },
      () => this.displayMessage('Error Occured, Contact System Admin'));
    return this.personNames;
  }

  deleteRow(data) {
    this.http.delete<any>(this.baseUrl + 'career/' + data.id).subscribe(
      (res) => {
        this.displayMessage(res.message);
        this.fetchCareerData();
      },
      () => this.displayMessage('Error Occured, Contact System Admin')
    );
  }

  updateCareertDetail(data) {
    this.http.patch<any>(this.baseUrl + 'career/careerDetail',data).subscribe(
      (res) => {
        this.displayMessage(res.message);
        this.fetchCareerData();
      },
      () => this.displayMessage('Error Occured, Contact System Admin')
    );
  }
}
