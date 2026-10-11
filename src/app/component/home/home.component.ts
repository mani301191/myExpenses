
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ExpenseSummaryTableComponent } from '../expense/expense-summary-table/expense-summary-table.component';
import { ExpenseYearlyComponent } from '../expense/expense-yearly/expense-yearly.component';
import { ActivatedRoute } from '@angular/router';
import { ExpenseMonthlyComponent } from '../expense/expense-monthly/expense-monthly.component';

@Component({
    selector: 'app-home',
    imports: [ExpenseSummaryTableComponent, ExpenseYearlyComponent, ExpenseMonthlyComponent],
    templateUrl: './home.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
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
