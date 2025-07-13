import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Asset } from './asset-data';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AssetService } from '../../service/asset.service';
import { DropDownData } from '../../config-data';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.css'],
  standalone: true,
  imports: [MatSelectModule, MatCardModule, MatIconModule, MatButtonModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatTooltipModule, CommonModule, MatInputModule, MatFormFieldModule]
})
export class AssetsComponent {

  get movableAssetGroups() {
    const groups = this.assetTypes.map(type => ({
      type,
      assets: this.movableAssets.filter(a => a.type === type.value)
    }));
    return groups;
  }

  showDialog = false;
  editMode = false;
  assetForm: FormGroup;
  editingAsset: Asset | null = null;
  editingType: 'Movable' | 'Non-Movable' = 'Movable';
  editingGroupType: string = '';
  imagePreview: string | ArrayBuffer | null = null;
  assetTypes: DropDownData[];
  assetStatus: DropDownData[];
  movableAssets: Asset[] = [];
  nonMovableAssets: Asset[] = [];
  defaultImage = 'img/asset.png'; 

  constructor(private fb: FormBuilder,private assetService:AssetService) {
    this.assetForm = this.fb.group({
      name: [''],
      status: [''],
      comments: [''],
      image: [''],
      type: ['']
    });
  }

  ngOnInit() {
  
    this.assetService.fetchAssetDropdownData().subscribe(data => {
      this.assetTypes = data;
    });

    this.assetService.fetchAssetData().subscribe(data => {
      this.movableAssets = data.filter(a => !!a.type);
      this.nonMovableAssets = data.filter(a => !a.type); 
    });
  
    this.assetService.fetchAssetStatusDropdownData().subscribe(data => {
      this.assetStatus = data;
    });
  }

  openAddAsset(type: 'Movable' | 'Non-Movable', groupType?: string) {
    this.editMode = false;
    this.editingType = type;
    this.editingGroupType = groupType || '';
    this.assetForm.reset({ type: groupType || '' });
    this.imagePreview = null;
    this.showDialog = true;
  }

  editAsset(asset: Asset) {
    this.editMode = true;
    this.editingAsset = asset;
    this.editingType = this.movableAssets.includes(asset) ? 'Movable' : 'Non-Movable';
    this.assetForm.patchValue(asset);
    this.imagePreview = asset.image;
    this.showDialog = true;
  }

  deleteAsset(asset: Asset) {
    if (this.movableAssets.includes(asset)) {
      this.movableAssets = this.movableAssets.filter(a => a !== asset);
    } else {
      this.nonMovableAssets = this.nonMovableAssets.filter(a => a !== asset);
    }
    this.assetService.deleteRow(asset);
  }

  saveAsset() {
    const formValue = this.assetForm.value;
    if (this.editMode && this.editingAsset) {
       Object.assign(this.editingAsset, formValue);
       formValue.id = this.editingAsset.id;
      if (this.imagePreview) this.editingAsset.image = this.imagePreview as string;
      formValue.image = this.editingAsset.image;
      this.assetService.updateAssetStatus(formValue);
    } else {
      const newAsset: Asset = {
        ...formValue,
        id: Date.now(),
        image: (this.imagePreview as string) || this.defaultImage
      };
      this.assetService.saveAssetData(newAsset);
      if (this.editingType === 'Movable') {
        this.movableAssets.push(newAsset);
      } else {
        this.nonMovableAssets.push(newAsset);
      }
    }
    this.closeDialog();
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => this.imagePreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  closeDialog() {
    this.showDialog = false;
    this.editingAsset = null;
    this.imagePreview = null;
  }

  printAssets() {
    const originalTitle = document.title;
    document.title = 'MyAssets'+new Date().toISOString().split('T')[0];
    window.print();
    setTimeout(() => {
      document.title = originalTitle; 
    }, 1000);
  }
}