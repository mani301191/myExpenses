import { Component } from '@angular/core';
import { MonthlyIncomeComponent } from '../../monthly-income/monthly-income.component';
import { ExpenseMonthlyTableComponent } from '../expense-monthly-table/expense-monthly-table.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expense-monthly',
  standalone: true,
  imports: [CommonModule, MonthlyIncomeComponent,ExpenseMonthlyTableComponent],
  templateUrl: './expense-monthly.component.html',
  styleUrl: './expense-monthly.component.css'
})
export class ExpenseMonthlyComponent {

}
