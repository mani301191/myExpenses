import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { InvestmentsComponent } from './investments.component';
import { InvestmentAddComponent } from './investment-add.component';
import { InvestmentService } from '../../service/investment.service';

describe('InvestmentsComponent', () => {
  let component: InvestmentsComponent;
  let fixture: ComponentFixture<InvestmentsComponent>;
  let investmentServiceSpy: jasmine.SpyObj<InvestmentService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    dialogSpy.open.and.returnValue({ afterClosed: () => of(null) } as any);

    investmentServiceSpy = jasmine.createSpyObj('InvestmentService', [
      'fetchInvestmentData',
      'fetchInvestmentStatusDropdownData',
      'saveInvestmentData',
      'updateInvestmentStatus',
      'deleteRow'
    ]);
    investmentServiceSpy.fetchInvestmentData.and.returnValue(
      of([
        { investment: 'PPF', investmentDetail: 'ACC', vendorAccountNumber: 'V1', nominee: 'A', status: 'Active' },
        { investment: 'Shares', investmentDetail: 'RELIANCE', vendorAccountNumber: 'V2', nominee: 'B', status: 'Inactive' }
      ] as any)
    );
    investmentServiceSpy.fetchInvestmentStatusDropdownData.and.returnValue(
      of([{ id: '1', value: 'Active' }, { id: '2', value: 'Inactive' }])
    );

    await TestBed.configureTestingModule({
      imports: [InvestmentsComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
        { provide: InvestmentService, useValue: investmentServiceSpy }
      ]
    });

    TestBed.overrideProvider(MatDialog, { useValue: dialogSpy });
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(InvestmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('fetchInvestmentData', () => {
    it('should load the investment rows on init', () => {
      expect(component.dataSource.data.length).toBe(2);
    });

    it('should load the status dropdown data on init', () => {
      expect(component.investStatusList.length).toBe(2);
    });

    it('should keep only active investments in activeInvestmentData', () => {
      expect(component.activeInvestmentData.length).toBe(1);
      expect(component.activeInvestmentData[0].investment).toBe('PPF');
    });
  });

  describe('openAddDialog', () => {
    it('should open the dialog to add an investment record', () => {
      component.openAddDialog();
      expect(dialogSpy.open).toHaveBeenCalledWith(InvestmentAddComponent);
    });
  });

  describe('deleteRow', () => {
    it('should delegate to the service', () => {
      const row: any = { vendorAccountNumber: 'V1' };
      component.deleteRow(row);
      expect(investmentServiceSpy.deleteRow).toHaveBeenCalledWith(row);
    });
  });

  describe('row editing', () => {
    it('enableEdit should flag the row as editing', () => {
      const row: any = { vendorAccountNumber: 'V1' };
      component.enableEdit(row);
      expect(row.isEditing).toBeTrue();
    });

    it('updateRecord should unflag the row and call the service', () => {
      const row: any = { vendorAccountNumber: 'V1' };
      component.updateRecord(row);
      expect(row.isEditing).toBeFalse();
      expect(investmentServiceSpy.updateInvestmentStatus).toHaveBeenCalledWith(row);
    });
  });

  describe('applyFilter', () => {
    it('should set the table filter', () => {
      component.applyFilter({ target: { value: 'PPF' } } as any);
      expect(component.dataSource.filter).toBe('ppf');
    });
  });
});
