import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { ExpenseAddComponent } from './expense-add.component';
import { CommonService } from '../../../service/common.service';

describe('ExpenseAddComponent', () => {
  let component: ExpenseAddComponent;
  let fixture: ComponentFixture<ExpenseAddComponent>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ExpenseAddComponent>>;

  const planned = [
    { month: 1, name: 'House Rent', amount: 1000 },
    { month: 1, name: 'Groceries', amount: 500 }
  ];

  beforeEach(async () => {
    commonServiceSpy = jasmine.createSpyObj('CommonService', [
      'plannedExpense',
      'getFormattedDate',
      'addExpenseDetail'
    ]);
    commonServiceSpy.plannedExpense.and.returnValue(of(planned as any) as any);
    commonServiceSpy.getFormattedDate.and.callFake((date: Date) => {
      const day = ('0' + date.getDate()).slice(-2);
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      return `${day}/${month}/${date.getFullYear()}`;
    });
    commonServiceSpy.addExpenseDetail.and.returnValue(of({}) as any);
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ExpenseAddComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: MatDialog, useValue: {} },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: CommonService, useValue: commonServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('planned expenses', () => {
    it('should load the planned expenses for the selected date on init', () => {
      expect(commonServiceSpy.plannedExpense).toHaveBeenCalled();
      expect(component.items).toEqual(planned as any);
    });

    it('should reload planned expenses when the date changes', () => {
      const event = { value: new Date('2026-04-01') };
      component.onDateChange(event);
      expect(commonServiceSpy.plannedExpense).toHaveBeenCalledWith(event.value);
      expect(component.items).toEqual(planned as any);
    });
  });

  describe('form validation', () => {
    it('should require date, type, detail and amount', () => {
      expect(component.formGroup.valid).toBeFalse();
      expect(component.formGroup.get('expenseDate')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.get('expenseType')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.get('expenseOf')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.get('amount')!.errors?.['required']).toBeTruthy();
    });

    it('should reject amounts that do not start with a digit', () => {
      component.formGroup.get('amount')!.setValue('no');
      expect(component.formGroup.get('amount')!.hasError('pattern')).toBeTrue();
    });
  });

  describe('onSubmit', () => {
    it('should format the date and add the expense detail when valid', () => {
      const date = new Date('2026-03-15');
      component.formGroup.setValue({
        expenseDate: date,
        expenseType: 'Planned',
        expenseOf: 'House Rent',
        description: 'rent',
        amount: 12000
      });
      component.onSubmit(component.formGroup.value);

      expect(commonServiceSpy.getFormattedDate).toHaveBeenCalledWith(date);
      expect(commonServiceSpy.addExpenseDetail).toHaveBeenCalledWith({
        expenseDate: '15/03/2026',
        expenseType: 'Planned',
        expenseOf: 'House Rent',
        description: 'rent',
        amount: 12000
      });
      expect(component.formGroup.get('expenseType')!.value).toBeNull();
    });

    it('should not call the service when the form is invalid', () => {
      component.onSubmit(component.formGroup.value);
      expect(commonServiceSpy.addExpenseDetail).not.toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('should close the dialog', () => {
      component.close();
      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });
});