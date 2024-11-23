import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ExpenseSummaryTableComponent } from '../expense-summary-table/expense-summary-table.component';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { ExpenseSummary } from '../expense-summary-table/expense-summary-table';
import { ExpenseMonthlyTableComponent } from '../expense-monthly-table/expense-monthly-table.component';
import { MonthlyIncomeComponent } from '../monthly-income/monthly-income.component';
import { ExpenseYearlyComponent } from '../expense-yearly/expense-yearly.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,ExpenseSummaryTableComponent,ExpenseMonthlyTableComponent,CanvasJSAngularChartsModule,
    MonthlyIncomeComponent,ExpenseYearlyComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  selectedNav = 0;
  chartOptions : any;
  
  onNavClick(input: number): void {
    this.selectedNav = input;
  }

  chartData(data : ExpenseSummary[]) : void {
    this.chartOptions = {
      title: {
        text: 'Last 6 Months',
      },
      toolTip: {
        shared: true
      },
      axisY: {
        title: "Income",
      },
      axisY2: {
        title: "Expense",
      },
      data: [
        {
          type: 'column',
          name: "Income",
          legendText: "Income",
          showInLegend: true,
          dataPoints: data.slice(0, 6).map((x) => {
            return  {label:x.month, y:x.income }   
             }),
        },
        {
          type: "column",	
          name: "Expense",
          legendText: "Expense",
          // axisYType: "secondary",
          showInLegend: true,
          dataPoints:data.slice(0, 6).map((x) => {
            return  {label:x.month, y:x.expense }   
             })
          }
      ],
    };
  }
}
