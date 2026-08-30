import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { MedicalDetailsComponent } from './medical-details.component';
import { FitnessService } from '../../../service/fitness.service';

describe('MedicalDetailsComponent', () => {
  let component: MedicalDetailsComponent;
  let fixture: ComponentFixture<MedicalDetailsComponent>;
  let fitnessServiceSpy: jasmine.SpyObj<FitnessService>;
  let dialogSpy: jasmine.SpyObj<MatDialogRef<MedicalDetailsComponent>>;

  const mockMedical = [
    {
      id: 'm1',
      date: '01/01/2024',
      patientName: 'John',
      problem: 'Fever',
      hospital: 'General',
      docterName: 'Dr. Smith',
      diagnosis: 'Cold',
      otherDetails: 'Rest'
    },
    {
      id: 'm2',
      date: '02/02/2024',
      patientName: 'John',
      problem: 'Migraine',
      hospital: 'City',
      docterName: 'Dr. Lane',
      diagnosis: 'None',
      otherDetails: 'Medication'
    }
  ];

  beforeEach(async () => {
    dialogSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    fitnessServiceSpy = jasmine.createSpyObj('FitnessService', [
      'fetchMedicalDetails',
      'deleteMedicalDetailData',
      'updateMedicalDetail'
    ]);
    fitnessServiceSpy.fetchMedicalDetails.and.returnValue(of(mockMedical));

    await TestBed.configureTestingModule({
      imports: [MedicalDetailsComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: {} },
        { provide: MatDialogRef, useValue: dialogSpy },
        { provide: FitnessService, useValue: fitnessServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicalDetailsComponent);
    component = fixture.componentInstance;
    component.patientName = 'John';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch medical details for the patient on init and populate the table', () => {
    expect(fitnessServiceSpy.fetchMedicalDetails).toHaveBeenCalledWith('John');
    expect(component.dataSource).toBeTruthy();
    expect(component.dataSource.data).toEqual(mockMedical);
  });

  it('should call fetchMedicalDetails with the assigned patient name', () => {
    fitnessServiceSpy.fetchMedicalDetails.calls.reset();
    component.patientName = 'Jane';
    component.ngOnInit();
    expect(fitnessServiceSpy.fetchMedicalDetails).toHaveBeenCalledWith('Jane');
  });

  it('applyFilter should set the trimmed lowercase filter on the datasource', () => {
    const event = { target: { value: '  Fever  ' } } as any;
    component.applyFilter(event);
    expect(component.dataSource.filter).toBe('fever');
  });

  it('applyFilter should send the paginator back to the first page when present', () => {
    const firstPageSpy = jasmine.createSpy('firstPage');
    component.dataSource.paginator = { firstPage: firstPageSpy, page: of(null), initialized: of(null as any) } as any;
    const event = { target: { value: 'fever' } } as any;
    component.applyFilter(event);
    expect(firstPageSpy).toHaveBeenCalled();
  });

  it('enableEdit should flag the row as editing', () => {
    const element: any = { problem: 'Fever' };
    component.enableEdit(element);
    expect(element.isEditing).toBeTrue();
  });

  it('updateRecord should unflag the row and call updateMedicalDetail', () => {
    const element = { id: 'm1', problem: 'Updated', isEditing: true };
    component.updateRecord(element);
    expect(element.isEditing).toBeFalse();
    expect(fitnessServiceSpy.updateMedicalDetail).toHaveBeenCalledWith(element);
  });

  it('deleteRow should call deleteMedicalDetailData', () => {
    component.deleteRow(mockMedical[0]);
    expect(fitnessServiceSpy.deleteMedicalDetailData).toHaveBeenCalledWith(mockMedical[0]);
  });

  it('close should close the dialog', () => {
    component.close();
    expect(dialogSpy.close).toHaveBeenCalled();
  });
});
