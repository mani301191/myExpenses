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
import { NgxPrintDirective } from '../ngx-print.directive';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-appliances',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule,
    MatSortModule, MatPaginatorModule, MatIconModule, ReactiveFormsModule,
    MatSelectModule, FormsModule, CommonModule, NgxPrintDirective, MatDatepickerModule, 
    MatNativeDateModule,MatTooltipModule],
  templateUrl: './appliances.component.html',
  styleUrl: './appliances.component.css'
})
export class AppliancesComponent {
  formGroup: FormGroup;
  displayedColumns: string[] = ['applianceName', 'amc', 'amcEndDate', 'lastServicedDate', 'additionalDetails', 'actionsColumn'];
  readonly currentDate = new Date();
  activeAMCData: any;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  constructor(private formBuilder: FormBuilder) {
  }
  dataSource = new MatTableDataSource([
    { applianceName: 'Washing Machine', amc: 'Yes', amcEndDate: '05/20/2025', lastServicedDate: '05/20/2023', additionalDetails: 'Needs filter replacement' },
    { applianceName: 'Refrigerator', amc: 'No', amcEndDate: '12/15/2023', lastServicedDate: '06/10/2023', additionalDetails: 'Working fine' },
    { applianceName: 'Microwave', amc: 'Yes', amcEndDate: '01/10/2025', lastServicedDate: '07/22/2023', additionalDetails: 'Check door seal' },
    { applianceName: 'Dishwasher', amc: 'Yes', amcEndDate: '11/30/2024', lastServicedDate: '08/15/2023', additionalDetails: 'Clean filter monthly' },
    { applianceName: 'Air Conditioner', amc: 'No', amcEndDate: '09/05/2023', lastServicedDate: '04/18/2023', additionalDetails: 'Service before summer' },
    { applianceName: 'Heater', amc: 'Yes', amcEndDate: '02/28/2024', lastServicedDate: '10/10/2023', additionalDetails: 'Check thermostat' }
  ]);

  ngOnInit() {
    this.createForm();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.activeAMCData = this.dataSource.data.filter(asset => asset.amc === 'Yes' && new Date(asset.amcEndDate) > this.currentDate);
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
      'amcEndDate': [null, Validators.required],
      'lastServicedDate': [null],
      'additionalDetails': [null]
    });
  }

  clear(): void {
    this.formGroupDirective.resetForm();
  }

  onSubmit(formData: any): void {
    if (this.formGroup.valid) {
      console.log(formData);
      this.clear();
    }
  }

  deleteRow(data: any): void {
    console.log(data);
  }
}