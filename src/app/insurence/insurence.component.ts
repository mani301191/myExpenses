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
import { NgxPrintDirective } from '../ngx-print.directive';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-insurence',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule,
        MatSortModule, MatPaginatorModule, MatIconModule, ReactiveFormsModule,
        MatSelectModule, FormsModule, CommonModule, NgxPrintDirective, 
        MatDatepickerModule, MatNativeDateModule,MatTooltipModule],
  templateUrl: './insurence.component.html',
  styleUrl: './insurence.component.css'
})
export class InsurenceComponent { 
  
  formGroup: FormGroup;
  displayedColumns: string[] = ['insurenceType', 'insurenceProvider', 'policyNumber','nominee', 'startDate','endDate', 'actionsColumn'];
 readonly currentDate = new Date();
  activeInsurenceData: any;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  constructor(private formBuilder: FormBuilder) {
  }
  dataSource = new MatTableDataSource([
    { insurenceType: 'Life', insurenceProvider: 'XYZ', policyNumber: 123456, nominee: 'John Doe', startDate: '01/01/2020', endDate: '01/03/2025' },
    { insurenceType: 'Health', insurenceProvider: 'ABC', policyNumber: 654321, nominee: 'Jane Doe', startDate: '02/01/2020', endDate: '02/01/2025' },
    { insurenceType: 'Auto', insurenceProvider: 'DEF', policyNumber: 112233, nominee: 'Jim Beam', startDate: '03/01/2020', endDate: '03/03/2025' },
    { insurenceType: 'Home', insurenceProvider: 'GHI', policyNumber: 445566, nominee: 'Jack Daniels', startDate: '04/01/2020', endDate: '04/01/2025' },
    { insurenceType: 'Travel', insurenceProvider: 'JKL', policyNumber: 778899, nominee: 'Johnny Walker', startDate: '05/01/2020', endDate: '05/01/2025' }
  ]);

  ngOnInit() {
    this.createForm();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.activeInsurenceData = this.dataSource.data.filter(asset => new Date(asset.endDate) > this.currentDate);
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
      insurenceType: ['', Validators.required],
      insurenceProvider: ['', Validators.required],
      policyNumber: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
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
      console.log(formData);
      this.clear();
    }
  }

  deleteRow(data: any): void {
    console.log(data);
  }
}
