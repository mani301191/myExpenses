import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { EventData } from './component/reminders/event-data';

function toDmy(date: Date): string {
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  return `${day}/${month}/${date.getFullYear()}`;
}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: {} },
        provideRouter([]),
        { provide: MatDialog, useValue: {} }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'myExpenses' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('myExpenses');
  });

  it('should render the app navigation', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('nav')).toBeTruthy();
  });

  describe('notifications', () => {
    let app: AppComponent;
    let httpMock: HttpTestingController;

    const event = (id: string, eventDate: string, eventType: string, recurrence: string): EventData =>
      ({ eventId: id, eventDate: eventDate as any, eventType, eventDetail: id, recurrence });

    beforeEach(() => {
      const fixture = TestBed.createComponent(AppComponent);
      app = fixture.componentInstance;
      httpMock = TestBed.inject(HttpTestingController);
      app.ngOnInit();
    });

    function flushEvents(events: EventData[]): void {
      httpMock.expectOne(r => r.url.includes('event/eventDetail')).flush(events as any);
      httpMock.expectOne(r => r.url.includes('profile/profileDetail')).flush({});
    }

    it('should include current-month events that are upcoming', () => {
      const today = new Date();
      const todayStr = toDmy(today);

      flushEvents([event('today', todayStr, 'Meetings', 'none')]);

      expect(app.notificationResponse.map(e => e.eventId)).toEqual(['today']);
      expect(app.messageCount).toBe(1);
    });

    it('should match recurring birthdays by month regardless of the stored year', () => {
      const today = new Date();
      const birthday = new Date(1986, today.getMonth(), today.getDate());

      flushEvents([event('birthday', toDmy(birthday), 'Birthday', 'Yearly')]);

      expect(app.notificationResponse.map(e => e.eventId)).toEqual(['birthday']);
    });

    it('should include all upcoming events regardless of type, sorted by date', () => {
      const today = new Date();
      const nextMonthHoliday = new Date(today.getFullYear(), today.getMonth() + 1, 15);
      const nextMonthBirthday = new Date(1986, today.getMonth() + 1, 16);
      const nextMonthTravel = new Date(today.getFullYear(), today.getMonth() + 1, 17);

      flushEvents([
        event('travel', toDmy(nextMonthTravel), 'Travel', 'None'),
        event('birthday', toDmy(nextMonthBirthday), 'Birthday', 'Yearly'),
        event('holiday', toDmy(nextMonthHoliday), 'Gazetted Holiday', 'None')
      ]);

      expect(app.notificationResponse.map(e => e.eventId)).toEqual(['holiday', 'birthday', 'travel']);
      expect(app.messageCount).toBe(3);
    });

    it('should use the actual year for non-recurring events', () => {
      const today = new Date();
      const pastYearHoliday = new Date(1990, today.getMonth() + 1, 10);
      const futureHoliday = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate() + 1);

      flushEvents([
        event('pastHoliday', toDmy(pastYearHoliday), 'Gazetted Holiday', 'None'),
        event('futureHoliday', toDmy(futureHoliday), 'Gazetted Holiday', 'None')
      ]);

      expect(app.notificationResponse.map(e => e.eventId)).toEqual(['futureHoliday']);
      expect(app.messageCount).toBe(1);
    });

    it('should sort upcoming non-recurring events by their actual date across years', () => {
      const today = new Date();
      const plusDays = (n: number) => new Date(today.getTime() + n * 86400000);

      flushEvents([
        event('d800', toDmy(plusDays(800)), 'Gazetted Holiday', 'None'),
        event('d1', toDmy(plusDays(1)), 'Gazetted Holiday', 'None'),
        event('d400', toDmy(plusDays(400)), 'Gazetted Holiday', 'None')
      ]);

      expect(app.notificationResponse.map(e => e.eventId)).toEqual(['d1', 'd400', 'd800']);
    });

    it('should cap the alerts at the next 8 upcoming events', () => {
      const today = new Date();
      const many = Array.from({ length: 10 }, (_, i) =>
        event(`e${i}`, toDmy(new Date(today.getFullYear(), today.getMonth(), today.getDate() + i + 1)), 'Birthday', 'yearly'));

      flushEvents(many);

      expect(app.notificationResponse.length).toBe(8);
    });
  });
});
