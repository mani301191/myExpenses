import {AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Output, ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ExpenseSummary } from './expense-summary-table';
import { MatIconModule } from '@angular/material/icon';
import { CommonService } from '../common.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPrintDirective } from '../ngx-print.directive';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

/**
 * @title Data table with sorting, pagination, and filtering.
 */
@Component({
  selector: 'app-expense-summary-table',
  templateUrl: './expense-summary-table.component.html',
  styleUrl: './expense-summary-table.component.css',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatIconModule,MatDatepickerModule,MatNativeDateModule,CommonModule,FormsModule,NgxPrintDirective,
    CanvasJSAngularChartsModule],
})
export class ExpenseSummaryTableComponent {
  displayedColumns: string[] = ['year', 'month', 'income', 'expense','estimated','savings','actionsColumn'];
  dataSource: MatTableDataSource<ExpenseSummary>;
  selectedDate: Date = new Date();
  chartOptions : any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private commonService: CommonService,private cdr: ChangeDetectorRef) {
   
  }
  fetchSummaryData() {
    this.commonService.fetchSummaryData(this.selectedDate).subscribe(
      (res) => { this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort=this.sort;
        this.chartData(this.dataSource.data);
      }
    );
  }

  ngOnInit(): void {
    this.fetchSummaryData();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort; 
  }
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  openDatePicker(dp) {
    dp.open();
  }

  closeDatePicker(eventData: any, dp?: any) {
    // get month and year from eventData and close datepicker, thus not allowing user to select date
    this.selectedDate = eventData;
    dp.close();
    this.fetchSummaryData()
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  chartData(data : ExpenseSummary[]) : void {
    this.chartOptions = {
      toolTip: {
        shared: true
      },
      axisY: {
        title: "Estimate",
      },
      axisY2: {
        title: "Expense",
      },
      exportFileName:'Expense summary',
      exportEnabled: true,
      
      data: [
        {
          type: 'column',
          name: "Estimate",
          legendText: "Estimate",
          showInLegend: true,
          dataPoints: data.slice(0, 6).map((x) => {
            return  {label:x.month, y:+x.estimated }   
             }),
             indexLabelFormatter: function (e) {
              return '₹'+e.dataPoint.y ;
              }
        },
        {
          type: "column",	
          name: "Expense",
          legendText: "Expense",
          // axisYType: "secondary",
          showInLegend: true,
          dataPoints:data.slice(0, 6).map((x) => {
            return  {label:x.month, y:x.expense }   
             }
            ),
            indexLabelFormatter: function (e) {
              return '₹'+e.dataPoint.y ;
              }
          }
      ],
    };
  }
}

