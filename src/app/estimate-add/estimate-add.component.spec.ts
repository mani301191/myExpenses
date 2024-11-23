import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstimateAddComponent } from './estimate-add.component';

describe('EstimateAddComponent', () => {
  let component: EstimateAddComponent;
  let fixture: ComponentFixture<EstimateAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstimateAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EstimateAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
