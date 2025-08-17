import { Component, inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatIconModule, FormsModule,
     MatTooltipModule,RouterModule],

  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'myExpenses';
  tabIndex = -1;
  url: any;
  readonly dialog = inject(MatDialog);
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
      this.notificationResponse = [];
      const currentMonth = new Date().getMonth();

      const parseDate = (dateStr: string) => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
      };

      res.forEach((event) => {
        const eventDate = parseDate(event.eventDate?.toString());
        const today = new Date();
        today.setHours(0, 0, 0, 0); // reset to midnight
        eventDate.setHours(0, 0, 0, 0);
        if (eventDate.getMonth() === currentMonth && eventDate >= today) {
          this.notificationResponse.push(event);
        }
      });
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
  
  openDialogProfileSetting() {
    this.dialog.open(ProfileSettingComponent).afterClosed().subscribe(() =>
      this.commonService.profileData().subscribe((res) => this.profileData = res));
  }

}
