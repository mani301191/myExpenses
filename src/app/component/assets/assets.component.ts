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
import { AssetService } from '../../service/asset.service';
import { AssetData } from './asset-data';
import { DropDownData } from '../../config-data';

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
  displayedColumns: string[] = ['assetType', 'asset', 'description', 'assetWeight', 'status','additionalDetails', 'actionsColumn'];
  dataSource: MatTableDataSource<AssetData>;
  assetTypes: DropDownData[];
  assets: DropDownData[];
  assetStatus: DropDownData[];
  aggregatedMovableAssetData: any;
  nonMovableAssetData: any;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  constructor(private formBuilder: FormBuilder,private assetService:AssetService) {
  }

  ngOnInit() {
    this.createForm();
    this.assetService.fetchAssetTypesDropdownData().subscribe(data => {
      this.assetTypes = data;
    });
  
    this.assetService.fetchAssetDropdownData().subscribe(data => {
      this.assets = data;
    });
  
    this.assetService.fetchAssetStatusDropdownData().subscribe(data => {
      this.assetStatus = data;
    });
    this.fetchAssetData();
  }

  fetchAssetData() {
    this.assetService.fetchAssetData().subscribe(
      (res) => { this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.aggregatedMovableAssetData = this.getAggregatedData();
        this.nonMovableAssetData = this.dataSource.data.filter(asset => asset.assetType === 'Non-Movable');
      }
    );
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
        acc[key].totalWeight += curr.assetWeight ? curr.assetWeight : 0;
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
      'additionalDetails': [null],
      'status': [null, Validators.required]
    });
  }

  clear(): void {
    this.formGroupDirective.resetForm();
  }

  onSubmit(formData: any): void {
    if (this.formGroup.valid) {
      this.assetService.saveAssetData(formData);
      this.clear();
    }
  }

  deleteRow(data: any): void {
    this.assetService.deleteRow(data);
  }

  enableEdit(element: any): void {
    // Enable editing for the selected row
    element.isEditing = true;
  }
  
  onStatusChange(element: any): void {
   this.assetService.updateAssetStatus(element);
    element.isEditing = false; // Exit edit mode after selection
  }
  
  getStatusValue(statusId): string {
    // Find and return the status value based on the ID
    const status = this.assetStatus.find(s => s.id === statusId);
    return status ? status.value : 'Unknown';
  }
}
