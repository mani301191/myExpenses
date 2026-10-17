import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { ProfileSettingComponent } from './component/profile-setting/profile-setting.component';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from './service/common.service';
import { ProfileData } from './component/profile-setting/profile-data';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EventsService } from './service/events.service';
import { Router } from '@angular/router';
import { AlertsDialogComponent } from './component/alerts-dialog/alerts-dialog.component';
import { EventData } from './component/reminders/event-data';
import { ThemeService } from './service/theme.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, MatIconModule, MatMenuModule, FormsModule,
        MatTooltipModule, RouterModule],
    templateUrl: './app.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'myExpenses';
  tabIndex = -1;
  url: any;
  readonly dialog = inject(MatDialog);
  readonly themeService = inject(ThemeService);
  profileData: ProfileData;
  messageCount: number = 0;
  notificationResponse: EventData[] = [];

  constructor(private commonService: CommonService, private eventsService: EventsService,
    private router: Router) { }


  onExpenseOptionChange(view: string) {
    this.router.navigate(['/expense'], { queryParams: { view } });
  }

  ngOnInit() {
    this.eventsService.fetchEventData().subscribe((res) => {
      this.notificationResponse = this.buildNotifications(res);
      if (this.notificationResponse.length === 0) {
        this.notificationResponse.push({
          "eventId": "0", "eventDate": new Date(),"eventType": '', "eventDetail": '',
          "recurrence": ''} as EventData);
        this.messageCount = 0;
      } else {
        this.messageCount = this.notificationResponse.length;
      }
    });
    this.commonService.profileData().subscribe((res) => this.profileData = res);
  }

  private buildNotifications(events: EventData[]): EventData[] {
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

  private effectiveDate(event: EventData, today: Date, currentYear: number): Date {
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
  onNavClick(input: number): void {
    this.tabIndex = input;
  }


  onReminderClick(): void {
    this.dialog.open(AlertsDialogComponent, {
      data: { notifications: this.notificationResponse }
    }).afterClosed().subscribe(() => {
      this.messageCount = 0;
    });
  }
  
  setTheme(key: string): void {
    this.themeService.setTheme(key);
  }

  openDialogProfileSetting() {
    this.dialog.open(ProfileSettingComponent).afterClosed().subscribe(() =>
      this.commonService.profileData().subscribe((res) => this.profileData = res));
  }

}
