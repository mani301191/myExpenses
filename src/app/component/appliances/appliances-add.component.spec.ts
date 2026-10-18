import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AppliancesAddComponent } from './appliances-add.component';
import { AppliancesService } from '../../service/appliances.service';

describe('AppliancesAddComponent', () => {
  let component: AppliancesAddComponent;
  let fixture: ComponentFixture<AppliancesAddComponent>;
  let appliancesServiceSpy: jasmine.SpyObj<AppliancesService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<AppliancesAddComponent>>;

  beforeEach(async () => {
    appliancesServiceSpy = jasmine.createSpyObj('AppliancesService', ['saveAppliancesData']);
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [AppliancesAddComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: AppliancesService, useValue: appliancesServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppliancesAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form validation', () => {
    it('should require the mandatory fields', () => {
      expect(component.formGroup.valid).toBeFalse();
      expect(component.formGroup.get('applianceName')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.get('amc')!.errors?.['required']).toBeTruthy();
    });

    it('should become valid once required fields are filled', () => {
      component.formGroup.setValue({
        applianceName: 'Microwave',
        amc: 'Yes',
        amcEndDate: new Date(),
        lastServicedDate: new Date(),
        additionalDetails: 'Kitchen'
      });
      expect(component.formGroup.valid).toBeTrue();
    });
  });

  describe('onSubmit', () => {
    it('should save a valid form and clear it', () => {
      component.formGroup.setValue({
        applianceName: 'Microwave',
        amc: 'Yes',
        amcEndDate: new Date(),
        lastServicedDate: new Date(),
        additionalDetails: 'Kitchen'
      });
      component.onSubmit(component.formGroup.value);
      expect(appliancesServiceSpy.saveAppliancesData).toHaveBeenCalledWith(
        jasmine.objectContaining({ applianceName: 'Microwave', amc: 'Yes' })
      );
      expect(component.formGroup.get('applianceName')!.value).toBeNull();
    });

    it('should not save an invalid form', () => {
      component.onSubmit(component.formGroup.value);
      expect(appliancesServiceSpy.saveAppliancesData).not.toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('should close the dialog', () => {
      component.close();
      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });
});
