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
import { NgxPrintDirective } from '../../directive/ngx-print.directive';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InvestmentService } from '../../service/investment.service';
import { InvestmentData } from './investment-data';
import { DropDownData } from '../../config-data';

@Component({
  selector: 'app-investments',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule,
    MatSortModule, MatPaginatorModule, MatIconModule, ReactiveFormsModule,
    MatSelectModule, FormsModule, CommonModule, NgxPrintDirective, MatTooltipModule],
  templateUrl: './investments.component.html',
  styleUrl: './investments.component.css'
})
export class InvestmentsComponent implements OnInit {
  formGroup: FormGroup;
  displayedColumns: string[] = ['investment', 'investmentDetail', 'vendorAccountNumber', 'nominee', 'status', 'additionalDetails', 'actionsColumn'];
  status: String;
  activeInvestmentData: any;
  dataSource: MatTableDataSource<InvestmentData>;
  investmentsList: DropDownData[];
  investStatusList: DropDownData[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  constructor(private formBuilder: FormBuilder, private investmentService: InvestmentService) {
  }

  ngOnInit() {
     isEditing: false
    this.createForm();
    this.fetchInvestmentData();
    this.investmentService.fetchInvestmentDropdownData().subscribe(data => {
      this.investmentsList = data;
    });
    this.investmentService.fetchInvestmentStatusDropdownData().subscribe(data => {
      this.investStatusList = data;
    });
  }

  fetchInvestmentData() {
    this.investmentService.fetchInvestmentData().subscribe(
      (res) => {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.activeInvestmentData = this.dataSource.data.filter(asset => asset.status === 'Active');
      });
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
      'vendorAccountNumber': [null, [Validators.required]],
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
      this.investmentService.saveInvestmentData(formData);
      this.fetchInvestmentData();
      this.clear();
    }
  }

  enableEdit(element: any): void {
    // Set isEditing to true for the selected row
    element.isEditing = true;
  }

  updateRecord(element: any): void {
    element.isEditing = false;
    this.investmentService.updateInvestmentStatus(element);
  }
  deleteRow(data: any): void {
    this.investmentService.deleteRow(data);
  }
}
