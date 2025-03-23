import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseMonthlyTableComponent } from './expense-monthly-table.component';

describe('ExpenseMonthlyTableComponent', () => {
  let component: ExpenseMonthlyTableComponent;
  let fixture: ComponentFixture<ExpenseMonthlyTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseMonthlyTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExpenseMonthlyTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
