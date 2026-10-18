import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { AppliancesComponent } from './appliances.component';
import { AppliancesAddComponent } from './appliances-add.component';
import { AppliancesService } from '../../service/appliances.service';
import { NgxPrintDirective } from '../../directive/ngx-print.directive';

function toDmy(date: Date): string {
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  return `${day}/${month}/${date.getFullYear()}`;
}

describe('AppliancesComponent', () => {
  let component: AppliancesComponent;
  let fixture: ComponentFixture<AppliancesComponent>;
  let appliancesServiceSpy: jasmine.SpyObj<AppliancesService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  const applianceRows = () => [
    { applianceName: 'Refrigerator', amc: 'No', amcEndDate: null, lastServicedDate: toDmy(new Date()), additionalDetails: '' },
    { applianceName: 'Air Conditioner', amc: 'Yes', amcEndDate: '', lastServicedDate: toDmy(new Date()), additionalDetails: '' }
  ];

  beforeEach(async () => {
    const future = new Date();
    future.setMonth(future.getMonth() + 6);
    const past = new Date();
    past.setMonth(past.getMonth() - 6);

    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    dialogSpy.open.and.returnValue({ afterClosed: () => of(null) } as any);

    appliancesServiceSpy = jasmine.createSpyObj('AppliancesService', [
      'fetchAppliancesData',
      'saveAppliancesData',
      'deleteRow',
      'updateAppliances'
    ]);
    appliancesServiceSpy.fetchAppliancesData.and.returnValue(
      of([
        { applianceName: 'AC', amc: 'Yes', amcEndDate: toDmy(future), lastServicedDate: toDmy(new Date()), additionalDetails: 'Active' },
        { applianceName: 'Washing Machine', amc: 'Yes', amcEndDate: toDmy(past), lastServicedDate: toDmy(new Date()), additionalDetails: 'Expired' },
        { applianceName: 'TV', amc: 'No', amcEndDate: '', lastServicedDate: toDmy(new Date()), additionalDetails: '' }
      ] as any)
    );

    await TestBed.configureTestingModule({
      imports: [AppliancesComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: AppliancesService, useValue: appliancesServiceSpy }
      ]
    });

    TestBed.overrideProvider(MatDialog, { useValue: dialogSpy });
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(AppliancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('fetchAppliancesData', () => {
    it('should populate the table on init', () => {
      expect(appliancesServiceSpy.fetchAppliancesData).toHaveBeenCalled();
      expect(component.dataSource.data.length).toBe(3);
    });

    it('should keep only active AMC rows', () => {
      expect(component.activeAMCData.length).toBe(1);
      expect(component.activeAMCData[0].applianceName).toBe('AC');
    });
  });

  describe('openAddDialog', () => {
    it('should open the dialog to add an appliance record', () => {
      component.openAddDialog();
      expect(dialogSpy.open).toHaveBeenCalledWith(AppliancesAddComponent);
    });
  });

  describe('deleteRow', () => {
    it('should delegate to the service', () => {
      const row = { applianceName: 'AC', appliancesId: 5 };
      component.deleteRow(row);
      expect(appliancesServiceSpy.deleteRow).toHaveBeenCalledWith(row);
    });
  });

  describe('applyFilter', () => {
    it('should set the data source filter text', () => {
      component.applyFilter({ target: { value: 'REF' } } as any);
      expect(component.dataSource.filter).toBe('ref');
    });

    it('should go back to the first page when a paginator exists', () => {
      const paginator = jasmine.createSpyObj('paginator', ['firstPage']);
      component.dataSource = { filter: '', paginator } as any;
      component.applyFilter({ target: { value: '  tv  ' } } as any);
      expect(paginator.firstPage).toHaveBeenCalled();
    });
  });

  describe('edit helpers', () => {
    it('enableEdit should flag the row as editing', () => {
      const row: any = {};
      component.enableEdit(row);
      expect(row.isEditing).toBeTrue();
    });

    it('updateRecord should clear editing flag and delegate to the service', () => {
      const row: any = { isEditing: true };
      component.updateRecord(row);
      expect(row.isEditing).toBeFalse();
      expect(appliancesServiceSpy.updateAppliances).toHaveBeenCalledWith(row);
    });
  });

  describe('NgxPrintDirective usage', () => {
    it('should attach the print directive to the print button', () => {
      const printButtons = fixture.debugElement.queryAll(By.directive(NgxPrintDirective));
      expect(printButtons.length).toBeGreaterThan(0);
      const directive = printButtons[0].injector.get(NgxPrintDirective);
      expect(directive.printSectionId).toBe('applianceDetails');
      expect(directive.optionalPrintSectionId).toBe('applianceSummary');
      expect(directive.useExistingCss).toBeTrue();
      expect(directive.printTitle).toBe('InsuranceDetails');
    });
  });
});
