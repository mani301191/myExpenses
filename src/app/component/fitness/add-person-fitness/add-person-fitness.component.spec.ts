import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPersonFitnessComponent } from './add-person-fitness.component';

describe('AddPersonFitnessComponent', () => {
  let component: AddPersonFitnessComponent;
  let fixture: ComponentFixture<AddPersonFitnessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPersonFitnessComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddPersonFitnessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
