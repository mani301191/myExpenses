import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AddPersonFitnessComponent } from './add-person-fitness.component';
import { FitnessService } from '../../../service/fitness.service';

describe('AddPersonFitnessComponent', () => {
  let component: AddPersonFitnessComponent;
  let fixture: ComponentFixture<AddPersonFitnessComponent>;
  let fitnessServiceSpy: jasmine.SpyObj<FitnessService>;
  let dialogSpy: jasmine.SpyObj<MatDialogRef<AddPersonFitnessComponent>>;

  const originalFileReader = (window as any).FileReader;

  function setFileReader(value: any) {
    Object.defineProperty(window, 'FileReader', {
      value,
      configurable: true,
      writable: true
    });
  }

  beforeEach(async () => {
    dialogSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    fitnessServiceSpy = jasmine.createSpyObj('FitnessService', ['savePersonDetails']);
    fitnessServiceSpy.savePersonDetails.and.returnValue(of({}) as any);

    await TestBed.configureTestingModule({
      imports: [AddPersonFitnessComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: {} },
        { provide: MatDialogRef, useValue: dialogSpy },
        { provide: FitnessService, useValue: fitnessServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPersonFitnessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    setFileReader(originalFileReader);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build a form with a required personName control', () => {
    expect(component.formGroup).toBeTruthy();
    const personName = component.formGroup.get('personName');
    expect(personName).toBeTruthy();
    expect(personName.valid).toBeFalse();
    expect(personName.hasError('required')).toBeTrue();
  });

  it('form should be valid once personName is entered', () => {
    component.formGroup.setValue({ personName: 'John' });
    expect(component.formGroup.valid).toBeTrue();
  });

  it('should set the url preview when a file is selected', () => {
    const mockReader: any = {
      readAsDataURL: jasmine.createSpy('readAsDataURL'),
      _onloadFn: null
    };
    Object.defineProperty(mockReader, 'onload', {
      get: function () { return this._onloadFn; },
      set: function (fn: any) { this._onloadFn = fn; },
      configurable: true
    });
    setFileReader(function () { return mockReader; });

    const file = new File(['abc'], 'pic.png', { type: 'image/png' });
    component.onSelectFile({ target: { files: [file] } });

    expect(mockReader.readAsDataURL).toHaveBeenCalledWith(file);
    expect(mockReader._onloadFn).toBeTruthy();

    mockReader._onloadFn({ target: { result: 'data:image/png;base64,AAAA' } });
    expect(component.url).toBe('data:image/png;base64,AAAA');
  });

  it('should not read the file when none is selected', () => {
    const readSpy = jasmine.createSpy('readAsDataURL');
    setFileReader(function () { return { readAsDataURL: readSpy }; });

    component.onSelectFile({ target: { files: [] } });
    expect(readSpy).not.toHaveBeenCalled();
    expect(component.url).toBeUndefined();
  });

  it('close should close the dialog', () => {
    component.close();
    expect(dialogSpy.close).toHaveBeenCalled();
  });

  it('onSubmit with a valid form should save person details and reset the form', () => {
    component.formGroup.setValue({ personName: 'John' });
    component.url = 'data:image/png;base64,AAAA';
    const formValue = component.formGroup.value;

    component.onSubmit(formValue);

    expect(fitnessServiceSpy.savePersonDetails).toHaveBeenCalledWith({ personName: 'John', personPic: 'data:image/png;base64,AAAA' });
    expect(component.formGroup.get('personName').value).toBeNull();
  });

  it('onSubmit with an invalid form should not save person details', () => {
    fitnessServiceSpy.savePersonDetails.calls.reset();
    component.onSubmit({ personName: null });
    expect(fitnessServiceSpy.savePersonDetails).not.toHaveBeenCalled();
  });

  it('onSubmit should keep the pic null when no image uploaded', () => {
    fitnessServiceSpy.savePersonDetails.and.returnValue(of({}) as any);
    component.formGroup.setValue({ personName: 'Jane' });
    component.url = null;
    component.onSubmit(component.formGroup.value);
    expect(fitnessServiceSpy.savePersonDetails).toHaveBeenCalledWith({ personName: 'Jane', personPic: null });
  });
});