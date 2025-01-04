import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ExpenseMonthly } from './expense-monthly-table/expense-monthly-table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { MonthlyIncome } from './monthly-income/monthly-income';
import { Dropdown, ExpenseStatus, MonthlyEstimate } from './estimate-add/estimate-month';
import { ExpenseSummary } from './expense-summary-table/expense-summary-table';
import { ExpenseYearly } from './expense-yearly/expense-yearly';
import { ProfileData } from './profile-setting/profile-data';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  baseUrl = 'http://localhost:8003/api/';
  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  selectedDate =new Date();
  currentMonth = this.months[this.selectedDate.getMonth()];
  year = this.selectedDate.getFullYear();
  _snackBar = inject(MatSnackBar);
   expenseDataResponse = new BehaviorSubject<ExpenseMonthly[]>([]);
   expenseData = this.expenseDataResponse.asObservable();
   incomeDataResponse = new BehaviorSubject<MonthlyIncome[]>([]);
   expenseSummaryResponse = new BehaviorSubject<ExpenseSummary[]>([]);
   expenseYearlyResponse = new BehaviorSubject<ExpenseYearly[]>([]);
   estimateResponse = new BehaviorSubject<any>({} );
   profileDataResponse = new BehaviorSubject<any>({} );
   dropdownDataResponse = new BehaviorSubject<Dropdown[]>([]);
   expenseStatusResponse =new BehaviorSubject<ExpenseStatus[]>([]);
   incomeData = this.incomeDataResponse.asObservable();
   apiResponse = new BehaviorSubject<any>({} );
  
  constructor(private http: HttpClient) { }

  fetchExpenseData(selectedDate: Date) {
    this.updateSelectedDate(selectedDate);
    let params = new HttpParams();
    params = params.append('month', this.currentMonth);
    params = params.append('year', this.year);
    this.http.get<ExpenseMonthly[]>(this.baseUrl + 'expenseTracker/expenseDetails', { params: params }).subscribe(
      (res) => {
        this.expenseDataResponse.next(res);
      },
      () => this.displayMessage('Error Occured, Contact System Admin')
    );
    return this.expenseData;
  }

  fetchIncomeData(selectedDate: Date) {
    this.updateSelectedDate(selectedDate);
    let params = new HttpParams();
    params = params.append('month', this.currentMonth);
    params = params.append('year', this.year);
    this.http.get<MonthlyIncome[]>(this.baseUrl + 'incomeTracker/incomeDetails', { params: params }).subscribe(
      (res) => {  
        this.incomeDataResponse.next(res); 
       },
      () => this.displayMessage('Error Occured, Contact System Admin'));
      return this.incomeData;
  }

  deleteRow(data) {
    this.http.delete<any>(this.baseUrl + 'expenseTracker/expenseDetail/' + data.expenseId).subscribe(
      (res) => {this.displayMessage(res.message);
        this.fetchExpenseData(this.selectedDate);
        this.plannedExpenseStatus(this.selectedDate);
        this.fetchEstimateData(this.selectedDate);
      },
      () => this.displayMessage('Error Occured, Contact System Admin')
    );
  }

  fetchEstimateData(selectedDate: Date) {
    this.updateSelectedDate(selectedDate);
    let params = new HttpParams();
    params = params.append('month', this.currentMonth);
    params = params.append('year', this.year);
    this.http.get<MonthlyEstimate>(this.baseUrl + 'monthlyTarget', { params: params }).subscribe(
      (res) => {  
        this.estimateResponse.next(res); 
       },
      () => this.displayMessage('Error Occured, Contact System Admin'));
      return this.estimateResponse;
  }

  displayMessage(message: string) {
    this._snackBar.open(message, 'dismiss', {
      verticalPosition: 'top',
      duration: 3000
    })
  }

  updateSelectedDate(selectedDate: Date) {
    this.selectedDate=selectedDate;
    this.currentMonth = this.months[this.selectedDate.getMonth()];
    this.year = this.selectedDate.getFullYear();
  }

  
  deleteIncomeRecord(data) {
    this.http.delete<any>(this.baseUrl + 'incomeTracker/incomeDetail/' + data.incomeId).subscribe(
      (res) => {this.displayMessage(res.message);
        this.fetchIncomeData(this.selectedDate);
      },
      () => this.displayMessage('Error Occured, Contact System Admin')
    );
  }

  fetchSummaryData(selectedDate: Date) {
    this.updateSelectedDate(selectedDate);
    let params = new HttpParams();
    params = params.append('year', this.year);
    this.http.get<ExpenseSummary[]>(this.baseUrl + 'monthlySummary', { params: params }).subscribe(
      (res) => {  
        this.expenseSummaryResponse.next(res); 
       },
      () => this.displayMessage('Error Occured, Contact System Admin'));
      return this.expenseSummaryResponse;
  }

  fetchyearlyData(selectedDate:Date){
   
    let params = new HttpParams();
    if(selectedDate) {
      this.updateSelectedDate(selectedDate);
       params = params.append('year', this.year);
    }
    this.http.get<ExpenseYearly[]>(this.baseUrl + 'yearlySummary', { params: params }).subscribe(
      (res) => {  
        this.expenseYearlyResponse.next(res); 
       },
      () => this.displayMessage('Error Occured, Contact System Admin'));
      return this.expenseYearlyResponse;
  }


  saveProfileData(profileData) {
    this.http.post<ProfileData>(this.baseUrl+'profile/profileDetail',profileData).subscribe(
      () => {
        this.displayMessage('Profile Data created/Updated successfully' ); 
         },
      () => {
        this.displayMessage('Error Occured, Contact System Admin' ); 
       
      });
    }
    
  profileData() {
    this.http.get<ProfileData>(this.baseUrl + 'profile/profileDetail').subscribe(
      (res) => {
        this.profileDataResponse.next(res);
      },
      () => {
        this.displayMessage('Error Occured, Contact System Admin');
      });
    return this.profileDataResponse;
  }

  saveEstimateData(data){
  this.http.post<any>(this.baseUrl+'monthlyTarget',data).subscribe(
    () =>{
      this. displayMessage('Record created Successfully ');
    },
     () => {
     this. displayMessage('Error Occured, Contact System Admin');
    });
  } 

  cloneEstimateData(selectedDate: Date){
    this.updateSelectedDate(selectedDate);
    let params = new HttpParams();
    params = params.append('month', this.currentMonth);
    params = params.append('year', this.year);
    this.http.get<any>(this.baseUrl+'monthlyTarget/clone',{ params: params }).subscribe(
      (res) =>{
        this. displayMessage('Record created Successfully ');
        this.estimateResponse.next(res); 
      },
       () => {
       this. displayMessage('Error Occured, Contact System Admin');
      });
      return this.estimateResponse;
    } 

  deleteMonthlyTargetData(data) {
    this.http.delete<any>(this.baseUrl + 'monthlyTarget/' + data.id).subscribe(
      (res) => {this.displayMessage(res.message);
        this.fetchEstimateData(this.selectedDate);
      },
      () => this.displayMessage('Error Occured, Contact System Admin')
    );
  }

  plannedExpense(selectedDate:Date) {
    this.updateSelectedDate(selectedDate);
    let params = new HttpParams();
    params = params.append('month', this.currentMonth);
    params = params.append('year', this.year);
    this.http.get<Dropdown[]>(this.baseUrl + 'plannedExpense', { params: params }).subscribe(
      (res) => {
        this.dropdownDataResponse.next(res);
      },
      () => {
        this.displayMessage('Error Occured, Contact System Admin');
      });
    return this.dropdownDataResponse;
  }

  plannedExpenseStatus(selectedDate:Date) {
    this.updateSelectedDate(selectedDate);
    let params = new HttpParams();
    params = params.append('month', this.currentMonth);
    params = params.append('year', this.year);
    this.http.get<ExpenseStatus[]>(this.baseUrl + 'monthlyStatus', { params: params }).subscribe(
      (res) => {
        this.expenseStatusResponse.next(res);
      },
      () => {
        this.displayMessage('Error Occured, Contact System Admin');
      });
    return this.expenseStatusResponse;
  }

  addExpenseDetail(expenseData) {
    this.http.post<any>(this.baseUrl + 'expenseTracker/expenseDetail', expenseData).subscribe(
      (res) => {
        this.displayMessage('Record added sucessfully - ID :' + res.expenseId);
        this.apiResponse.next(res);
      },
      () => {
        this.displayMessage('Error Occured, Contact System Admin');
      }
    );
    return this.apiResponse;
  } 

  addIncomeDetail(inputData) {
    this.http.post<any>(this.baseUrl + 'incomeTracker/incomeDetail', inputData).subscribe(
      (res) => {
        this.displayMessage('Record created Successfully, Id : ' + res.incomeId);
        this.apiResponse.next(res);
      },
      () => {
        this.displayMessage('Error Occured, Contact System Admin');
      });
    return this.apiResponse;
  }

  getFormattedDate(date) {
    let day = ('0' + date.getDate()).slice(-2);
    let month = date.getMonth() + 1;
    return day + '/' + month + '/' +  date.getFullYear();
}

}
