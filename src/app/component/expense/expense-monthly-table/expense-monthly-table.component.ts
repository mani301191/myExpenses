import { ChangeDetectorRef, Component, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ExpenseMonthly } from './expense-monthly-table';
import { MatIconModule } from '@angular/material/icon'
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ExpenseAddComponent } from '../expense-add/expense-add.component';
import { IncomeAddComponent } from '../../income-add/income-add.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { CommonService } from '../../../service/common.service';
import { NgxPrintDirective } from '../../../directive/ngx-print.directive';
import { EstimateAddComponent } from '../estimate-add/estimate-add.component';
import { ExcelServicesService } from '../../../service/export-service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Dropdown } from '../estimate-add/estimate-month';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

@Component({
  selector: 'app-expense-monthly-table',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatIconModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, CommonModule, MatDialogModule, 
    FormsModule,NgxPrintDirective,MatTooltipModule,CanvasJSAngularChartsModule],
  templateUrl: './expense-monthly-table.component.html',
  styleUrl: './expense-monthly-table.component.css',
  providers: [MatDatepickerModule, MatNativeDateModule]

})
export class ExpenseMonthlyTableComponent {
  displayedColumns: string[] = ['expenseDate', 'expenseType', 'expenseOf', 'description', 'amount', 'actionsColumn'];
  dataSource: MatTableDataSource<ExpenseMonthly>;
  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  selectedDate: Date = new Date();
  _snackBar = inject(MatSnackBar);
  readonly dialog = inject(MatDialog);
  expenseDataResponse:ExpenseMonthly[]=[];
  expenseTypes: string[] = ["UnPlanned", "Planned","Investment"]; 
  expenseCategories: Dropdown[] = []; 
  chartOptions: any;
  selectedFile: File | null = null;

  @Output() expenseData = new EventEmitter<ExpenseMonthly[]>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private commonService: CommonService,private cdr: ChangeDetectorRef,
   private excelService:ExcelServicesService,){
  }

  ngOnInit() {
    this.fetchExpenseData();
    this.commonService.plannedExpense(this.selectedDate).subscribe(r=> this.expenseCategories=r);
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
    this.fetchExpenseData()
    this.commonService.fetchIncomeData(this.selectedDate);
    this.commonService.fetchEstimateData(this.selectedDate);
    this.commonService.plannedExpenseStatus(this.selectedDate);
    this.commonService.plannedExpense(this.selectedDate).subscribe(r=> this.expenseCategories=r);

  }

  fetchExpenseData() {
    this.commonService.fetchExpenseData(this.selectedDate).subscribe(
      (res) => { this.dataSource = new MatTableDataSource(res);
        this.expenseDataResponse=res;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort=this.sort;
      }
    );
    this.commonService.dailySummary(this.selectedDate).subscribe((data) => {
      this.initializeChart(data);
    });
  }

  deleteRow(data) {
    this.commonService.deleteRow(data);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialogExpense() {
    this.dialog.open(ExpenseAddComponent).afterClosed().subscribe(()=> {
      this.fetchExpenseData();
      this.commonService.plannedExpenseStatus(this.selectedDate);
     });
  }

  openDialogIncome() {
    this.dialog.open(IncomeAddComponent).afterClosed().subscribe(()=> this.commonService.fetchIncomeData(this.selectedDate));
  }

  openEstimate() {
    this.dialog.open(EstimateAddComponent).afterClosed().subscribe(()=>{ 
      this.commonService.fetchEstimateData(this.selectedDate);
      this.commonService.plannedExpenseStatus(this.selectedDate);
    });
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data.slice();
    if (!sort.active || sort.direction === '') {
      this.dataSource.data = data;
      return;
    }
    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'expenseDate': return this.compare(a.expenseDate, b.expenseDate, isAsc);
        case 'expenseType': return this.compare(a.expenseType, b.expenseType, isAsc);
        case 'expenseOf': return this.compare(a.expenseOf, b.expenseOf, isAsc);
        case 'description': return this.compare(a.description, b.description, isAsc);
        case 'amount': return this.compare(a.amount, b.amount, isAsc);
        default: return 0;
      }
    });
  }

   compare(a: number | string | Date, b: number | string | Date, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

   export() {
     this.expenseDataResponse.sort((a,b) =>{ 
      return  this.convertDate(a.expenseDate.toString()).getTime() > 
      this.convertDate(b.expenseDate.toString()).getTime()? 0 : -1;});
    this.excelService.exportAsExcelFile(this.expenseDataResponse, 'MonthlyExpense-'+
      this.months[this.selectedDate.getMonth()]+this.selectedDate.getFullYear());
  }

    convertDate(dateString) {
      let dateParts = dateString.split("/");
      return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
    }

    enableEdit(element: any): void {
      // Set isEditing to true for the selected row
      element.isEditing = true;
    }

    updateRecord(element: any): void {
      element.isEditing = false;
      this.commonService.updateExpenseDetail(element);
    }
    updateField(row: any, field: string, newValue: any) {
      row[field] = newValue;
      this.commonService.updateExpenseDetail(row);
    }

    initializeChart(data): void {
   
      const dataPoints = data?.map(expense => ({
        label: new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        y: expense.expense
      }));
    
   
      // Chart configuration
      this.chartOptions = {
        animationEnabled: true,
        theme: 'light2',
        height: 500,
        title: {
          text: `Day-Wise Expenses for ${this.months[this.selectedDate.getMonth()]+"-"+this.selectedDate.getFullYear()}`,
          fontSize: 14
        },
        axisX: {
          title: 'Date',
          interval: 1,
          labelFontSize: 12,
          titleFontSize: 12 
        },
        axisY: {
          title: 'Expense (₹)',
          includeZero: true,
          labelFontSize: 12,
          titleFontSize: 12 
        },
        data: [
          {
            type: 'bar',
            dataPoints: dataPoints,
            indexLabel: '₹{y}',
            indexLabelFontSize: 14,
            indexLabelFontWeight: 'bold'
          }
        ]
      };
  
     }

     onFileSelected(event: any) {
      this.selectedFile = event.target.files[0];
    }
    
    uploadStatement() {
      this.commonService.uploadStatement(this.selectedFile).subscribe((data) => {
        this.fetchExpenseData()
      });
    }
}


