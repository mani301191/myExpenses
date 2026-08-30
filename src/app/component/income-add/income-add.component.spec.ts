import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { IncomeAddComponent } from './income-add.component';
import { CommonService } from '../../service/common.service';

describe('IncomeAddComponent', () => {
  let component: IncomeAddComponent;
  let fixture: ComponentFixture<IncomeAddComponent>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<IncomeAddComponent>>;

  beforeEach(async () => {
    commonServiceSpy = jasmine.createSpyObj('CommonService', ['getFormattedDate', 'addIncomeDetail']);
    commonServiceSpy.getFormattedDate.and.callFake((date: Date) => {
      const day = ('0' + date.getDate()).slice(-2);
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      return `${day}/${month}/${date.getFullYear()}`;
    });
    commonServiceSpy.addIncomeDetail.and.returnValue(of({}) as any);
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [IncomeAddComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: CommonService, useValue: commonServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form validation', () => {
    it('should require date, source and amount', () => {
      expect(component.formGroup.valid).toBeFalse();
      expect(component.formGroup.get('incomeDate')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.get('source')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.get('amount')!.errors?.['required']).toBeTruthy();
    });

    it('should reject amounts that do not start with a digit', () => {
      component.formGroup.get('amount')!.setValue('no');
      expect(component.formGroup.get('amount')!.hasError('pattern')).toBeTrue();
    });
  });

  describe('onSubmit', () => {
    it('should format the date and add the income detail when valid', () => {
      const date = new Date('2026-03-15');
      component.formGroup.setValue({ incomeDate: date, source: 'Salary', amount: 5000 });
      component.onSubmit(component.formGroup.value);

      expect(commonServiceSpy.getFormattedDate).toHaveBeenCalledWith(date);
      expect(commonServiceSpy.addIncomeDetail).toHaveBeenCalledWith({ incomeDate: '15/03/2026', source: 'Salary', amount: 5000 });
      expect(component.formGroup.get('source')!.value).toBeNull();
    });

    it('should not call the service when the form is invalid', () => {
      component.onSubmit(component.formGroup.value);
      expect(commonServiceSpy.addIncomeDetail).not.toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('should close the dialog', () => {
      component.close();
      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });
});