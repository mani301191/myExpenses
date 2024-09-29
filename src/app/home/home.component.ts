import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ExpenseSummaryTableComponent } from '../expense-summary-table/expense-summary-table.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,ExpenseSummaryTableComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  selectedNav = 0;

  onNavClick(input: number): void {
    this.selectedNav = input;
  }
}
