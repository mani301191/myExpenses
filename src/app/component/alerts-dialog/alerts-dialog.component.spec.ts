import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertsDialogComponent } from './alerts-dialog.component';

describe('AlertsDialogComponent', () => {
  let component: AlertsDialogComponent;
  let fixture: ComponentFixture<AlertsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AlertsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
