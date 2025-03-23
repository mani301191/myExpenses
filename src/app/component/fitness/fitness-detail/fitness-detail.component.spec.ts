import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FitnessDetailComponent } from './fitness-detail.component';

describe('FitnessDetailComponent', () => {
  let component: FitnessDetailComponent;
  let fixture: ComponentFixture<FitnessDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FitnessDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FitnessDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
