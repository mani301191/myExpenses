import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxPrintDirective } from '../../directive/ngx-print.directive';
import { InvestmentService } from '../../service/investment.service';
import { InvestmentData } from './investment-data';
import { DropDownData } from '../../config-data';
import { InvestmentAddComponent } from './investment-add.component';

@Component({
    selector: 'app-investments',
    imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule,
        MatSortModule, MatPaginatorModule, MatIconModule, MatSelectModule,
        FormsModule, CommonModule, NgxPrintDirective, MatTooltipModule, MatDialogModule],
    templateUrl: './investments.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './investments.component.css'
})
export class InvestmentsComponent implements OnInit {
  displayedColumns: string[] = ['investment', 'investmentDetail', 'vendorAccountNumber', 'nominee', 'status', 'additionalDetails', 'actionsColumn'];
  status: String;
  activeInvestmentData: any;
  dataSource: MatTableDataSource<InvestmentData>;
  investStatusList: DropDownData[];

  readonly dialog = inject(MatDialog);

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private investmentService: InvestmentService) {
  }

  ngOnInit() {
    this.fetchInvestmentData();
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

  openAddDialog(): void {
    this.dialog.open(InvestmentAddComponent);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
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
