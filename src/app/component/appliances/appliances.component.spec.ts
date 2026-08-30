import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { AppliancesComponent } from './appliances.component';
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

  const applianceRows = () => [
    { applianceName: 'Refrigerator', amc: 'No', amcEndDate: null, lastServicedDate: toDmy(new Date()), additionalDetails: '' },
    { applianceName: 'Air Conditioner', amc: 'Yes', amcEndDate: '', lastServicedDate: toDmy(new Date()), additionalDetails: '' }
  ];

  beforeEach(async () => {
    const future = new Date();
    future.setMonth(future.getMonth() + 6);
    const past = new Date();
    past.setMonth(past.getMonth() - 6);

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
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: AppliancesService, useValue: appliancesServiceSpy }
      ]
    })
    .compileComponents();

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
      expect(component.dataSource).toBeDefined();
      expect(component.dataSource.data.length).toBe(3);
      expect(component.dataSource.paginator).toBe(component.paginator);
      expect(component.dataSource.sort).toBe(component.sort);
    });

    it('should filter active AMC rows (AMC Yes with end date today or later)', () => {
      expect(component.activeAMCData.length).toBe(1);
      expect(component.activeAMCData[0].applianceName).toBe('AC');
    });
  });

  describe('createForm', () => {
    it('should create the required controls', () => {
      expect(component.formGroup.contains('applianceName')).toBeTrue();
      expect(component.formGroup.contains('amc')).toBeTrue();
      expect(component.formGroup.contains('amcEndDate')).toBeTrue();
      expect(component.formGroup.contains('lastServicedDate')).toBeTrue();
      expect(component.formGroup.contains('additionalDetails')).toBeTrue();
    });

    it('should mark the form invalid when required fields are empty', () => {
      component.formGroup.setValue({
        applianceName: null,
        amc: null,
        amcEndDate: null,
        lastServicedDate: null,
        additionalDetails: null
      });
      expect(component.formGroup.valid).toBeFalse();
      expect(component.formGroup.get('applianceName')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.get('amc')!.errors?.['required']).toBeTruthy();
    });
  });

  describe('onSubmit', () => {
    it('should not call the service when the form is invalid', () => {
      fixture.detectChanges();
      component.onSubmit(component.formGroup.value);
      expect(appliancesServiceSpy.saveAppliancesData).not.toHaveBeenCalled();
    });

    it('should call saveAppliancesData and clear the form when valid', () => {
      component.formGroup.setValue({
        applianceName: 'Microwave',
        amc: 'Yes',
        amcEndDate: new Date(),
        lastServicedDate: new Date(),
        additionalDetails: 'Kitchen'
      });
      component.onSubmit(component.formGroup.value);
      expect(appliancesServiceSpy.saveAppliancesData).toHaveBeenCalledWith(jasmine.objectContaining({ applianceName: 'Microwave', amc: 'Yes' }));
      expect(component.formGroup.get('applianceName')!.value).toBeNull();
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
      component.dataSource = jasmine.createSpyObj('dataSource', ['filter']) as any;
      component.dataSource.data = applianceRows() as any;
      component.applyFilter({ target: { value: 'REF' } } as any);
      expect(component.dataSource.filter).toBe('REF'.toLowerCase().trim());
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