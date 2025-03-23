import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { NgxPrintDirective } from '../../directive/ngx-print.directive';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule,
    MatSortModule, MatPaginatorModule, MatIconModule, ReactiveFormsModule,
    MatSelectModule, FormsModule, CommonModule, NgxPrintDirective,MatTooltipModule],
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.css']
})
export class AssetsComponent implements OnInit {
  formGroup: FormGroup;
  displayedColumns: string[] = ['assetType', 'asset', 'description', 'assetWeight', 'status','addtionalDetails', 'actionsColumn'];
  dataSource = new MatTableDataSource([
    { assetType: 'Movable', asset: 'Gold', description: 'chain', assetWeight: '4', status: 'In-use', addtionalDetails: 'Gift from parents' },
    { assetType: 'Movable', asset: 'Gold', description: 'ring', assetWeight: '6', status: 'In-Locker', addtionalDetails: 'Anniversary gift' },
    { assetType: 'Movable', asset: 'Silver', description: 'bracelet', assetWeight: '8', status: 'In-use', addtionalDetails: 'Bought from local market' },
    { assetType: 'Movable', asset: 'Silver', description: 'ring', assetWeight: '6', status: 'In-use', addtionalDetails: 'Inherited from grandmother' },
    { assetType: 'Non-Movable', asset: 'Property', description: '2 BHK Avadi', assetWeight: null, status: 'Loan/EMI Closed', addtionalDetails: 'Purchased in 2010' },
    { assetType: 'Non-Movable', asset: 'Property', description: '1 BHK Mambakkam', assetWeight: null, status: 'In-Loan/EMI', addtionalDetails: 'Purchased in 2015' }
  ]);
  aggregatedMovableAssetData: any;
  nonMovableAssetData: any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  constructor(private formBuilder: FormBuilder) {
  }

  ngOnInit() {
    this.createForm();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.aggregatedMovableAssetData = this.getAggregatedData();
    this.nonMovableAssetData = this.dataSource.data.filter(asset => asset.assetType === 'Non-Movable');
  }

  getAggregatedData() {
    const aggregatedData = this.dataSource.data
      .filter(asset => asset.assetType === 'Movable')
      .reduce((acc, curr) => {
        const key = `${curr.assetType}-${curr.asset}`;
        if (!acc[key]) {
          acc[key] = { assetType: curr.assetType, asset: curr.asset, count: 0, totalWeight: 0 };
        }
        acc[key].count += 1;
        acc[key].totalWeight += curr.assetWeight ? parseFloat(curr.assetWeight) : 0;
        return acc;
      }, {});

    return Object.values(aggregatedData);
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
      'assetType': [null, Validators.required],
      'asset': [null, Validators.required],
      'description': [null, Validators.required],
      'assetWeight': [null, Validators.pattern("^[0-9].*$")],
      'addtionalDetails': [null],
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
