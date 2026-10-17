import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { SummaryService } from '../service/summary.service';
import { EventsService } from '../service/events.service';

function toDmy(date: Date): string {
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  return `${day}/${month}/${date.getFullYear()}`;
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let summaryServiceSpy: jasmine.SpyObj<SummaryService>;
  let eventsServiceSpy: jasmine.SpyObj<EventsService>;

  const dashboardData = () => ({
    expenseTrackingData: { income: 5000, estimate: 4000, expense: 3000, currentMonth: 'March' },
    fitnessData: [
      { name: 'John', minWeight: 70, minWeightDate: '01/01/2026', maxWeight: 80, maxWeightDate: '01/02/2026', currentWeight: 75, currentWeightDate: '01/03/2026' }
    ],
    insuranceData: [
      { type: 'Health', expiryDate: toDmy(new Date()) }
    ],
    assetData: [],
    dayWiseExpenses: []
  });

  const now = new Date();
  const todayDate = toDmy(now);
  const nextMonthHoliday = toDmy(new Date(now.getFullYear(), now.getMonth() + 1, 20));
  const pastDate = toDmy(new Date(now.getFullYear(), now.getMonth() - 1, 15));
  const eventsData = () => [
    { eventDate: todayDate, eventType: 'Birthday', eventDetail: 'Alice', recurrence: 'yearly' },
    { eventDate: nextMonthHoliday, eventType: 'Gazetted Holiday', eventDetail: 'Diwali', recurrence: 'none' },
    { eventDate: pastDate, eventType: 'Holiday', eventDetail: 'Past', recurrence: 'none' }
  ];

  beforeEach(async () => {
    summaryServiceSpy = jasmine.createSpyObj('SummaryService', ['fetchDashboardData']);
    summaryServiceSpy.fetchDashboardData.and.returnValue(of(dashboardData() as any));

    eventsServiceSpy = jasmine.createSpyObj('EventsService', ['fetchEventData']);
    eventsServiceSpy.fetchEventData.and.returnValue(of(eventsData() as any));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(withXhr()),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
        { provide: SummaryService, useValue: summaryServiceSpy },
        { provide: EventsService, useValue: eventsServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('fetchDashboardData', () => {
    it('should load dashboard data on init', () => {
      expect(summaryServiceSpy.fetchDashboardData).toHaveBeenCalled();
      expect(component.expenseTrackingData).toEqual(dashboardData().expenseTrackingData);
      expect(component.fitnessData.length).toBe(1);
      expect(component.insuranceData.length).toBe(1);
    });
  });

  describe('fetchEventData', () => {
    it('should load upcoming events across month boundaries, sorted by date', () => {
      expect(eventsServiceSpy.fetchEventData).toHaveBeenCalled();
      expect(component.upcomingEvents.map(e => e.eventDetail)).toEqual(['Alice', 'Diwali']);
    });

    it('should cap the list at the next 8 upcoming events', () => {
      const many = Array.from({ length: 10 }, (_, i) => ({
        eventDate: toDmy(new Date(now.getFullYear(), now.getMonth(), now.getDate() + i + 1)),
        eventType: 'Birthday',
        eventDetail: `E${i}`,
        recurrence: 'yearly'
      }));
      const result = (component as any).buildUpcomingEvents(many);
      expect(result.length).toBe(8);
      expect(result.map((e: any) => e.eventDetail)).toEqual(['E0', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7']);
    });

    it('should map icons for event types', () => {
      expect(component.getIcon('Birthday')).toBe('cake');
      expect(component.getIcon('Gazetted Holiday')).toBe('beach_access');
      expect(component.getIcon('Unknown')).toBe('notifications');
    });
  });

  describe('isExpiringThisMonth', () => {
    const now = new Date();

    it('should return true for a date in the current month', () => {
      expect(component.isExpiringThisMonth(toDmy(now))).toBeTrue();
    });

    it('should return false for a date in another month', () => {
      const other = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      expect(component.isExpiringThisMonth(toDmy(other))).toBeFalse();
    });

    it('should return false for an unparseable date', () => {
      expect(component.isExpiringThisMonth('not-a-date')).toBeFalse();
    });
  });

  describe('scrolling', () => {
    it('scrollLeft should scroll the container left by 300px', () => {
      const scrollBy = jasmine.createSpy('scrollBy');
      component.scrollContainer = { nativeElement: { scrollBy } } as any;
      component.scrollLeft();
      expect(scrollBy).toHaveBeenCalledWith({ left: -300, behavior: 'smooth' });
    });

    it('scrollRight should scroll the container right by 300px', () => {
      const scrollBy = jasmine.createSpy('scrollBy');
      component.scrollContainer = { nativeElement: { scrollBy } } as any;
      component.scrollRight();
      expect(scrollBy).toHaveBeenCalledWith({ left: 300, behavior: 'smooth' });
    });
  });
});