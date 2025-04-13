import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { CareerData } from '../component/career/career-data';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CareerService extends BaseService {

  careerDataResponse = new BehaviorSubject<CareerData[]>([]);
  careerData = this.careerDataResponse.asObservable();

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

  fetchCareerData() {
    this.http.get<CareerData[]>(this.baseUrl + 'career/careerDetail').subscribe(
      (res) => {
        this.careerDataResponse.next(res);
      },
      () => this.displayMessage('Error Occured, Contact System Admin'));
    return this.careerData;
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
      },
      () => this.displayMessage('Error Occured, Contact System Admin')
    );
  }
}
