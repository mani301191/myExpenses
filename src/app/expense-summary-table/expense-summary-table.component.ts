import {AfterViewInit, Component, EventEmitter, Output, ViewChild} from '@angular/core';
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

/**
 * @title Data table with sorting, pagination, and filtering.
 */
@Component({
  selector: 'app-expense-summary-table',
  templateUrl: './expense-summary-table.component.html',
  styleUrl: './expense-summary-table.component.css',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule,
    MatIconModule,MatDatepickerModule,MatNativeDateModule,CommonModule,FormsModule],
})
export class ExpenseSummaryTableComponent {
  displayedColumns: string[] = ['year', 'month', 'income', 'expense','estimated','savings'];
  dataSource: MatTableDataSource<ExpenseSummary>;
  selectedDate: Date = new Date();

  @Output() expenseData = new EventEmitter<ExpenseSummary[]>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private commonService: CommonService) {
   
  }
  fetchSummaryData() {
    this.commonService.fetchSummaryData(this.selectedDate).subscribe(
      (res) => { this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort=this.sort;
         this.expenseData.emit(this.dataSource.data);
      }
    );
  }

  ngOnInit(): void {
    this.fetchSummaryData();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort; 
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
}

