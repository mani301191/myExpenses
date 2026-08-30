import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AlertsDialogComponent } from './alerts-dialog.component';
import { EventData } from '../reminders/event-data';

describe('AlertsDialogComponent', () => {
  let component: AlertsDialogComponent;
  let fixture: ComponentFixture<AlertsDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<AlertsDialogComponent>>;

  const notifications: EventData[] = [
    { eventId: '1', eventType: 'Birthday', eventDate: new Date('2026-01-01'), eventDetail: 'John birthday', recurrence: 'yearly' },
    { eventId: '2', eventType: 'Meetings', eventDate: new Date('2026-02-01'), eventDetail: 'Team sync', recurrence: 'monthly' },
    { eventId: '3', eventType: 'Holiday', eventDate: new Date('2026-03-01'), eventDetail: 'Pongal', recurrence: 'yearly' }
  ];

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    await TestBed.configureTestingModule({
      imports: [AlertsDialogComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { notifications } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the notifications passed through MAT_DIALOG_DATA', () => {
    expect(component.data.notifications).toEqual(notifications);
  });

  it('should render one alert row per notification', () => {
    const rows = fixture.nativeElement.querySelectorAll('.alert-row');
    expect(rows.length).toBe(3);
  });

  describe('close', () => {
    it('should close the dialog', () => {
      component.close();
      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });

  describe('getIcon', () => {
    it('should return the cake icon for birthday', () => {
      expect(component.getIcon('birthday')).toBe('cake');
    });

    it('should return the event icon for meetings', () => {
      expect(component.getIcon('meetings')).toBe('event');
    });

    it('should return the beach_access icon for holiday', () => {
      expect(component.getIcon('holiday')).toBe('beach_access');
    });

    it('should return the payment icon for paymentdue', () => {
      expect(component.getIcon('paymentdue')).toBe('payment');
    });

    it('should return the celebration icon for festival', () => {
      expect(component.getIcon('festival')).toBe('celebration');
    });

    it('should return the flight_takeoff icon for travel', () => {
      expect(component.getIcon('travel')).toBe('flight_takeoff');
    });

    it('should return the notifications icon for unknown types', () => {
      expect(component.getIcon('randomType')).toBe('notifications');
    });

    it('should handle uppercase event type values', () => {
      expect(component.getIcon('BIRTHDAY')).toBe('cake');
      expect(component.getIcon('PAYMENTDUE')).toBe('payment');
    });

    it('should return the default icon when the type is undefined', () => {
      expect(component.getIcon(undefined as any)).toBe('notifications');
    });
  });

  describe('getIconColor', () => {
    it('should return birthday color for birthday', () => {
      expect(component.getIconColor('birthday')).toBe('birthday');
    });

    it('should return meeting color for meetings', () => {
      expect(component.getIconColor('meetings')).toBe('meeting');
    });

    it('should return holiday color for holiday', () => {
      expect(component.getIconColor('holiday')).toBe('holiday');
    });

    it('should return paymentdue color for paymentdue', () => {
      expect(component.getIconColor('paymentdue')).toBe('paymentdue');
    });

    it('should return celebration color for festival', () => {
      expect(component.getIconColor('festival')).toBe('celebration');
    });

    it('should return travel color for travel', () => {
      expect(component.getIconColor('travel')).toBe('travel');
    });

    it('should return default color for unknown types', () => {
      expect(component.getIconColor('randomType')).toBe('default');
    });

    it('should handle uppercase event type values', () => {
      expect(component.getIconColor('HOLIDAY')).toBe('holiday');
    });
  });
});