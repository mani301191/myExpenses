import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
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
    const currentMonthDate = toDmy(new Date(now.getFullYear(), now.getMonth(), 15));
    const otherMonthDate = toDmy(new Date(now.getFullYear(), now.getMonth() + 1, 15));

    eventsServiceSpy = jasmine.createSpyObj('EventsService', [
      'fetchEventData',
      'fetchEventTypeDropdownData',
      'saveEventData',
      'deleteRow'
    ]);
    eventsServiceSpy.fetchEventData.and.returnValue(
      of([
        { eventDate: currentMonthDate, eventType: 'Birthday', eventDetail: 'Alice', recurrence: 'none' },
        { eventDate: otherMonthDate, eventType: 'Travel', eventDetail: 'Trip', recurrence: 'none' },
        { eventDate: '', eventType: 'Holiday', eventDetail: 'X', recurrence: 'daily' }
      ] as any)
    );
    eventsServiceSpy.fetchEventTypeDropdownData.and.returnValue(
      of([{ id: '1', value: 'Birthday' }, { id: '2', value: 'Meeting' }])
    );

    await TestBed.configureTestingModule({
      imports: [RemindersComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
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
    it('should load all rows into the table', () => {
      expect(component.dataSource.data.length).toBe(3);
    });

    it('should load the event type dropdown on init', () => {
      expect(component.eventTypes.length).toBe(2);
    });

    it('should keep only events of the current month in eventData', () => {
      expect(component.eventData.length).toBe(1);
      expect(component.eventData[0].eventDetail).toBe('Alice');
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