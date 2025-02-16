import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormGroupDirective, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { NgxPrintDirective } from '../ngx-print.directive';

@Component({
  selector: 'app-investments',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule,
      MatSortModule, MatPaginatorModule, MatIconModule, ReactiveFormsModule,
      MatSelectModule, FormsModule, CommonModule, NgxPrintDirective],
  templateUrl: './investments.component.html',
  styleUrl: './investments.component.css'
})
export class InvestmentsComponent implements OnInit {
  formGroup: FormGroup;
  displayedColumns: string[] = ['investment', 'investmentDetail', 'vendorAccountNumber','nominee', 'status','additionalDetails', 'actionsColumn'];

  activeInvestmentData: any;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  constructor(private formBuilder: FormBuilder) {
  }
  dataSource = new MatTableDataSource([
      { investment: 'Stocks', investmentDetail: 'Tech stocks', vendorAccountNumber: 123456, nominee: 'John Doe', status: 'Active', additionalDetails: 'High risk, high reward' },
      { investment: 'Bonds', investmentDetail: 'Government bonds', vendorAccountNumber: 654321, nominee: 'Jane Doe', status: 'Active', additionalDetails: 'Low risk, steady income' },
      { investment: 'Real Estate', investmentDetail: 'Rental property', vendorAccountNumber: 789012, nominee: 'Jim Beam', status: 'Inactive', additionalDetails: 'Long-term investment' },
      { investment: 'Gold', investmentDetail: 'Gold bars', vendorAccountNumber: 345678, nominee: 'Jack Daniels', status: 'Active', additionalDetails: 'Hedge against inflation' }
    ]);

  ngOnInit() {
    this.createForm();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.activeInvestmentData = this.dataSource.data.filter(asset => asset.status === 'Active');
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
      'investment': [null, Validators.required],
      'investmentDetail': [null, Validators.required],
      'vendorAccountNumber': [null, [Validators.required,Validators.pattern("^[0-9].*$")]],
      'nominee': [null, Validators.required],
      'additionalDetails': [null],
      'status': [null, Validators.required]
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
