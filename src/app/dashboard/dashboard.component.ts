import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { SummaryService } from '../service/summary.service';
import { EventsService } from '../service/events.service';
import { InrFormatPipe } from '../pipes/indian-currency.pipe';


@Component({
    selector: 'app-dashboard',
    imports: [MatIconModule, CommonModule, CanvasJSAngularChartsModule, InrFormatPipe],
    templateUrl: './dashboard.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  expenseTrackingData: any = {};
  fitnessData: any[] = [];
  insuranceData: any[] = [];
  upcomingEvents: any[] = []; constructor( private summaryService: SummaryService, private eventService: EventsService) {
  }
  
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  scrollLeft(): void {
    const container = this.scrollContainer.nativeElement;
    container.scrollBy({ left: -300, behavior: 'smooth' }); // Scroll left by 300px
  }

  scrollRight(): void {
    const container = this.scrollContainer.nativeElement;
    container.scrollBy({ left: 300, behavior: 'smooth' }); // Scroll right by 300px
  }

  fetchDashboardData(): void {

    this.summaryService.fetchDashboardData().subscribe((response) => {
      this.expenseTrackingData = response.expenseTrackingData;
      this.fitnessData = response.fitnessData;
      this.insuranceData = response.insuranceData;
    });
  }

  fetchEventData(): void {
    this.eventService.fetchEventData().subscribe((res) => {
      this.upcomingEvents = this.buildUpcomingEvents(res);
    });
  }

  private buildUpcomingEvents(events: any[]): any[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();

    return (events || [])
      .map((event) => ({ event, effective: this.effectiveDate(event, today, currentYear) }))
      .filter((row) => row.effective && row.effective >= today)
      .sort((a, b) => a.effective.getTime() - b.effective.getTime())
      .slice(0, 8)
      .map((row) => row.event);
  }

  private effectiveDate(event: any, today: Date, currentYear: number): Date {
    const original = this.parseDate(event.eventDate?.toString());
    if (!original) return null;
    if ((event.recurrence || '').toLowerCase() === 'yearly') {
      const occurrence = new Date(currentYear, original.getMonth(), original.getDate());
      return occurrence < today
        ? new Date(currentYear + 1, original.getMonth(), original.getDate())
        : occurrence;
    }
    return original;
  }

  private parseDate(dateStr: string): Date {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/').map(Number);
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day);
  }

  getIcon(eventType: string): string {
    const type = eventType?.toLowerCase() ?? '';
    if (type.includes('birthday')) return 'cake';
    if (type.includes('holiday')) return 'beach_access';
    if (type.includes('meeting')) return 'event';
    if (type.includes('payment')) return 'payment';
    if (type.includes('festival')) return 'celebration';
    if (type.includes('travel')) return 'flight_takeoff';
    return 'notifications';
  }

  getIconColor(eventType: string): string {
    const type = eventType?.toLowerCase() ?? '';
    if (type.includes('birthday')) return 'birthday';
    if (type.includes('holiday')) return 'holiday';
    if (type.includes('meeting')) return 'meeting';
    if (type.includes('payment')) return 'paymentdue';
    if (type.includes('festival')) return 'celebration';
    if (type.includes('travel')) return 'travel';
    return 'default';
  }

  isExpiringThisMonth(expiryDate: string): boolean {
    const currentDate = new Date();
    // Parse dd/MM/yyyy format
    const [day, month, year] = expiryDate.split('/').map(Number);
    const expiry = new Date(year, month - 1, day); 
    return (
      expiry.getFullYear() === currentDate.getFullYear() &&
      expiry.getMonth() === currentDate.getMonth()
    );
  }

  chartOptions: any;

  ngOnInit(): void {
    this.fetchDashboardData();
    this.fetchEventData();
  }

}
