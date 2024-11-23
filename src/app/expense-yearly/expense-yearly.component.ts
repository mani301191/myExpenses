import { Component } from '@angular/core';
import { ExpenseYearly } from './expense-yearly';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { CommonService } from '../common.service';

// let expenseData: ExpenseYearly[] = [
//   { year: 2022, amount: 1827530, incomeAmount: 1909875, savings: 56789 },
//   { year: 2023, amount: 1986550, incomeAmount: 2087654, savings: 786543 },
//   { year: 2024, amount: 2345670, incomeAmount: 1909875, savings: 234553 },
// ];
// let expenseDataWithCategory: ExpenseYearly[] = [
//   { year: 2022, amount: 809876, expenseType: 'Planned', incomeAmount: 2345566, savings: 56789 },
//   { year: 2022, amount: 309935, expenseType: 'UnPlanned', incomeAmount: 3456789, savings: 98877 },
//   { year: 2022, amount: 605434, expenseType: 'Investment', incomeAmount: 4322222, savings: 56789 }
// ];
@Component({
  selector: 'app-expense-yearly',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule,
    CommonModule, CanvasJSAngularChartsModule],
  templateUrl: './expense-yearly.component.html',
  styleUrl: './expense-yearly.component.css'
})
export class ExpenseYearlyComponent {
  displayedColumns: string[] = ['year', 'expense', 'income', 'savings','estimated','planned','unPlanned','investment'];
  dataSource: MatTableDataSource<ExpenseYearly>;
  chartOptions: any;
  constructor(private commonService: CommonService) {

  }

  ngOnInit() {
    this.commonService.fetchyearlyData().subscribe(
      (res) => { 
        this.dataSource = new MatTableDataSource(res);
        this.chartData();
      }
    );
    
  }

  chartData(): void {
    this.chartOptions = {
      title: {
        text: 'Yearly Expenses : '+ this.dataSource?.data[0]?.year,
      },
      toolTip: {
        shared: true
      },
      data: [
        {
          type: 'pie',
          startAngle: 240,
          indexLabel: "{label} {y}",
          dataPoints:
          this.dataSource?.data[0]?.category.map((x) => {
              return { label: x.expenseType, y: x.amount }
            })
        }
      ],
    };
  }
}
