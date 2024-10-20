import { Component } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';
import { MonthlyIncome } from './monthly-income';
import { CommonModule } from '@angular/common';
import { ExpenseMonthly } from '../expense-monthly-table/expense-monthly-table';

@Component({
  selector: 'app-monthly-income',
  standalone: true,
  imports: [MatCardModule,MatChipsModule,CommonModule],
  templateUrl: './monthly-income.component.html',
  styleUrl: './monthly-income.component.css'
})
export class MonthlyIncomeComponent {

  incomeData : MonthlyIncome [];
  expenseData : ExpenseMonthly[];
  totalIncome: number;
  totalExpense:number;
  savings:number;

  ngOnInit() {
    this.initIncomeData();
    this.topExpenseData();
    this.incomeExpenseData();
  }

  initIncomeData() {
    let incomeData: MonthlyIncome[] = [
      {  incomeDate: new Date("2024-09-01"), source:"Salary ", amount: 75000 },
      {  incomeDate: new Date("2024-09-01"), source:"Bank Intrest ", amount: 3000 }
      ];
      this.incomeData=incomeData;
  }

  topExpenseData(){
    let expenseData: ExpenseMonthly[] = [
      { year: 2024, month: 'September', expenseDate: new Date("2024-09-25"), amount: 23.05,expenseType:'Planned',expenseOf:'Common',description:'General purchase' },
      { year: 2024, month: 'September', expenseDate: new Date("2024-09-02"), amount: 5000,expenseType:'Planned',expenseOf:'Manikandan',description:'Zerodha' },
      { year: 2024, month: 'September', expenseDate: new Date("2024-09-08"), amount: 500,expenseType:'Planned',expenseOf:'Manikandan',description:'RE Petrol' },
      { year: 2024, month: 'September', expenseDate: new Date("2024-09-27"), amount: 4567,expenseType:'Planned',expenseOf:'Common',description:'BigBasket Groceries' },
      { year: 2024, month: 'September', expenseDate: new Date("2024-09-25"), amount: 230,expenseType:'Planned',expenseOf:'Common',description:'TataSky Recharge' },
      { year: 2024, month: 'September', expenseDate: new Date("2024-09-25"), amount: 6000,expenseType:'Planned',expenseOf:'Radha',description:'Monthly Expenses' }
    ];

    this.expenseData = expenseData;
  } 

  incomeExpenseData(){
  this.totalIncome = this.incomeData.map(data => data.amount).reduce((a, b) => a+b);
  this.totalExpense =  this.expenseData.map(data => data.amount).reduce((a, b) => a+b);
  this.savings = this.totalIncome - this.totalExpense;
  }
}
