import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppliancesComponent } from './appliances.component';

describe('AppliancesComponent', () => {
  let component: AppliancesComponent;
  let fixture: ComponentFixture<AppliancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppliancesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppliancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
