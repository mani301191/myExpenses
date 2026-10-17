import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { RemindersComponent } from './reminders.component';
import { EventsService } from '../../service/events.service';

function toDmy(date: Date): string {
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  return `${day}/${month}/${date.getFullYear()}`;
}

describe('RemindersComponent', () => {
  let component: RemindersComponent;
  let fixture: ComponentFixture<RemindersComponent>;
  let eventsServiceSpy: jasmine.SpyObj<EventsService>;

  beforeEach(async () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayDate = toDmy(now);
    const nextMonthDate = toDmy(new Date(now.getFullYear(), now.getMonth() + 1, 15));
    const nextMonthHolidayDate = toDmy(new Date(now.getFullYear(), now.getMonth() + 1, 20));
    const nextYearHolidayDate = toDmy(new Date(now.getFullYear() + 1, now.getMonth() + 1, 20));
    const pastMonthDate = toDmy(new Date(now.getFullYear(), now.getMonth() - 1, 15));

    eventsServiceSpy = jasmine.createSpyObj('EventsService', [
      'fetchEventData',
      'fetchEventTypeDropdownData',
      'saveEventData',
      'deleteRow',
      'uploadEventFile'
    ]);
    eventsServiceSpy.fetchEventData.and.returnValue(
      of([
        { eventDate: todayDate, eventType: 'Birthday', eventDetail: 'Alice', recurrence: 'yearly' },
        { eventDate: nextMonthDate, eventType: 'Travel', eventDetail: 'Trip', recurrence: 'none' },
        { eventDate: nextMonthHolidayDate, eventType: 'Gazetted Holiday', eventDetail: 'Diwali', recurrence: 'none' },
        { eventDate: nextYearHolidayDate, eventType: 'Gazetted Holiday', eventDetail: 'NextYearDiwali', recurrence: 'none' },
        { eventDate: pastMonthDate, eventType: 'Holiday', eventDetail: 'Past', recurrence: 'none' },
        { eventDate: '', eventType: 'Holiday', eventDetail: 'X', recurrence: 'daily' }
      ] as any)
    );
    eventsServiceSpy.fetchEventTypeDropdownData.and.returnValue(
      of([{ id: '1', value: 'Birthday' }, { id: '2', value: 'Meeting' }])
    );
    eventsServiceSpy.uploadEventFile.and.returnValue(of([]));
    eventsServiceSpy.uploading = of(false);

    await TestBed.configureTestingModule({
      imports: [RemindersComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
        { provide: EventsService, useValue: eventsServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemindersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('fetchEventData', () => {
    it('should load only upcoming rows into the table (past excluded)', () => {
      expect(component.dataSource.data.length).toBe(4);
      expect(component.dataSource.data.map(r => r.eventDetail)).toEqual(['Alice', 'Trip', 'Diwali', 'NextYearDiwali']);
    });

    it('should order upcoming events nearest first', () => {
      expect(component.dataSource.data[0].eventDetail).toBe('Alice');
    });

    it('should load the event type dropdown on init', () => {
      expect(component.eventTypes.length).toBe(2);
    });

    it('should show only current/next-month events in the card, excluding future-year holidays', () => {
      expect(component.eventData.map(r => r.eventDetail)).toEqual(['Alice', 'Diwali']);
    });
  });

  describe('form validation', () => {
    it('should require date, type and detail', () => {
      expect(component.formGroup.valid).toBeFalse();
      expect(component.formGroup.get('eventDate')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.get('eventType')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.get('eventDetail')!.errors?.['required']).toBeTruthy();
    });

    it('should default the recurrence to none', () => {
      expect(component.formGroup.get('recurrence')!.value).toBe('none');
    });

    it('should become valid once required fields are filled', () => {
      component.formGroup.setValue({
        eventDate: new Date(2026, 2, 15),
        eventType: 'Birthday',
        eventDetail: 'Alice',
        recurrence: 'yearly'
      });
      expect(component.formGroup.valid).toBeTrue();
    });
  });

  describe('onSubmit', () => {
    it('should save a valid form and clear it', () => {
      const value = {
        eventDate: new Date(2026, 2, 15),
        eventType: 'Birthday',
        eventDetail: 'Alice',
        recurrence: 'yearly'
      };
      component.formGroup.setValue(value);
      component.onSubmit(component.formGroup.value);
      expect(eventsServiceSpy.saveEventData).toHaveBeenCalledWith(value);
      expect(component.formGroup.get('eventDetail')!.value).toBeNull();
    });

    it('should not save an invalid form', () => {
      component.onSubmit(component.formGroup.value);
      expect(eventsServiceSpy.saveEventData).not.toHaveBeenCalled();
    });
  });

  describe('deleteRow', () => {
    it('should delegate to the service', () => {
      const row: any = { eventDetail: 'Alice' };
      component.deleteRow(row);
      expect(eventsServiceSpy.deleteRow).toHaveBeenCalledWith(row);
    });
  });

  describe('onFileSelected', () => {
    it('should capture the selected file', () => {
      const file = new File(['data'], 'events.txt', { type: 'text/plain' });
      component.onFileSelected({ target: { files: [file] } });
      expect(component.selectedFile).toBe(file);
    });

    it('should clear the selection when no file is chosen', () => {
      component.selectedFile = new File(['data'], 'events.txt');
      component.onFileSelected({ target: { files: [] } });
      expect(component.selectedFile).toBeNull();
    });
  });

  describe('uploadEvents', () => {
    it('should upload the selected file and reset the input', () => {
      const file = new File(['data'], 'events.txt', { type: 'text/plain' });
      component.selectedFile = file;
      const input = { value: 'C:\\fakepath\\events.txt' } as HTMLInputElement;

      component.uploadEvents(input);

      expect(eventsServiceSpy.uploadEventFile).toHaveBeenCalledWith(file);
      expect(input.value).toBe('');
      expect(component.selectedFile).toBeNull();
    });

    it('should ask the service to warn when no file is selected', () => {
      component.selectedFile = null;
      component.uploadEvents();
      expect(eventsServiceSpy.uploadEventFile).toHaveBeenCalledWith(null);
    });
  });

  describe('getIcon', () => {
    it('should map event types to icons case-insensitively', () => {
      expect(component.getIcon('birthday')).toBe('cake');
      expect(component.getIcon('meetings')).toBe('event');
      expect(component.getIcon('holiday')).toBe('beach_access');
      expect(component.getIcon('paymentdue')).toBe('payment');
      expect(component.getIcon('festival')).toBe('celebration');
      expect(component.getIcon('travel')).toBe('flight_takeoff');
      expect(component.getIcon('unknown')).toBe('notifications');
    });

    it('should match uploaded holiday event types like Gazetted Holiday', () => {
      expect(component.getIcon('Gazetted Holiday')).toBe('beach_access');
      expect(component.getIconColor('Gazetted Holiday')).toBe('holiday');
    });
  });

  describe('getIconColor', () => {
    it('should map event types to colors case-insensitively', () => {
      expect(component.getIconColor('birthday')).toBe('birthday');
      expect(component.getIconColor('meetings')).toBe('meeting');
      expect(component.getIconColor('holiday')).toBe('holiday');
      expect(component.getIconColor('paymentdue')).toBe('paymentdue');
      expect(component.getIconColor('festival')).toBe('celebration');
      expect(component.getIconColor('travel')).toBe('travel');
      expect(component.getIconColor('unknown')).toBe('default');
    });
  });

  describe('applyFilter', () => {
    it('should set the table filter', () => {
      component.applyFilter({ target: { value: 'Trip' } } as any);
      expect(component.dataSource.filter).toBe('trip');
    });
  });
});