import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ExpenseSummary } from './expense-summary-table';

const summaryData: ExpenseSummary[] = [
  { year: 2024, month: 'March', income: 298, expense: 23,savings:4 },
  { year: 2024, month: 'April', income: 400, expense: 654,savings:5 },
  { year: 2024, month: 'May', income: 69, expense: 75,savings:-44 },
  { year: 2024, month: 'June', income: 901, expense: 866,savings:4 },
  { year: 2024, month: 'July', income: 108, expense: 77,savings:6 },
  { year: 2024, month: 'August', income: 120, expense: 33,savings:6 },
  { year: 2024, month: 'September', income: 110, expense: 22,savings:6 }
];
/**
 * @title Data table with sorting, pagination, and filtering.
 */
@Component({
  selector: 'app-expense-summary-table',
  templateUrl: './expense-summary-table.component.html',
  styleUrl: './expense-summary-table.component.css',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule],
})
export class ExpenseSummaryTableComponent implements AfterViewInit {
  displayedColumns: string[] = ['year', 'month', 'income', 'expense','savings'];
  dataSource: MatTableDataSource<ExpenseSummary>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor() {
  
    // Assign the data to the data source for the table to render
    summaryData.map((x) => {
      x.savings = x.income-x.expense;
      return x;
    });
    this.dataSource = new MatTableDataSource(summaryData);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}

