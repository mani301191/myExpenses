import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ExpenseMonthly } from './expense-monthly-table/expense-monthly-table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { MonthlyIncome } from './monthly-income/monthly-income';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  baseUrl = 'http://localhost:8003/api/expenseTracker';
  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  selectedDate =new Date();
  currentMonth = this.months[this.selectedDate.getMonth()];
  year = this.selectedDate.getFullYear();
  _snackBar = inject(MatSnackBar);
   expenseDataResponse = new BehaviorSubject<ExpenseMonthly[]>([]);
   expenseData = this.expenseDataResponse.asObservable();
   incomeDataResponse = new BehaviorSubject<MonthlyIncome[]>([]);
   incomeData = this.incomeDataResponse.asObservable();
  
  constructor(private http: HttpClient) { }

  fetchExpenseData(selectedDate: Date) {
    this.updateSelectedDate(selectedDate);
    let params = new HttpParams();
    params = params.append('month', this.currentMonth);
    params = params.append('year', this.year);
    this.http.get<ExpenseMonthly[]>(this.baseUrl + '/expenseDetails', { params: params }).subscribe(
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
    this.http.get<MonthlyIncome[]>(this.baseUrl + '/incomeDetails', { params: params }).subscribe(
      (res) => {  
        this.incomeDataResponse.next(res); 
       },
      () => this.displayMessage('Error Occured, Contact System Admin'));
      return this.incomeData;
  }

  deleteRow(data) {
    this.http.delete<any>(this.baseUrl + '/expenseDetail/' + data.expenseId).subscribe(
      (res) => {this.displayMessage(res.message);
        this.fetchExpenseData(this.selectedDate);
      },
      () => this.displayMessage('Error Occured, Contact System Admin')
    );
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
    this.http.delete<any>(this.baseUrl + '/incomeDetail/' + data.incomeId).subscribe(
      (res) => {this.displayMessage(res.message);
        this.fetchIncomeData(this.selectedDate);
      },
      () => this.displayMessage('Error Occured, Contact System Admin')
    );
  }
}