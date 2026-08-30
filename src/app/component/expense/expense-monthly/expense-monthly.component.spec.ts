import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ExpenseMonthlyComponent } from './expense-monthly.component';

describe('ExpenseMonthlyComponent', () => {
  let component: ExpenseMonthlyComponent;
  let fixture: ComponentFixture<ExpenseMonthlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseMonthlyComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: {} },
        provideRouter([]),
        { provide: MatDialog, useValue: {} }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExpenseMonthlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
