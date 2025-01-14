import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWeightDetailsComponent } from './add-weight-details.component';

describe('AddWeightDetailsComponent', () => {
  let component: AddWeightDetailsComponent;
  let fixture: ComponentFixture<AddWeightDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddWeightDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddWeightDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
