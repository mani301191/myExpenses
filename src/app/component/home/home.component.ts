import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ExpenseSummaryTableComponent } from '../expense-summary-table/expense-summary-table.component';
import { ExpenseMonthlyTableComponent } from '../expense-monthly-table/expense-monthly-table.component';
import { MonthlyIncomeComponent } from '../monthly-income/monthly-income.component';
import { ExpenseYearlyComponent } from '../expense-yearly/expense-yearly.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,ExpenseSummaryTableComponent,ExpenseMonthlyTableComponent,
    MonthlyIncomeComponent,ExpenseYearlyComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  selectedNav = 0;
  
  onNavClick(input: number): void {
    this.selectedNav = input;
  }
  
}
