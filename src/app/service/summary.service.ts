import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { DashboardData } from '../dashboard/dashboard';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SummaryService extends BaseService {

  dashboardDataResponse = new BehaviorSubject<DashboardData>({
    expenseTrackingData: {
      income: 0,
      estimate: 0,
      expense: 0,
      currentMonth: ''
    },
    fitnessData: [],
    insuranceData: [],
    assetData: [],
    dayWiseExpenses: []
  });
  dashboardData = this.dashboardDataResponse.asObservable();

  constructor(private http: HttpClient) {
    super();
  }

  fetchDashboardData() {
    this.http.get<DashboardData>(this.baseUrl + 'summary').subscribe(
      (res) => {
        this.dashboardDataResponse.next(res);
      },
      () => this.displayMessage('Error Occured, Contact System Admin'));
    return this.dashboardData;
  }
}
