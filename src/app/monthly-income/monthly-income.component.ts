import { Component} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MonthlyIncome } from './monthly-income';
import { CommonModule } from '@angular/common';
import { ExpenseMonthly } from '../expense-monthly-table/expense-monthly-table';
import { CommonService } from '../common.service';

@Component({
  selector: 'app-monthly-income',
  standalone: true,
  imports: [MatCardModule, MatChipsModule, CommonModule],
  templateUrl: './monthly-income.component.html',
  styleUrl: './monthly-income.component.css'
})
export class MonthlyIncomeComponent {

  selectedDate: Date =new Date();
  incomeData: MonthlyIncome[];
  expenseData: ExpenseMonthly[];
  totalIncome: number;
  totalExpense: number;
  savings: number;

  constructor( private commonService: CommonService) { }

  ngOnInit() {
   
    this.initIncomeData();
    this.topExpenseData();
  }

  initIncomeData() {
    this.commonService.fetchIncomeData(this.selectedDate).subscribe(
        (res) => { 
          this.incomeData=res;
          this.totalIncome = this.incomeData.map(data => data.amount).reduce((a, b) => a+b,0); 
          this.savings = this.totalIncome - this.totalExpense; 
         });
  }

  topExpenseData() {
    this.commonService.fetchExpenseData(this.selectedDate).subscribe(
      (res) => { this.expenseData = res.sort((a,b) => b.amount-a.amount).slice(0,5) 
        this.totalExpense = res.map(data => data.amount).reduce((a, b) => a + b ,0);
        this.savings = this.totalIncome - this.totalExpense;
      }
    );
  }

  deleteRow(data) {
    this.commonService.deleteIncomeRecord(data);
  }
}
