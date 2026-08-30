import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ProfileSettingComponent } from './profile-setting.component';
import { CommonService } from '../../service/common.service';

describe('ProfileSettingComponent', () => {
  let component: ProfileSettingComponent;
  let fixture: ComponentFixture<ProfileSettingComponent>;
  let commonServiceSpy: jasmine.SpyObj<CommonService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ProfileSettingComponent>>;

  beforeEach(async () => {
    commonServiceSpy = jasmine.createSpyObj('CommonService', ['saveProfileData']);
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ProfileSettingComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: CommonService, useValue: commonServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('createForm', () => {
    it('should create a form with a required profileName', () => {
      expect(component.formGroup.contains('profileName')).toBeTrue();
      expect(component.formGroup.get('profileName')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.valid).toBeFalse();
    });

    it('should become valid once a name is provided', () => {
      component.formGroup.get('profileName')!.setValue('John');
      expect(component.formGroup.valid).toBeTrue();
    });
  });

  describe('onSelectFile', () => {
    it('should read the selected file and update the profile picture preview', () => {
      const mockReader: any = {
        result: null,
        onload: null,
        readAsDataURL: jasmine.createSpy('readAsDataURL')
      };
      spyOn(window as any, 'FileReader').and.returnValue(mockReader);

      const event = { target: { files: [{ name: 'pic.png' }] } };
      component.onSelectFile(event);
      expect(mockReader.readAsDataURL).toHaveBeenCalled();

      mockReader.onload({ target: { result: 'data:image/png;base64,pic' } });
      expect(component.url).toBe('data:image/png;base64,pic');
      expect(component.profilePic).toBe('data:image/png;base64,pic');
    });

    it('should do nothing when no file is selected', () => {
      const readerSpy = spyOn(window as any, 'FileReader');
      component.onSelectFile({ target: { files: [] } });
      expect(readerSpy).not.toHaveBeenCalled();
    });
  });

  describe('onSubmit', () => {
    it('should save the profile with the picture and reset the form when valid', () => {
      component.url = 'data:image/png;base64,pic';
      component.formGroup.setValue({ profileName: 'John' });
      component.onSubmit(component.formGroup.value);

      expect(commonServiceSpy.saveProfileData).toHaveBeenCalledWith({ profileName: 'John', profilePic: 'data:image/png;base64,pic' });
      expect(component.formGroup.get('profileName')!.value).toBe('');
    });

    it('should not save when the form is invalid', () => {
      component.onSubmit(component.formGroup.value);
      expect(commonServiceSpy.saveProfileData).not.toHaveBeenCalled();
      expect(component.formGroup.get('profileName')!.value).toBe('');
    });
  });

  describe('close', () => {
    it('should close the dialog', () => {
      component.close();
      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });
});