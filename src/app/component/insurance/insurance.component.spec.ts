import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { InsuranceComponent } from './insurance.component';
import { InsuranceAddComponent } from './insurance-add.component';
import { InsuranceService } from '../../service/insurance.service';

function toDmy(date: Date): string {
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  return `${day}/${month}/${date.getFullYear()}`;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

describe('InsuranceComponent', () => {
  let component: InsuranceComponent;
  let fixture: ComponentFixture<InsuranceComponent>;
  let insuranceServiceSpy: jasmine.SpyObj<InsuranceService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    const now = new Date();
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    dialogSpy.open.and.returnValue({ afterClosed: () => of(null) } as any);

    insuranceServiceSpy = jasmine.createSpyObj('InsuranceService', [
      'fetchInsuranceTypeDropdownData',
      'fetchInsuranceData',
      'saveInsuranceData',
      'deleteRow',
      'updateInsurance'
    ]);
    insuranceServiceSpy.fetchInsuranceData.and.returnValue(
      of([
        { insuranceType: 'Health', insuranceProvider: 'Care', policyNumber: '1', endDate: toDmy(addDays(now, 30)) },
        { insuranceType: 'Vehicle', insuranceProvider: 'Acko', policyNumber: '2', endDate: toDmy(addDays(now, 90)) },
        { insuranceType: 'Health', insuranceProvider: 'HDFC', policyNumber: '3', endDate: toDmy(addDays(now, -60)) },
        { insuranceType: 'Term', insuranceProvider: 'LIC', policyNumber: '4', endDate: '' }
      ] as any)
    );

    await TestBed.configureTestingModule({
      imports: [InsuranceComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
        { provide: InsuranceService, useValue: insuranceServiceSpy }
      ]
    });

    TestBed.overrideProvider(MatDialog, { useValue: dialogSpy });
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(InsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('fetchInsuranceData', () => {
    it('should mark expired policies and sort them to the end', () => {
      expect(component.dataSource.data.length).toBe(4);
      expect(component.dataSource.data[0].policyNumber).toBe('1');
      expect(component.dataSource.data[3].policyNumber).toBe('3');
      expect((component.dataSource.data[3] as any).isPast).toBeTrue();
      expect((component.dataSource.data[0] as any).isPast).toBeFalse();
    });

    it('should keep only active policies in activeInsuranceData', () => {
      expect(component.activeInsuranceData.length).toBe(2);
    });
  });

  describe('openAddDialog', () => {
    it('should open the dialog to add an insurance record', () => {
      component.openAddDialog();
      expect(dialogSpy.open).toHaveBeenCalledWith(InsuranceAddComponent);
    });
  });

  describe('deleteRow', () => {
    it('should delegate to the service', () => {
      const row: any = { policyNumber: 'P9' };
      component.deleteRow(row);
      expect(insuranceServiceSpy.deleteRow).toHaveBeenCalledWith(row);
    });
  });

  describe('row editing', () => {
    it('enableEdit should flag the row as editing', () => {
      const row: any = { policyNumber: 'P9' };
      component.enableEdit(row);
      expect(row.isEditing).toBeTrue();
    });

    it('updateRecord should unflag the row and call the service', () => {
      const row: any = { policyNumber: 'P9' };
      component.updateRecord(row);
      expect(row.isEditing).toBeFalse();
      expect(insuranceServiceSpy.updateInsurance).toHaveBeenCalledWith(row);
    });
  });

  describe('applyFilter', () => {
    it('should set the table filter', () => {
      component.applyFilter({ target: { value: 'Care' } } as any);
      expect(component.dataSource.filter).toBe('care');
    });
  });
});
