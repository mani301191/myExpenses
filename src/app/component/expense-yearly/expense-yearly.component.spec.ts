import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseYearlyComponent } from './expense-yearly.component';

describe('ExpenseYearlyComponent', () => {
  let component: ExpenseYearlyComponent;
  let fixture: ComponentFixture<ExpenseYearlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseYearlyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExpenseYearlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
