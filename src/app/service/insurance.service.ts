import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { InsuranceData } from '../component/insurance/insurance-data';
import { BehaviorSubject } from 'rxjs';
import { DropDownData } from '../config-data';

@Injectable({
  providedIn: 'root'
})
export class InsuranceService extends BaseService {

  insuranceDataResponse = new BehaviorSubject<InsuranceData[]>([]);
  insuranceData = this.insuranceDataResponse.asObservable();
  insuranceTypesResponse = new BehaviorSubject<DropDownData[]>([]);
  insuranceTypes = this.insuranceTypesResponse.asObservable();

  constructor(private http: HttpClient) {
    super();
  }


  saveInsuranceData(insuranceData) {
    if (insuranceData.startDate) {
      insuranceData.startDate = this.getFormattedDate(insuranceData.startDate);
    }
    if (insuranceData.endDate) {
      insuranceData.endDate = this.getFormattedDate(insuranceData.endDate);
    }
    this.http.post<InsuranceData>(this.baseUrl + 'insurance/insuranceDetail', insuranceData).subscribe(
      () => {
        this.displayMessage('Insurance Data created successfully');
        this.fetchInsuranceData();
      },
      () => {
        this.displayMessage('Error Occured, Contact System Admin');
      });
  }

  fetchInsuranceData() {
    this.http.get<InsuranceData[]>(this.baseUrl + 'insurance/insuranceDetails').subscribe(
      (res) => {
        this.insuranceDataResponse.next(res);
      },
      () => this.displayMessage('Error Occured, Contact System Admin'));
    return this.insuranceData;
  }

  deleteRow(data) {
    this.http.delete<any>(this.baseUrl + 'insurance/' + data.insuranceId).subscribe(
      (res) => {
        this.displayMessage(res.message);
        this.fetchInsuranceData();
      },
      () => this.displayMessage('Error Occured, Contact System Admin')
    );
  }

  fetchInsuranceTypeDropdownData() {
    this.http.get<any>(this.baseUrl + '/config/dropDown?key=InsurenceType').subscribe(
      (res) => {
        this.insuranceTypesResponse.next(res);
      },
      () => this.displayMessage('Error Occured, Contact System Admin'));
    return this.insuranceTypes;
  }
}
