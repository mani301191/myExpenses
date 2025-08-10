import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ExpenseSummaryTableComponent } from '../expense-summary-table/expense-summary-table.component';
import { ExpenseMonthlyTableComponent } from '../expense-monthly-table/expense-monthly-table.component';
import { MonthlyIncomeComponent } from '../monthly-income/monthly-income.component';
import { ExpenseYearlyComponent } from '../expense-yearly/expense-yearly.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,ExpenseSummaryTableComponent,ExpenseMonthlyTableComponent,
    MonthlyIncomeComponent,ExpenseYearlyComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  selectedView: 'summary' | 'monthly' | 'yearly' = 'summary';
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.selectedView= 'summary'; // Default view
    // Subscribe to query param changes
    this.route.queryParams.subscribe(params => {
      const view = params['view'] as 'summary' | 'monthly' | 'yearly';
      if (view === 'summary' || view === 'monthly' || view === 'yearly') {
        this.selectedView = view;
      } else {
        this.selectedView = 'summary';
      }
    });
  }
}
