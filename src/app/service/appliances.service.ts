import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { AppliancesData } from '../component/appliances/appliances-data';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppliancesService extends BaseService {

  appliancesDataResponse = new BehaviorSubject<AppliancesData[]>([]);
  appliancesData = this.appliancesDataResponse.asObservable();

  constructor(private http: HttpClient) {
    super();
  }

  saveAppliancesData(appliancesData) {
    if (appliancesData.amcEndDate) {
      appliancesData.amcEndDate = this.getFormattedDate(appliancesData.amcEndDate);
    }
    if (appliancesData.lastServicedDate) {
      appliancesData.lastServicedDate = this.getFormattedDate(appliancesData.lastServicedDate);
    }
    this.http.post<AppliancesData[]>(this.baseUrl + 'appliances/appliancesDetail', appliancesData).subscribe(
      () => {
        this.displayMessage('Appliances Data created successfully');
        this.fetchAppliancesData();
      },
      () => {
        this.displayMessage('Error Occured, Contact System Admin');
      });
  }

  fetchAppliancesData() {
    this.http.get<AppliancesData[]>(this.baseUrl + 'appliances/appliancesDetail').subscribe(
      (res) => {
        this.appliancesDataResponse.next(res);
      },
      () => this.displayMessage('Error Occured, Contact System Admin'));
    return this.appliancesData;
  }

  updateAppliances(data) {
    if (data.amcEndDate != null && data.amcEndDate.toString().length > 10) {
      data.amcEndDate = this.getFormattedDate(data.amcEndDate);
    }
    if (data.lastServicedDate != null && data.lastServicedDate.toString().length > 10) {
      data.lastServicedDate = this.getFormattedDate(data.lastServicedDate);
    }
    this.http.patch<any>(this.baseUrl + 'appliances/appliancesDetail', data).subscribe(
      (res) => {
        this.displayMessage(res.message);
        this.fetchAppliancesData();
      },
      () => this.displayMessage('Error Occured, Contact System Admin')
    );
  }

  deleteRow(data) {
    this.http.delete<any>(this.baseUrl + 'appliances/' + data.appliancesId).subscribe(
      (res) => {
        this.displayMessage(res.message);
        this.fetchAppliancesData();
      },
      () => this.displayMessage('Error Occured, Contact System Admin')
    );
  }
}
