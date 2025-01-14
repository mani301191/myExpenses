import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeightDetailsComponent } from './weight-details.component';

describe('WeightDetailsComponent', () => {
  let component: WeightDetailsComponent;
  let fixture: ComponentFixture<WeightDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeightDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WeightDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
