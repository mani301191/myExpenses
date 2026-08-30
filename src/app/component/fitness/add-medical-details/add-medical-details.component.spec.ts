import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AddMedicalDetailsComponent } from './add-medical-details.component';
import { FitnessService } from '../../../service/fitness.service';

describe('AddMedicalDetailsComponent', () => {
  let component: AddMedicalDetailsComponent;
  let fixture: ComponentFixture<AddMedicalDetailsComponent>;
  let fitnessServiceSpy: jasmine.SpyObj<FitnessService>;
  let dialogSpy: jasmine.SpyObj<MatDialogRef<AddMedicalDetailsComponent>>;

  const dialogData = {
    patientName: 'John',
    date: new Date('2024-01-01')
  };

  const validPayload = {
    date: new Date('2024-02-01'),
    patientName: 'John',
    problem: 'Fever',
    hospital: 'General',
    docterName: 'Dr. Smith',
    diagnosis: 'Cold',
    otherDetails: 'Take rest'
  };

  beforeEach(async () => {
    dialogSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    fitnessServiceSpy = jasmine.createSpyObj('FitnessService', ['fetchPersonNames', 'saveMedicalDetails']);
    fitnessServiceSpy.fetchPersonNames.and.returnValue(of([{ value: 'John' }, { value: 'Doe' }]));
    fitnessServiceSpy.saveMedicalDetails.and.returnValue(of({}) as any);

    await TestBed.configureTestingModule({
      imports: [AddMedicalDetailsComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: {} },
        { provide: MatDialogRef, useValue: dialogSpy },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: FitnessService, useValue: fitnessServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMedicalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should prefill the form from dialog data', () => {
    expect(component.formGroup.get('date').value).toBe(dialogData.date);
    expect(component.formGroup.get('patientName').value).toBe('John');
  });

  it('should load patient names on init', () => {
    expect(fitnessServiceSpy.fetchPersonNames).toHaveBeenCalled();
    expect(component.patient).toEqual([{ value: 'John' }, { value: 'Doe' }]);
  });

  it('form should require all medical detail fields', () => {
    const form = component.formGroup;
    expect(form.get('date').hasError('required')).toBeFalse();
    expect(form.invalid).toBeTrue();

    form.get('problem').setValue(null);
    expect(form.get('problem').hasError('required')).toBeTrue();

    form.get('hospital').setValue(null);
    expect(form.get('hospital').hasError('required')).toBeTrue();

    form.get('docterName').setValue(null);
    expect(form.get('docterName').hasError('required')).toBeTrue();

    form.get('diagnosis').setValue(null);
    expect(form.get('diagnosis').hasError('required')).toBeTrue();

    form.get('otherDetails').setValue(null);
    expect(form.get('otherDetails').hasError('required')).toBeTrue();
    expect(form.invalid).toBeTrue();

    form.patchValue(validPayload);
    expect(form.valid).toBeTrue();
  });

  it('onSubmit with a valid form should save medical details and clear the form', () => {
    const resetSpy = jasmine.createSpy('resetForm');
    component.formGroupDirective = { resetForm: resetSpy } as any;

    component.formGroup.patchValue(validPayload);
    component.onSubmit(component.formGroup.value);

    expect(fitnessServiceSpy.saveMedicalDetails).toHaveBeenCalledWith(jasmine.objectContaining({
      patientName: 'John',
      problem: 'Fever',
      hospital: 'General',
      docterName: 'Dr. Smith',
      diagnosis: 'Cold',
      otherDetails: 'Take rest'
    }));
    expect(resetSpy).toHaveBeenCalled();
  });

  it('onSubmit with an invalid form should not save medical details', () => {
    component.formGroup.get('problem').setValue(null);
    component.onSubmit(component.formGroup.value);
    expect(fitnessServiceSpy.saveMedicalDetails).not.toHaveBeenCalled();
  });

  it('close should close the dialog', () => {
    component.close();
    expect(dialogSpy.close).toHaveBeenCalled();
  });

  it('clear should reset the form via the FormGroupDirective', () => {
    const resetSpy = jasmine.createSpy('resetForm');
    component.formGroupDirective = { resetForm: resetSpy } as any;
    component.clear();
    expect(resetSpy).toHaveBeenCalled();
  });
});