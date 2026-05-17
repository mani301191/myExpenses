import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ExpenseSummaryTableComponent } from '../expense/expense-summary-table/expense-summary-table.component';
import { ExpenseMonthlyTableComponent } from '../expense/expense-monthly-table/expense-monthly-table.component';
import { ExpenseYearlyComponent } from '../expense/expense-yearly/expense-yearly.component';
import { ActivatedRoute } from '@angular/router';
import { ExpenseMonthlyComponent } from '../expense/expense-monthly/expense-monthly.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,ExpenseSummaryTableComponent,ExpenseMonthlyTableComponent,
    ExpenseYearlyComponent,ExpenseMonthlyComponent],
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
