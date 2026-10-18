import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { RemindersComponent } from './reminders.component';
import { EventAddComponent } from './event-add.component';
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
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const todayDate = toDmy(now);
    const nextMonthDate = toDmy(new Date(now.getFullYear(), now.getMonth() + 1, 15));
    const nextMonthHolidayDate = toDmy(new Date(now.getFullYear(), now.getMonth() + 1, 20));
    const nextYearHolidayDate = toDmy(new Date(now.getFullYear() + 1, now.getMonth() + 1, 20));
    const pastMonthDate = toDmy(new Date(now.getFullYear(), now.getMonth() - 1, 15));

    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    dialogSpy.open.and.returnValue({ afterClosed: () => of(null) } as any);

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
    });

    TestBed.overrideProvider(MatDialog, { useValue: dialogSpy });
    await TestBed.compileComponents();

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

    it('should show only current/next-month events in the card, excluding future-year holidays', () => {
      expect(component.eventData.map(r => r.eventDetail)).toEqual(['Alice', 'Diwali']);
    });
  });

  describe('openAddDialog', () => {
    it('should open the dialog to add an event record', () => {
      component.openAddDialog();
      expect(dialogSpy.open).toHaveBeenCalledWith(EventAddComponent);
    });
  });

  describe('deleteRow', () => {
    it('should delegate to the service', () => {
      const row: any = { eventDetail: 'Alice' };
      component.deleteRow(row);
      expect(eventsServiceSpy.deleteRow).toHaveBeenCalledWith(row);
    });
  });

  describe('upload', () => {
    it('onFileSelected should capture the chosen file', () => {
      const file = new File(['x'], 'events.txt', { type: 'text/plain' });
      component.onFileSelected({ target: { files: [file] } });
      expect(component.selectedFile).toBe(file);
    });

    it('uploadEvents should send the file and clear the input', () => {
      const file = new File(['x'], 'events.txt', { type: 'text/plain' });
      component.selectedFile = file;
      const input = { value: 'C:\\fakepath\\events.txt' } as HTMLInputElement;

      component.uploadEvents(input);

      expect(eventsServiceSpy.uploadEventFile).toHaveBeenCalledWith(file);
      expect(input.value).toBe('');
      expect(component.selectedFile).toBeNull();
    });

    it('uploadEvents should warn when no file is selected', () => {
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
