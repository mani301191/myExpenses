import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { ExpenseMonthlyTableComponent } from './expense-monthly-table.component';
import { CommonService } from '../../../service/common.service';
import { ExcelServicesService } from '../../../service/export-service';
import { ExpenseAddComponent } from '../expense-add/expense-add.component';
import { IncomeAddComponent } from '../../income-add/income-add.component';
import { EstimateAddComponent } from '../estimate-add/estimate-add.component';
import { NgxPrintDirective } from '../../../directive/ngx-print.directive';

describe('ExpenseMonthlyTableComponent', () => {
  let component: ExpenseMonthlyTableComponent;
  let fixture: ComponentFixture<ExpenseMonthlyTableComponent>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let excelServiceSpy: jasmine.SpyObj<ExcelServicesService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const expenseRows = () => [
    { expenseId: 1, expenseDate: '15/03/2026', amount: 100, year: 2026, month: 'March', expenseType: 'Planned', expenseOf: 'Groceries', description: 'Shop' },
    { expenseId: 2, expenseDate: '02/03/2026', amount: 50, year: 2026, month: 'March', expenseType: 'UnPlanned', expenseOf: 'Travel', description: 'Cab' }
  ];

  beforeEach(async () => {
    commonServiceSpy = jasmine.createSpyObj('CommonService', [
      'fetchExpenseData',
      'plannedExpense',
      'dailySummary',
      'deleteRow',
      'updateExpenseDetail',
      'fetchIncomeData',
      'fetchEstimateData',
      'plannedExpenseStatus',
      'uploadStatement'
    ]);
    commonServiceSpy.fetchExpenseData.and.returnValue(of(expenseRows() as any));
    commonServiceSpy.plannedExpense.and.returnValue(of([{ id: '1', value: 'Groceries' }]) as any);
    commonServiceSpy.dailySummary.and.returnValue(of([
      { date: '2026-03-01', expense: 100 },
      { date: '2026-03-02', expense: 50 }
    ]) as any);
    commonServiceSpy.fetchIncomeData.and.returnValue(of([]) as any);
    commonServiceSpy.fetchEstimateData.and.returnValue(of([]) as any);
    commonServiceSpy.plannedExpenseStatus.and.returnValue(of([]) as any);
    commonServiceSpy.uploadStatement.and.returnValue(of('ok') as any);

    excelServiceSpy = jasmine.createSpyObj('ExcelServicesService', ['exportAsExcelFile']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    dialogSpy.open.and.returnValue({ afterClosed: () => of(null) } as any);

    await TestBed.configureTestingModule({
      imports: [ExpenseMonthlyTableComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ month: 'March', year: '2026' }) } } },
        { provide: CommonService, useValue: commonServiceSpy },
        { provide: ExcelServicesService, useValue: excelServiceSpy }
      ]
    });
    TestBed.overrideProvider(MatDialog, { useValue: dialogSpy });
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(ExpenseMonthlyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should derive selectedDate from the route month/year params', () => {
    expect(component.selectedDate.getFullYear()).toBe(2026);
    expect(component.selectedDate.getMonth()).toBe(2);
  });

  describe('fetchExpenseData', () => {
    it('should populate the table and expenseDataResponse on init', () => {
      expect(commonServiceSpy.fetchExpenseData).toHaveBeenCalled();
      expect(component.dataSource).toBeDefined();
      expect(component.dataSource.data.length).toBe(2);
      expect(component.expenseDataResponse.length).toBe(2);
      expect(component.paginator).toBeDefined();
      expect(component.sort).toBeDefined();
    });

    it('should fetch planned expense categories and daily summary on init', () => {
      expect(commonServiceSpy.plannedExpense).toHaveBeenCalled();
      expect(commonServiceSpy.dailySummary).toHaveBeenCalled();
      expect(component.expenseCategories).toEqual([{ id: '1', value: 'Groceries' }]);
      expect(component.chartOptions).toBeDefined();
      expect(component.expenseOfChartOptions).toBeDefined();
    });

    });

  describe('NgxPrintDirective usage', () => {
    it('should attach the print directive to the print button', () => {
      const printButtons = fixture.debugElement.queryAll(By.directive(NgxPrintDirective));
      expect(printButtons.length).toBeGreaterThan(0);
      const directive = printButtons[0].injector.get(NgxPrintDirective);
      expect(directive.printSectionId).toBe('print-section');
    });
  });

  describe('deleteRow', () => {
    it('should delegate to the service', () => {
      const row = expenseRows()[0];
      component.deleteRow(row);
      expect(commonServiceSpy.deleteRow).toHaveBeenCalledWith(row);
    });
  });

  describe('applyFilter', () => {
    it('should set the filter on the data source', () => {
      component.applyFilter({ target: { value: 'TRAVEL' } } as any);
      expect(component.dataSource.filter).toBe('travel');
    });
  });

  describe('dialog helpers', () => {
    it('openDialogExpense should open the ExpenseAddComponent dialog and refresh', () => {
      commonServiceSpy.fetchExpenseData.calls.reset();
      component.openDialogExpense();
      expect(dialogSpy.open).toHaveBeenCalledWith(ExpenseAddComponent);
      expect(commonServiceSpy.fetchExpenseData).toHaveBeenCalled();
    });

    it('openDialogIncome should open the IncomeAddComponent dialog', () => {
      component.openDialogIncome();
      expect(dialogSpy.open).toHaveBeenCalledWith(IncomeAddComponent);
    });

    it('openEstimate should open the EstimateAddComponent dialog', () => {
      component.openEstimate();
      expect(dialogSpy.open).toHaveBeenCalledWith(EstimateAddComponent);
    });
  });

  describe('export', () => {
    it('should sort and export the expense data as an excel file', () => {
      component.export();
      expect(excelServiceSpy.exportAsExcelFile).toHaveBeenCalled();
      const name = excelServiceSpy.exportAsExcelFile.calls.mostRecent().args[1] as string;
      expect(name).toContain('MonthlyExpense-');
      expect(name).toContain('2026');
    });

    it('should place the earlier date first when sorting', () => {
      component.export();
      const sorted = excelServiceSpy.exportAsExcelFile.calls.mostRecent().args[0] as any[];
      expect(sorted[0].expenseDate).toBe('02/03/2026');
      expect(sorted[1].expenseDate).toBe('15/03/2026');
    });
  });

  describe('closeDatePicker', () => {
    it('should update selectedDate, close the picker and refresh data', () => {
      const dp = jasmine.createSpyObj('dp', ['close']);
      const date = new Date(2026, 5, 1);
      commonServiceSpy.fetchExpenseData.calls.reset();
      component.closeDatePicker(date, dp);
      expect(component.selectedDate).toBe(date);
      expect(dp.close).toHaveBeenCalled();
      expect(commonServiceSpy.fetchExpenseData).toHaveBeenCalledWith(date);
      expect(commonServiceSpy.fetchIncomeData).toHaveBeenCalledWith(date);
      expect(commonServiceSpy.fetchEstimateData).toHaveBeenCalledWith(date);
      expect(commonServiceSpy.plannedExpenseStatus).toHaveBeenCalledWith(date);
    });
  });

  describe('sortData / compare', () => {
    it('should sort by amount ascending', () => {
      component.sortData({ active: 'amount', direction: 'asc' });
      expect(component.dataSource.data[0].amount).toBe(50);
      expect(component.dataSource.data[1].amount).toBe(100);
    });

    it('should leave data untouched when sorting is cleared', () => {
      const original = [...component.dataSource.data];
      component.sortData({ active: '', direction: '' });
      expect(component.dataSource.data).toEqual(original);
    });

    it('compare should invert based on isAsc', () => {
      expect(component.compare(1, 2, true)).toBe(-1);
      expect(component.compare(1, 2, false)).toBe(1);
      expect(component.compare(2, 1, true)).toBe(1);
      expect(component.compare(2, 1, false)).toBe(-1);
    });
  });

  describe('edit helpers', () => {
    it('enableEdit should flag the row', () => {
      const row: any = {};
      component.enableEdit(row);
      expect(row.isEditing).toBeTrue();
    });

    it('updateRecord should clear the flag and delegate to the service', () => {
      const row: any = { isEditing: true };
      component.updateRecord(row);
      expect(row.isEditing).toBeFalse();
      expect(commonServiceSpy.updateExpenseDetail).toHaveBeenCalledWith(row);
    });

    it('updateField should set the value and delegate to the service', () => {
      const row: any = { expenseType: 'Planned' };
      component.updateField(row, 'expenseType', 'UnPlanned');
      expect(row.expenseType).toBe('UnPlanned');
      expect(commonServiceSpy.updateExpenseDetail).toHaveBeenCalledWith(row);
    });
  });

  describe('file upload', () => {
    it('onFileSelected should store the selected file', () => {
      const file = new File(['abc'], 'stmt.txt');
      component.onFileSelected({ target: { files: [file] } });
      expect(component.selectedFile).toBe(file);
    });

    it('uploadStatement should upload the file and refresh the data', () => {
      const file = new File(['abc'], 'stmt.txt');
      component.selectedFile = file;
      commonServiceSpy.fetchExpenseData.calls.reset();
      component.uploadStatement();
      expect(commonServiceSpy.uploadStatement).toHaveBeenCalledWith(file);
      expect(commonServiceSpy.fetchExpenseData).toHaveBeenCalled();
    });
  });
});