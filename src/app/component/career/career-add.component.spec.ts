import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { CareerAddComponent } from './career-add.component';
import { CareerService } from '../../service/career.service';

describe('CareerAddComponent', () => {
  let component: CareerAddComponent;
  let fixture: ComponentFixture<CareerAddComponent>;
  let careerServiceSpy: jasmine.SpyObj<CareerService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<CareerAddComponent>>;

  beforeEach(async () => {
    careerServiceSpy = jasmine.createSpyObj('CareerService', [
      'fetchPersonNames',
      'saveCareerData'
    ]);
    careerServiceSpy.fetchPersonNames.and.returnValue(of([
      { id: 'Self', value: 'Self' },
      { id: 'Spouse', value: 'Spouse' }
    ] as any));

    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [CareerAddComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: CareerService, useValue: careerServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CareerAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load person names on init', () => {
    expect(careerServiceSpy.fetchPersonNames).toHaveBeenCalledTimes(1);
    expect(component.personNames.length).toBe(2);
  });

  describe('form validation', () => {
    it('should require the mandatory fields', () => {
      expect(component.formGroup.valid).toBeFalse();
      expect(component.formGroup.get('personName')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.get('recordType')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.get('orgName')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.get('recordId')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.get('startDate')!.errors?.['required']).toBeTruthy();
    });

    it('should become valid once all required fields are set', () => {
      component.formGroup.setValue({
        personName: 'Self',
        recordType: 'Employment',
        orgName: 'TCS',
        recordId: 'R3',
        designation: 'Lead',
        comments: 'x',
        startDate: new Date(2026, 0, 3),
        endDate: ''
      });
      expect(component.formGroup.valid).toBeTrue();
    });
  });

  describe('onSubmit', () => {
    it('should save a valid form and clear it', () => {
      const value = {
        personName: 'Self',
        recordType: 'Employment',
        orgName: 'TCS',
        recordId: 'R3',
        designation: 'Lead',
        comments: 'x',
        startDate: new Date(2026, 0, 3),
        endDate: ''
      };
      component.formGroup.setValue(value);
      component.onSubmit(component.formGroup.value);
      expect(careerServiceSpy.saveCareerData).toHaveBeenCalledWith(value);
      expect(component.formGroup.get('orgName')!.value).toBeNull();
    });

    it('should not save an invalid form', () => {
      component.onSubmit(component.formGroup.value);
      expect(careerServiceSpy.saveCareerData).not.toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should reset the form', () => {
      component.formGroup.patchValue({ orgName: 'TCS' });
      component.clear();
      expect(component.formGroup.get('orgName')!.value).toBeNull();
    });
  });

  describe('close', () => {
    it('should close the dialog', () => {
      component.close();
      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });
});
