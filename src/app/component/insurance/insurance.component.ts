import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormGroupDirective, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { NgxPrintDirective } from '../../directive/ngx-print.directive';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InsuranceData } from './insurance-data';
import { DropDownData } from '../../config-data';
import { InsuranceService } from '../../service/insurance.service';

@Component({
  selector: 'app-insurance',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule,
    MatSortModule, MatPaginatorModule, MatIconModule, ReactiveFormsModule,
    MatSelectModule, FormsModule, CommonModule, NgxPrintDirective,
    MatDatepickerModule, MatNativeDateModule, MatTooltipModule],
  templateUrl: './insurance.component.html',
  styleUrl: './insurance.component.css'
})
export class InsuranceComponent {

  formGroup: FormGroup;
  displayedColumns: string[] = ['insuranceType', 'insuranceProvider', 'policyNumber', 'nominee', 'startDate', 'endDate', 'actionsColumn'];
  readonly currentDate = new Date();
  activeInsuranceData: any;
  dataSource: MatTableDataSource<InsuranceData>;
  insuranceTypes: DropDownData[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  constructor(private formBuilder: FormBuilder, private insuranceService: InsuranceService) {
  }

  ngOnInit() {
    this.createForm();
    this.insuranceService.fetchInsuranceTypeDropdownData().subscribe(data => {
    this.insuranceTypes = data;
    });
    this.fetchInsuranceData();
  }

  fetchInsuranceData() {
    this.insuranceService.fetchInsuranceData().subscribe(
      (res) => {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
       // Parse endDate and filter active insurance data
      this.activeInsuranceData = this.dataSource.data.filter(insurance => {
        const [day, month, year] = insurance.endDate?.toString().split('/').map(Number); // Split and parse dd/MM/yyyy
        const parsedEndDate = new Date(year, month - 1, day).setHours(0, 0, 0, 0); // Create a Date object
        return parsedEndDate >= this.currentDate.setHours(0, 0, 0, 0); // Compare with current date
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
      insuranceType: ['', Validators.required],
      insuranceProvider: ['', Validators.required],
      policyNumber: ['', [Validators.required]],
      nominee: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });
  }

  clear(): void {
    this.formGroupDirective.resetForm();
  }

  onSubmit(formData: any): void {
    if (this.formGroup.valid) {
      this.insuranceService.saveInsuranceData(formData);
      this.clear();
    }
  }

  deleteRow(data: any): void {
    this.insuranceService.deleteRow(data);
  }
}
