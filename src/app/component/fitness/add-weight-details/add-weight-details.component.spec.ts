import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AddWeightDetailsComponent } from './add-weight-details.component';
import { FitnessService } from '../../../service/fitness.service';

describe('AddWeightDetailsComponent', () => {
  let component: AddWeightDetailsComponent;
  let fixture: ComponentFixture<AddWeightDetailsComponent>;
  let fitnessServiceSpy: jasmine.SpyObj<FitnessService>;
  let dialogSpy: jasmine.SpyObj<MatDialogRef<AddWeightDetailsComponent>>;

  const dialogData = {
    personName: 'John',
    height: '170',
    date: new Date('2024-01-01')
  };

  beforeEach(async () => {
    dialogSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    fitnessServiceSpy = jasmine.createSpyObj('FitnessService', ['fetchPersonNames', 'savePersonWeight']);
    fitnessServiceSpy.fetchPersonNames.and.returnValue(of([{ value: 'John' }, { value: 'Doe' }]));
    fitnessServiceSpy.savePersonWeight.and.returnValue(of({}) as any);

    await TestBed.configureTestingModule({
      imports: [AddWeightDetailsComponent, NoopAnimationsModule],
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

    fixture = TestBed.createComponent(AddWeightDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should prefill the form from dialog data', () => {
    expect(component.formGroup.get('date').value).toBe(dialogData.date);
    expect(component.formGroup.get('personName').value).toBe('John');
    expect(component.formGroup.get('height').value).toBe('170');
    expect(component.formGroup.get('weight').value).toBeNull();
  });

  it('should load person names on init', () => {
    expect(fitnessServiceSpy.fetchPersonNames).toHaveBeenCalled();
    expect(component.person).toEqual([{ value: 'John' }, { value: 'Doe' }]);
  });

  it('form should require date, personName, height and weight', () => {
    const form = component.formGroup;
    form.get('weight').setValue(null);
    expect(form.invalid).toBeTrue();

    form.get('weight').setValue('75');
    expect(form.valid).toBeTrue();

    form.get('date').setValue(null);
    expect(form.get('date').hasError('required')).toBeTrue();
    expect(form.invalid).toBeTrue();
    form.get('date').setValue(new Date());

    form.get('personName').setValue(null);
    expect(form.get('personName').hasError('required')).toBeTrue();
    form.get('personName').setValue('John');

    form.get('height').setValue(null);
    expect(form.get('height').hasError('required')).toBeTrue();
    form.get('height').setValue('170');
    expect(form.valid).toBeTrue();
  });

  it('should reject non-numeric height and weight via pattern validation', () => {
    component.formGroup.get('height').setValue('abc');
    expect(component.formGroup.get('height').hasError('pattern')).toBeTrue();
    expect(component.formGroup.invalid).toBeTrue();

    component.formGroup.get('height').setValue('170');
    component.formGroup.get('weight').setValue('xyz');
    expect(component.formGroup.get('weight').hasError('pattern')).toBeTrue();
    expect(component.formGroup.invalid).toBeTrue();
  });

  it('onSubmit with a valid form should save person weight and reset only the weight field', () => {
    component.formGroup.setValue({
      date: new Date('2024-02-01'),
      personName: 'John',
      height: '172',
      weight: '80'
    });
    const formValue = component.formGroup.value;

    component.onSubmit(formValue);

    expect(fitnessServiceSpy.savePersonWeight).toHaveBeenCalledWith(jasmine.objectContaining({
      personName: 'John',
      height: '172',
      weight: '80'
    }));
    expect(component.formGroup.get('weight').value).toBeNull();
    expect(component.formGroup.get('personName').value).toBe('John');
    expect(component.formGroup.get('height').value).toBe('172');
  });

  it('onSubmit with an invalid form should not save person weight', () => {
    component.formGroup.get('weight').setValue(null);
    component.onSubmit(component.formGroup.value);
    expect(fitnessServiceSpy.savePersonWeight).not.toHaveBeenCalled();
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