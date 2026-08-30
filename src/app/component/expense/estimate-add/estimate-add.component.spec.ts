import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { EstimateAddComponent } from './estimate-add.component';
import { CommonService } from '../../../service/common.service';

describe('EstimateAddComponent', () => {
  let component: EstimateAddComponent;
  let fixture: ComponentFixture<EstimateAddComponent>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<EstimateAddComponent>>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    commonServiceSpy = jasmine.createSpyObj('CommonService', [
      'fetchEstimateData',
      'deleteMonthlyTargetData',
      'saveEstimateData',
      'cloneEstimateData'
    ]);
    commonServiceSpy.fetchEstimateData.and.returnValue(of([{ date: new Date(2026, 0, 1), description: 'Rent', amount: 1000 }]) as any);
    commonServiceSpy.deleteMonthlyTargetData.and.returnValue(of({}) as any);
    commonServiceSpy.saveEstimateData.and.returnValue(of({}) as any);
    commonServiceSpy.cloneEstimateData.and.returnValue(of([{ date: new Date(2026, 1, 1), description: 'Cloned', amount: 500 }]) as any);
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [EstimateAddComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: CommonService, useValue: commonServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstimateAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getMonthlyTargetData', () => {
    it('should load the monthly target data into the table on init', () => {
      expect(commonServiceSpy.fetchEstimateData).toHaveBeenCalled();
      expect(component.table.dataSource).toEqual([{ date: new Date(2026, 0, 1), description: 'Rent', amount: 1000 }]);
      expect(component.dataSource).toBe(component.table.dataSource);
    });
  });

  describe('addRowData', () => {
    it('should add a blank row to the top of the data source', () => {
      const before = (component.table.dataSource as any[]).length;
      component.addRowData();
      expect((component.table.dataSource as any[]).length).toBe(before + 1);
      expect(component.table.dataSource[0].description).toBe('');
      expect(component.table.dataSource[0].amount).toBe(0.0);
      expect(component.table.dataSource[0].date).toBeInstanceOf(Date);
    });
  });

  describe('deleteRow', () => {
    it('should delete the row through the service when it has a description', () => {
      const row = { id: 7, description: 'Rent', amount: 1000 };
      const before = (component.table.dataSource as any[]).length;
      component.deleteRow(row);
      expect(commonServiceSpy.deleteMonthlyTargetData).toHaveBeenCalledWith(row);
      expect((component.table.dataSource as any[]).length).toBe(before);
    });

    it('should not call the service for a blank row', () => {
      const row = { description: '', amount: 0 };
      component.table.dataSource = [row, ...(component.table.dataSource as any[])];
      component.deleteRow(row);
      expect(commonServiceSpy.deleteMonthlyTargetData).not.toHaveBeenCalled();
    });
  });

  describe('saveRowData', () => {
    it('should send the table data to saveEstimateData', () => {
      component.saveRowData();
      expect(commonServiceSpy.saveEstimateData).toHaveBeenCalledWith(component.table.dataSource);
    });
  });

  describe('openClone', () => {
    it('should call cloneEstimateData and replace the table data', () => {
      component.openClone();
      expect(commonServiceSpy.cloneEstimateData).toHaveBeenCalled();
      expect(component.table.dataSource).toEqual([{ date: new Date(2026, 1, 1), description: 'Cloned', amount: 500 }]);
    });
  });

  describe('closeDatePicker', () => {
    it('should update selectedDate, close the picker and reload data', () => {
      const dp = jasmine.createSpyObj('dp', ['close']);
      const date = new Date(2026, 5, 1);
      commonServiceSpy.fetchEstimateData.calls.reset();
      component.closeDatePicker(date, dp);
      expect(component.selectedDate).toBe(date);
      expect(dp.close).toHaveBeenCalled();
      expect(commonServiceSpy.fetchEstimateData).toHaveBeenCalledWith(date);
    });
  });

  describe('displayMessage', () => {
    it('should open the snack bar with the given message', () => {
      component.displayMessage('Hello');
      expect(snackBarSpy.open).toHaveBeenCalledWith('Hello', 'dismiss', jasmine.objectContaining({ verticalPosition: 'top', duration: 3000 }));
    });
  });

  describe('close', () => {
    it('should close the dialog', () => {
      component.close();
      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });
});