import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormGroupDirective, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { NgxPrintDirective } from '../../directive/ngx-print.directive';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppliancesService } from '../../service/appliances.service';
import { AppliancesData } from './appliances-data';

@Component({
  selector: 'app-appliances',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule,
    MatSortModule, MatPaginatorModule, MatIconModule, ReactiveFormsModule,
    MatSelectModule, FormsModule, CommonModule, NgxPrintDirective, MatDatepickerModule,
    MatNativeDateModule, MatTooltipModule],
  templateUrl: './appliances.component.html',
  styleUrl: './appliances.component.css'
})
export class AppliancesComponent {
  formGroup: FormGroup;
  displayedColumns: string[] = ['applianceName', 'amc', 'amcEndDate', 'lastServicedDate', 'additionalDetails', 'actionsColumn'];
  readonly currentDate = new Date();
  activeAMCData: any;
  dataSource: MatTableDataSource<AppliancesData>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  constructor(private formBuilder: FormBuilder, private appliancesService: AppliancesService) {
  }

  ngOnInit() {
    this.createForm();
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
          const parsedEndDate = new Date(year, month - 1, day); // Create a Date object
          return parsedEndDate > this.currentDate; // Compare with current date
        }
        return false; // Exclude rows without valid AMC or amcEndDate
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

  createForm() {
    this.formGroup = this.formBuilder.group({
      'applianceName': [null, Validators.required],
      'amc': [null, Validators.required],
      'amcEndDate': [null],
      'lastServicedDate': [null],
      'additionalDetails': [null]
    });
  }

  clear(): void {
    this.formGroupDirective.resetForm();
  }

  onSubmit(formData: any): void {
    if (this.formGroup.valid) {
      this.appliancesService.saveAppliancesData(formData);
      this.clear();
    }
  }

  deleteRow(data: any): void {
    this.appliancesService.deleteRow(data);
  }
}