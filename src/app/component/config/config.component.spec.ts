import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { ConfigComponent } from './config.component';
import { AppConfigService } from '../../service/app-config.service';

describe('ConfigComponent', () => {
  let component: ConfigComponent;
  let fixture: ComponentFixture<ConfigComponent>;
  let appConfigServiceSpy: jasmine.SpyObj<AppConfigService>;

  beforeEach(async () => {
    appConfigServiceSpy = jasmine.createSpyObj('AppConfigService', [
      'fetchConfigData',
      'saveConfigData',
      'deleteRow',
      'saveDefaultConfigData'
    ]);
    appConfigServiceSpy.fetchConfigData.and.returnValue(
      of([
        { id: 1, key: 'currency', value: 'INR' },
        { id: 2, key: 'language', value: 'en' },
        { id: 3, key: 'theme', value: 'dark' }
      ] as any)
    );

    await TestBed.configureTestingModule({
      imports: [ConfigComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
        { provide: AppConfigService, useValue: appConfigServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('fetchConfigData', () => {
    it('should load the config rows on init', () => {
      expect(appConfigServiceSpy.fetchConfigData).toHaveBeenCalled();
      expect(component.dataSource.length).toBe(3);
      expect(component.dataSource[0].key).toBe('currency');
    });

    it('should mark loaded rows as not new', () => {
      expect(component.dataSource.every(row => row.isNew === false)).toBeTrue();
    });
  });

  describe('addData', () => {
    it('should insert a blank new row at the top and re-render the table', () => {
      const before = component.dataSource.length;
      component.addData();
      expect(component.dataSource.length).toBe(before + 1);
      expect(component.dataSource[0]).toEqual({ key: '', value: '', isNew: true });
    });
  });

  describe('saveData', () => {
    it('should push the current table data source to the service', () => {
      component.saveData();
      expect(appConfigServiceSpy.saveConfigData).toHaveBeenCalledWith(component.dataSource);
    });

    it('should include any rows added since loading', () => {
      component.addData();
      component.saveData();
      expect(appConfigServiceSpy.saveConfigData).toHaveBeenCalledWith(component.dataSource);
      expect(appConfigServiceSpy.saveConfigData.calls.mostRecent().args[0].length).toBe(4);
    });
  });

  describe('saveDefaultConfigData', () => {
    it('should ask the service to restore the defaults', () => {
      component.saveDefaultConfigData();
      expect(appConfigServiceSpy.saveDefaultConfigData).toHaveBeenCalled();
    });
  });

  describe('deleteRow', () => {
    it('should delegate to the service', () => {
      const row: any = { id: 2 };
      component.deleteRow(row);
      expect(appConfigServiceSpy.deleteRow).toHaveBeenCalledWith(row);
    });
  });
});