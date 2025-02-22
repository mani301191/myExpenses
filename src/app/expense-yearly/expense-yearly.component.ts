import { Component } from '@angular/core';
import { ExpenseYearly } from './expense-yearly';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { CommonService } from '../common.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { NgxPrintDirective } from '../ngx-print.directive';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-expense-yearly',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule,
    CommonModule, CanvasJSAngularChartsModule,MatDatepickerModule,MatNativeDateModule,FormsModule,
    NgxPrintDirective,MatIconModule,MatTooltipModule],
  templateUrl: './expense-yearly.component.html',
  styleUrl: './expense-yearly.component.css'
})
export class ExpenseYearlyComponent {
  displayedColumns: string[] = ['year', 'expense', 'income', 'savings','estimated','planned','unPlanned','investment'];
  dataSource: MatTableDataSource<ExpenseYearly>;
  chartOptions: any;
  selectedDate: Date = new Date();

  constructor(private commonService: CommonService) {

  }

  ngOnInit() {
    this.loadYearlyData(null);
  }

 loadYearlyData(selectedDate: Date) {
  this.commonService.fetchyearlyData(selectedDate).subscribe(
    (res) => { 
      this.dataSource = new MatTableDataSource(res);
      this.chartData();
    }
  );
}

  openDatePicker(dp) {
    dp.open();
  }

  closeDatePicker(eventData: any, dp?: any) {
    // get month and year from eventData and close datepicker, thus not allowing user to select date
    this.selectedDate = eventData;
    dp.close();
    this.loadYearlyData(this.selectedDate);
  }

  chartData(): void {
    this.chartOptions = {
      title: {
        text: 'Yearly Expenses : '+  this.selectedDate.getFullYear(),
      },
      toolTip: {
        shared: true
      },
      width: 300,
      height: 200,
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

  printYearlyData() {
    window.print();
}

}
