import {AfterViewInit, Component, EventEmitter, inject, Output, ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ExpenseMonthly } from './expense-monthly-table';
import {MatIconModule} from '@angular/material/icon'
import { MatSelectModule } from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { DateRangeComponent } from '../date-range/date-range.component';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import { ExpenseAddComponent } from '../expense-add/expense-add.component';


let expenseData: ExpenseMonthly[] = [
  { year: 2024, month: 'September', expenseDate: new Date("2024-09-25"), amount: 23.05,expenseType:'Planned',expenseOf:'Common',description:'General purchase' },
  { year: 2024, month: 'September', expenseDate: new Date("2024-09-02"), amount: 5000,expenseType:'Planned',expenseOf:'Manikandan',description:'Zerodha' },
  { year: 2024, month: 'September', expenseDate: new Date("2024-09-08"), amount: 500,expenseType:'Planned',expenseOf:'Manikandan',description:'RE Petrol' },
  { year: 2024, month: 'September', expenseDate: new Date("2024-09-27"), amount: 4567,expenseType:'Planned',expenseOf:'Common',description:'BigBasket Groceries' },
  { year: 2024, month: 'September', expenseDate: new Date("2024-09-25"), amount: 230,expenseType:'Planned',expenseOf:'Common',description:'TataSky Recharge' },
  { year: 2024, month: 'September', expenseDate: new Date("2024-09-25"), amount: 6000,expenseType:'Planned',expenseOf:'Radha',description:'Monthly Expenses' },
  { year: 2024, month: 'September', expenseDate: new Date("2024-09-21"), amount: 230,expenseType:'UnPlanned',expenseOf:'Akshara',description:'Toys' },
  { year: 2024, month: 'September', expenseDate: new Date("2024-09-21"), amount: 1200,expenseType:'UnPlanned',expenseOf:'Common',description:'Outing' }
];

@Component({
  selector: 'app-expense-monthly-table',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule,MatIconModule,
    MatSelectModule,MatDatepickerModule,MatNativeDateModule,CommonModule,DateRangeComponent,MatDialogModule ],
  templateUrl: './expense-monthly-table.component.html',
  styleUrl: './expense-monthly-table.component.css',
  providers:[MatDatepickerModule,MatNativeDateModule]

})
export class ExpenseMonthlyTableComponent implements AfterViewInit {
  displayedColumns: string[] = ['expenseDate', 'expenseType', 'expenseOf','description', 'amount','actionsColumn'];
  dataSource: MatTableDataSource<ExpenseMonthly>;
  startDate:Date= new Date();
  endDate:Date= new Date();
  readonly dialog = inject(MatDialog);

  @Output() expenseData = new EventEmitter<ExpenseMonthly[]>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor() {
  
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(expenseData);
   
  }

  deleteRow(data){
    this.dataSource.data= expenseData.filter(arrayItem => arrayItem !== data);
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

  myFilter(d: Date): boolean {
		const day = d.getDay();
    const month = d.getMonth();
		const todays_date = d.getDate();
		const todaysDateObject = new Date();
		const today = todaysDateObject.getDate();
    const actualMonth = todaysDateObject.getMonth();

    	/** Prevent actual system date from being selected.*/
    if (month === actualMonth && todays_date === today) {
      return false;
    } else if (day !== 0 && day !== 6) {
      return true;
    } else {
      return false;
    }
  	}

    selectedDateRange(selectedRange): void {
      this.startDate= selectedRange.value.start;
      this.endDate= selectedRange.value.end;
    }
 
    openDialogExpense() {
      const dialogRef = this.dialog.open(ExpenseAddComponent);

      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog result: ${result}`);
      });
    }
}


