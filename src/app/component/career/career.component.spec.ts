import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { CareerComponent } from './career.component';
import { CareerAddComponent } from './career-add.component';
import { CareerService } from '../../service/career.service';

function toDmy(date: Date): string {
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  return `${day}/${month}/${date.getFullYear()}`;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

describe('CareerComponent', () => {
  let component: CareerComponent;
  let fixture: ComponentFixture<CareerComponent>;
  let careerServiceSpy: jasmine.SpyObj<CareerService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    dialogSpy.open.and.returnValue({ afterClosed: () => of(null) } as any);
    careerServiceSpy = jasmine.createSpyObj('CareerService', [
      'fetchCareerData',
      'fetchPersonNames',
      'saveCareerData',
      'deleteRow',
      'updateCareertDetail'
    ]);

    careerServiceSpy.fetchPersonNames.and.returnValue(of([
      { id: 'Self', value: 'Self' },
      { id: 'Spouse', value: 'Spouse' }
    ] as any));

    careerServiceSpy.fetchCareerData.and.returnValue(of([
      { personName: 'Self', recordType: 'Employment', orgName: 'Infosys', recordId: 'R1', designation: 'Developer', startDate: toDmy(addMonths(new Date(), -18)), endDate: toDmy(addMonths(new Date(), -12)), comments: 'first' },
      { personName: 'Spouse', recordType: 'Education', orgName: 'Anna University', recordId: 'E1', designation: 'B.E.', startDate: toDmy(addMonths(new Date(), -60)), endDate: toDmy(addMonths(new Date(), -48)), comments: 'study' },
      { personName: 'Self', recordType: 'Employment', orgName: 'Wipro', recordId: 'R2', designation: 'Manager', startDate: toDmy(addMonths(new Date(), -6)), endDate: '', comments: 'open-ended' }
    ] as any));

    await TestBed.configureTestingModule({
      imports: [CareerComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
        { provide: CareerService, useValue: careerServiceSpy }
      ]
    });

    TestBed.overrideProvider(MatDialog, { useValue: dialogSpy });
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(CareerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial load', () => {
    it('should request all career data once on init', () => {
      expect(careerServiceSpy.fetchCareerData).toHaveBeenCalledTimes(1);
    });

    it('should not display any rows until a person is selected', () => {
      expect(component.selectedPerson).toBe('');
      expect(component.dataSource.data.length).toBe(0);
      expect(component.employmentData.length).toBe(0);
    });
  });

  describe('person filter', () => {
    it('should load the person names from the service', () => {
      expect(component.personNames.map(p => p.value)).toEqual(['Self', 'Spouse']);
    });

    it('should show only the selected person records in the table', () => {
      component.selectedPerson = 'Spouse';
      component.onPersonChange();
      expect(component.dataSource.data.length).toBe(1);
      expect(component.dataSource.data[0].orgName).toBe('Anna University');
    });

    it('should build the work summary from the selected person employment records only', () => {
      component.selectedPerson = 'Self';
      component.onPersonChange();
      expect(component.employmentData.length).toBe(2);
      expect(component.employmentData[0].orgName).toBe('Wipro');
      expect(component.employmentData[1].orgName).toBe('Infosys');
    });

    it('should clear the table when the selection is cleared', () => {
      component.selectedPerson = 'Self';
      component.onPersonChange();
      component.selectedPerson = '';
      component.onPersonChange();
      expect(component.dataSource.data.length).toBe(0);
    });
  });

  describe('openAddDialog', () => {
    it('should open the dialog to add a career record', () => {
      component.openAddDialog();
      expect(dialogSpy.open).toHaveBeenCalledWith(CareerAddComponent);
    });
  });

  describe('deleteRow', () => {
    it('should delegate to the service', () => {
      const row: any = { recordId: 'R1' };
      component.deleteRow(row);
      expect(careerServiceSpy.deleteRow).toHaveBeenCalledWith(row);
    });
  });

  describe('calculateDuration', () => {
    it('should return zero years for same dates', () => {
      expect(component.calculateDuration('01/01/2024', '01/01/2026')).toBe('2 years, 0 months, 0 days');
    });

    it('should handle normal month/day differences', () => {
      expect(component.calculateDuration('01/01/2025', '26/02/2026')).toBe('1 years, 1 months, 25 days');
    });

    it('should borrow a month when days go negative', () => {
      expect(component.calculateDuration('15/03/2026', '12/06/2026')).toBe('0 years, 2 months, 28 days');
    });

    it('should default a missing end date to today', () => {
      const result = component.calculateDuration('15/06/2020', '');
      expect(result).toMatch(/^\d+ years, \d+ months, \d+ days$/);
    });
  });

  describe('row editing', () => {
    it('enableEdit should flag the row as editing', () => {
      const row: any = { orgName: 'Tata' };
      component.enableEdit(row);
      expect(row.isEditing).toBeTrue();
    });

    it('updateRecord should unflag the row and call the service', () => {
      const row: any = { orgName: 'Tata' };
      component.updateRecord(row);
      expect(row.isEditing).toBeFalse();
      expect(careerServiceSpy.updateCareertDetail).toHaveBeenCalledWith(row);
    });
  });

  describe('applyFilter', () => {
    it('should set the table filter', () => {
      component.applyFilter({ target: { value: 'Infosys' } } as any);
      expect(component.dataSource.filter).toBe('infosys');
    });
  });
});
