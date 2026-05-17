import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseMonthlyComponent } from './expense-monthly.component';

describe('ExpenseMonthlyComponent', () => {
  let component: ExpenseMonthlyComponent;
  let fixture: ComponentFixture<ExpenseMonthlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseMonthlyComponent]
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
