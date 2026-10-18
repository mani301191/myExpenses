import { Component, ViewChild, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxPrintDirective } from '../../directive/ngx-print.directive';
import { InsuranceData } from './insurance-data';
import { InsuranceService } from '../../service/insurance.service';
import { InsuranceAddComponent } from './insurance-add.component';

@Component({
    selector: 'app-insurance',
    imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatIconModule, MatSelectModule, FormsModule, NgxPrintDirective, MatDatepickerModule, MatNativeDateModule, MatTooltipModule, MatDialogModule],
    templateUrl: './insurance.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './insurance.component.css'
})
export class InsuranceComponent {

  displayedColumns: string[] = ['insuranceType', 'insuranceProvider', 'policyNumber', 'nominee', 'startDate', 'endDate','additionalDetails', 'actionsColumn'];
  readonly currentDate = new Date();
  activeInsuranceData: any;
  dataSource: MatTableDataSource<InsuranceData>;

  readonly dialog = inject(MatDialog);

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private insuranceService: InsuranceService) {
  }

  ngOnInit() {
    this.fetchInsuranceData();
  }

  openAddDialog(): void {
    this.dialog.open(InsuranceAddComponent);
  }

  fetchInsuranceData() {
    this.insuranceService.fetchInsuranceData().subscribe(
      (res) => {
        this.dataSource = new MatTableDataSource(this.sortAndMarkInsurance(res));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
       // Parse dd/MM/yyyy
        this.activeInsuranceData = this.dataSource.data.filter(insurance => {
          const [day, month, year] = insurance.endDate?.toString().split('/').map(Number);
          const parsedEndDate = new Date(year, month - 1, day).setHours(0, 0, 0, 0);
          return parsedEndDate >= this.currentDate.setHours(0, 0, 0, 0);
        });
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteRow(data: any): void {
    this.insuranceService.deleteRow(data);
  }

  enableEdit(element: any): void {
    // Set isEditing to true for the selected row
    element.isEditing = true;
  }

  updateRecord(element: any): void {
    element.isEditing = false;
    this.insuranceService.updateInsurance(element);
  }

  private sortAndMarkInsurance(data: any[]) {
    const todayStart = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate());
    const current: any[] = [];
    const past: any[] = [];
    data.forEach(item => {
      let endDateObj = null;
      try {
        const [day, month, year] = item.endDate?.toString().split('/').map(Number);
        const parsedEndDate = new Date(year, month - 1, day).setHours(0, 0, 0, 0);

        endDateObj = item.endDate ? parsedEndDate : null;
      } catch {
        endDateObj = null;
      }
      const isPast = endDateObj ? (endDateObj < todayStart) : false;
      item.isPast = isPast;
      if (isPast) past.push(item); else current.push(item);
    });
    // keep original order within groups (or sort as required)
    return [...current, ...past];
  }

}
