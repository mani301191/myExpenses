import { Component, OnInit, ViewChild } from '@angular/core';
import { ExpenseYearly, MonthlyExpByCatagory } from './expense-yearly';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { CommonService } from '../../../service/common.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { NgxPrintDirective } from '../../../directive/ngx-print.directive';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { InrFormatPipe } from '../../../pipes/indian-currency.pipe';

@Component({
  selector: 'app-expense-yearly',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule,
    CommonModule, CanvasJSAngularChartsModule, MatDatepickerModule, MatNativeDateModule, FormsModule,
    NgxPrintDirective, MatIconModule, MatTooltipModule, MatSortModule, InrFormatPipe],
  templateUrl: './expense-yearly.component.html',
  styleUrl: './expense-yearly.component.css'
})
export class ExpenseYearlyComponent implements OnInit {
  displayedColumns: string[] = ['year', 'expense', 'income', 'savings', 'estimated', 'planned', 'unPlanned', 'investment'];
  dataSource: MatTableDataSource<ExpenseYearly>;
  chartOptions: any;
  selectedDate: Date = new Date();
  monthlyDataSource: MatTableDataSource<MonthlyExpByCatagory>;
  @ViewChild('summarySort') summarySort: MatSort;
  @ViewChild('monthlySort') monthlySort: MatSort;
  // Define the months
  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  showMonthlyTable: boolean = false;

  // Define the displayed columns
  displayedMonthlyColumns: string[] = ['category', ...this.months, 'total'];

  constructor(private commonService: CommonService) {
  }

  ngOnInit() {
    this.loadYearlyData(null);
  }

  toggleTable() {
    this.showMonthlyTable = !this.showMonthlyTable;
    if (this.showMonthlyTable) {
      this.commonService.fetchMonthlyExpByCatagory(this.selectedDate).subscribe((res) => {
        res.forEach(row => {
          row.total = this.months.reduce((sum, month) => sum + (row[month] || 0), 0);
        });
        this.monthlyDataSource = new MatTableDataSource(res);
        this.monthlyDataSource.sort = this.monthlySort;
      });
    } else {
      this.loadYearlyData(null);
    }
  }

  loadYearlyData(selectedDate: Date) {
    this.commonService.fetchyearlyData(selectedDate).subscribe(
      (res) => {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.sort = this.summarySort;
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
        text: 'Yearly Expenses : ' + this.selectedDate.getFullYear(),
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
    const printContent = document.getElementById('printableCatTable'); // ID of the table container
    const printSummaryContent = document.getElementById('printableSummaryTable');
    const chartCanvas = document.getElementsByTagName("canvas")[0]; // Get the chart canvas element

    if (chartCanvas) {
      const chartImage = chartCanvas.toDataURL("image/png"); // Convert the chart to a base64 image
      const WindowPrt = window.open('', '', 'width=900,height=650');
      const currentDate = new Date().toISOString().split('T')[0];
      const title = this.showMonthlyTable ? 'Yearly Summary by Category' : 'Yearly Summary';
      WindowPrt.document.write(`
        <html>
          <head>
            <title> ${title}-${currentDate}</title>
            <style>
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                border: 1px solid #ccc;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
              }
              h3 {
                text-align: center;
                color: #075068f8 !important;
                font-size: 20px !important;
              }
              table {
                border: 1px solid #075068f8 !important;
              }
              .tableHeader {
                color: #fff !important;
                background-color: #76a8b8f8 !important;
              }
                .chart-container {
              text-align: center; /* Center-align the chart */
              margin-top: 20px; /* Optional: Add spacing above the chart */
            }
            .chart {
              display: inline-block; /* Ensure the chart is treated as a block element */
              max-width: 100%; /* Optional: Ensure the chart scales properly */
              height: auto; /* Maintain aspect ratio */
            }
            </style>
          </head>
          <body>
            <h3>Yearly Expense Report</h3>
            ${printSummaryContent?.innerHTML || ''}
            ${printContent?.innerHTML || ''}
            <div class="chart-container">
            <img src="${chartImage}" alt="chart" class="chart" />
            </div>
            <div> &copy; Manikandan Narasimhan (2024 - 2030)</div>
          </body>
        </html>
      `);
      WindowPrt.document.close();
      WindowPrt.focus();
      WindowPrt.print();
      WindowPrt.close();
    } else {
      console.error("Chart canvas not found!");
    }
  }

}
