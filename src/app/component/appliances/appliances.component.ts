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
import { AppliancesService } from '../../service/appliances.service';
import { AppliancesData } from './appliances-data';
import { AppliancesAddComponent } from './appliances-add.component';

@Component({
    selector: 'app-appliances',
    imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatIconModule, MatSelectModule, FormsModule, NgxPrintDirective, MatDatepickerModule, MatNativeDateModule, MatTooltipModule, MatDialogModule],
    templateUrl: './appliances.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './appliances.component.css'
})
export class AppliancesComponent {
  displayedColumns: string[] = ['applianceName', 'amc', 'amcEndDate', 'lastServicedDate', 'additionalDetails', 'actionsColumn'];
  readonly currentDate = new Date();
  activeAMCData: any;
  dataSource: MatTableDataSource<AppliancesData>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  readonly dialog = inject(MatDialog);

  constructor(private appliancesService: AppliancesService) {
  }

  ngOnInit() {
    this.fetchAppliancesData();
  }

  fetchAppliancesData() {
    this.appliancesService.fetchAppliancesData().subscribe(
      (res) => {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
       // Filter active AMC data
      this.activeAMCData = this.dataSource.data.filter(asset => {
        if (asset.amc === 'Yes' && asset.amcEndDate) {
          const [day, month, year] = asset.amcEndDate?.toString().split('/').map(Number); // Parse dd/MM/yyyy
          const parsedEndDate = new Date(year, month - 1, day).setHours(0, 0, 0, 0); // Create a Date object
          return parsedEndDate >= this.currentDate.setHours(0, 0, 0, 0); // Compare with current date
        }
        return false; // Exclude rows without valid AMC or amcEndDate
      });
      }
    );
  }

  openAddDialog(): void {
    this.dialog.open(AppliancesAddComponent);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteRow(data: any): void {
    this.appliancesService.deleteRow(data);
  }

  enableEdit(element: any): void {
    // Set isEditing to true for the selected row
    element.isEditing = true;
  }

  updateRecord(element: any): void {
    element.isEditing = false;
    this.appliancesService.updateAppliances(element);
  }
}
