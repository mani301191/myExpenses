import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AssetsComponent } from './assets.component';
import { AssetService } from '../../service/asset.service';
import { Asset } from './asset-data';
import { DropDownData } from '../../config-data';

describe('AssetsComponent', () => {
  let component: AssetsComponent;
  let fixture: ComponentFixture<AssetsComponent>;
  let assetServiceSpy: jasmine.SpyObj<AssetService>;

  const assetTypes: DropDownData[] = [
    { id: '1', value: 'Vehicle' },
    { id: '2', value: 'Electronics' }
  ];

  const assets: Asset[] = [
    { id: '1', name: 'Car', status: 'Fine', comments: '', image: 'img/car.png', type: 'Vehicle' },
    { id: '2', name: 'Laptop', status: 'New', comments: '', image: 'img/laptop.png', type: 'Electronics' },
    { id: '3', name: 'House', status: 'Owned', comments: '', image: 'img/house.png', type: '' }
  ];

  beforeEach(async () => {
    assetServiceSpy = jasmine.createSpyObj('AssetService', [
      'fetchAssetDropdownData',
      'fetchAssetData',
      'fetchAssetStatusDropdownData',
      'saveAssetData',
      'updateAssetStatus',
      'deleteRow'
    ]);
    assetServiceSpy.fetchAssetDropdownData.and.returnValue(of(assetTypes));
    assetServiceSpy.fetchAssetData.and.returnValue(of(assets));
    assetServiceSpy.fetchAssetStatusDropdownData.and.returnValue(of([{ id: '1', value: 'Good' }]));

    await TestBed.configureTestingModule({
      imports: [AssetsComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: AssetService, useValue: assetServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load dropdowns and assets on init', () => {
    expect(assetServiceSpy.fetchAssetDropdownData).toHaveBeenCalled();
    expect(assetServiceSpy.fetchAssetStatusDropdownData).toHaveBeenCalled();
    expect(assetServiceSpy.fetchAssetData).toHaveBeenCalled();
    expect(component.assetTypes).toEqual(assetTypes);
    expect(component.movableAssets.length).toBe(2);
    expect(component.nonMovableAssets.length).toBe(1);
  });

  describe('movableAssetGroups getter', () => {
    it('should group movable assets by their type value', () => {
      const groups = component.movableAssetGroups;
      expect(groups.length).toBe(2);
      expect(groups[0].type).toEqual({ id: '1', value: 'Vehicle' });
      expect(groups[0].assets.map(a => a.name)).toEqual(['Car']);
      expect(groups[1].type).toEqual({ id: '2', value: 'Electronics' });
      expect(groups[1].assets.map(a => a.name)).toEqual(['Laptop']);
    });

    it('should drop movable assets whose type matches no dropdown entry', () => {
      component.movableAssets = [...assets.slice(0, 2), { id: '9', name: 'Orphan', status: '', comments: '', image: '', type: '999' }];
      const groups = component.movableAssetGroups;
      expect(groups.reduce((count, g) => count + g.assets.length, 0)).toBe(2);
    });
  });

  describe('dialog visibility', () => {
    it('openAddAsset should show the dialog in add mode', () => {
      component.openAddAsset('Movable', 'Vehicle');
      expect(component.showDialog).toBeTrue();
      expect(component.editMode).toBeFalse();
      expect(component.editingType).toBe('Movable');
      expect(component.editingGroupType).toBe('Vehicle');
      expect(component.imagePreview).toBeNull();
      expect(component.assetForm.get('type')!.value).toBe('Vehicle');
    });

    it('openAddAsset without a group type should reset the type control', () => {
      component.assetForm.setValue({ name: 'X', status: '', comments: '', image: '', type: 'old' });
      component.openAddAsset('Non-Movable');
      expect(component.editingType).toBe('Non-Movable');
      expect(component.assetForm.get('type')!.value).toBe('');
    });

    it('editAsset should show the dialog prefilled for a movable asset', () => {
      const asset = assets[0];
      component.movableAssets = [asset];
      component.editAsset(asset);
      expect(component.showDialog).toBeTrue();
      expect(component.editMode).toBeTrue();
      expect(component.editingAsset).toBe(asset);
      expect(component.editingType).toBe('Movable');
      expect(component.assetForm.get('name')!.value).toBe('Car');
      expect(component.imagePreview).toBe('img/car.png');
    });

    it('editAsset should treat a non-movable asset correctly', () => {
      const asset = assets[2];
      component.editAsset(asset);
      expect(component.editingType).toBe('Non-Movable');
    });

    it('closeDialog should hide the dialog and clear edit state', () => {
      component.openAddAsset('Movable');
      component.closeDialog();
      expect(component.showDialog).toBeFalse();
      expect(component.editingAsset).toBeNull();
      expect(component.imagePreview).toBeNull();
    });
  });

  describe('saveAsset', () => {
    it('should save a new movable asset and append it to the list', () => {
      component.movableAssets = [];
      component.nonMovableAssets = [];
      component.openAddAsset('Movable', 'Vehicle');
      component.assetForm.setValue({ name: 'Bike', status: 'Good', comments: 'Two wheeler', image: '', type: 'Vehicle' });
      component.saveAsset();

      expect(assetServiceSpy.saveAssetData).toHaveBeenCalledWith(
        jasmine.objectContaining({ name: 'Bike', status: 'Good', type: 'Vehicle' })
      );
      expect(component.movableAssets.length).toBe(1);
      expect(component.movableAssets[0].name).toBe('Bike');
      expect(component.movableAssets[0].image).toBe(component.defaultImage);
      expect(component.showDialog).toBeFalse();
    });

    it('should save a new non-movable asset and append it to the list', () => {
      component.movableAssets = [];
      component.nonMovableAssets = [];
      component.openAddAsset('Non-Movable');
      component.assetForm.setValue({ name: 'Land', status: 'Owned', comments: '', image: '', type: '' });
      component.saveAsset();

      expect(assetServiceSpy.saveAssetData).toHaveBeenCalled();
      expect(component.nonMovableAssets.length).toBe(1);
      expect(component.nonMovableAssets[0].name).toBe('Land');
    });

    it('should update an existing asset when in edit mode', () => {
      const asset = { ...assets[0], id: '10' };
      component.movableAssets = [asset];
      component.editAsset(asset);
      component.assetForm.patchValue({ name: 'Car V2', comments: 'updated' });

      component.saveAsset();
      expect(assetServiceSpy.updateAssetStatus).toHaveBeenCalledWith(jasmine.objectContaining({ id: '10', name: 'Car V2' }));
      expect(asset.name).toBe('Car V2');
      expect(component.showDialog).toBeFalse();
    });

    it('should carry the previewed image over to a new asset', () => {
      component.openAddAsset('Movable', 'Vehicle');
      component.imagePreview = 'data:image/png;base64,xxx';
      component.assetForm.setValue({ name: 'Boat', status: 'Good', comments: '', image: '', type: 'Vehicle' });
      component.saveAsset();
      const saved = component.movableAssets.find(a => a.name === 'Boat');
      expect(saved!.image).toBe('data:image/png;base64,xxx');
    });
  });

  describe('deleteAsset', () => {
    it('should remove a movable asset and call the service', () => {
      const asset = assets[0];
      component.movableAssets = [asset, assets[1]];
      component.deleteAsset(asset);
      expect(component.movableAssets).toEqual([assets[1]]);
      expect(assetServiceSpy.deleteRow).toHaveBeenCalledWith(asset);
    });

    it('should remove a non-movable asset and call the service', () => {
      const asset = assets[2];
      component.nonMovableAssets = [asset];
      component.deleteAsset(asset);
      expect(component.nonMovableAssets.length).toBe(0);
      expect(assetServiceSpy.deleteRow).toHaveBeenCalledWith(asset);
    });
  });

  describe('onImageSelected', () => {
    it('should read the selected file as a data URL', () => {
      const mockReader: any = {
        result: null,
        onload: null,
        readAsDataURL: jasmine.createSpy('readAsDataURL')
      };
      spyOn(window as any, 'FileReader').and.returnValue(mockReader);

      const event = { target: { files: [{ name: 'asset.png' }] } };
      component.onImageSelected(event);
      expect(mockReader.readAsDataURL).toHaveBeenCalled();

      mockReader.result = 'data:image/png;base64,abc';
      mockReader.onload(null);
      expect(component.imagePreview).toBe('data:image/png;base64,abc');
    });

    it('should do nothing when no file is selected', () => {
      const readSpy = spyOn(window as any, 'FileReader');
      component.onImageSelected({ target: { files: [] } });
      expect(readSpy).not.toHaveBeenCalled();
    });
  });

  describe('printAssets', () => {
    it('should set the title, print and restore it later', (done) => {
      spyOn(window, 'print');
      const originalTitle = document.title;
      component.printAssets();
      expect(document.title).toContain('MyAssets');
      setTimeout(() => {
        expect(document.title).toBe(originalTitle);
        done();
      }, 1100);
    });
  });
});