import { Component} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MonthlyIncome } from './monthly-income';
import { CommonModule } from '@angular/common';
import { ExpenseMonthly } from '../expense-monthly-table/expense-monthly-table';
import { CommonService } from '../common.service';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@Component({
  selector: 'app-monthly-income',
  standalone: true,
  imports: [MatCardModule, MatChipsModule, CommonModule, MatProgressBarModule],
  templateUrl: './monthly-income.component.html',
  styleUrl: './monthly-income.component.css'
})
export class MonthlyIncomeComponent {
  selectedDate: Date =new Date();
  incomeData: MonthlyIncome[];
  expenseData: ExpenseMonthly[];
  totalIncome: number;
  totalExpense: number;
  estimate:number;
  savings: number;
  message:string;
  progress: number = 0;

  constructor( private commonService: CommonService) { }

  ngOnInit() {
    this.estimateData();
    this.initIncomeData();
    this.topExpenseData();

  }

  initIncomeData() {
    this.commonService.fetchIncomeData(this.selectedDate).subscribe(
        (res) => { 
          this.incomeData=res;
          this.totalIncome = this.incomeData.map(data => data.amount).reduce((a, b) => a+b,0); 
          this.savings = this.totalIncome - this.totalExpense; 
          this.setMessage();
         });
  }

  topExpenseData() {
    this.commonService.fetchExpenseData(this.selectedDate).subscribe(
      (res) => { this.expenseData = res.sort((a,b) => b.amount-a.amount).slice(0,5) 
        this.totalExpense = res.map(data => data.amount).reduce((a, b) => a + b ,0);
        this.savings = this.totalIncome - this.totalExpense;
        this.setMessage();
      }
    );
  }
  estimateData() {
    this.commonService.fetchEstimateData(this.selectedDate).subscribe(
      (res) => { 
        this.estimate=res.amount;
        this.setMessage();
      }
    );
  }

  deleteRow(data) {
    this.commonService.deleteIncomeRecord(data);
  }

  setMessage() {
    if(this.estimate  && this.totalExpense) {
    this.message = (this.estimate >= this.totalExpense) ? "On Track" : " Exceeded";
    this.progress= this.totalExpense/this.estimate * 100;
    }
  }

  updateColor(progress) {
    if (progress<50){
       return 'primary';
    } else if (progress>80){
       return 'accent';
    } else {
      return 'warn';
    }
 }
}
