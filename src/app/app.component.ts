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
  notificationResponse: any[] = [];

  constructor(private commonService: CommonService, private eventsService: EventsService) { }
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
          this.notificationResponse.push(event.eventType + ' - ' + event.eventDate + ' - ' + event.eventDetail);
        }
      });
      if (this.notificationResponse.length === 0) {
        this.notificationResponse.push('No events for this month');
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
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '1000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    const messageBox = document.createElement('div');
    messageBox.style.backgroundColor = 'white';
    messageBox.style.padding = '20px';
    messageBox.style.borderRadius = '5px';
    messageBox.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    messageBox.style.maxHeight = '80%';
    messageBox.style.overflowY = 'auto';

    const header = document.createElement('h2');
    header.textContent = 'Alerts';
    header.style.fontSize = '15px';
    header.style.backgroundColor = '#075068f8';
    header.style.color = 'white';
    header.style.padding = '10px';
    header.style.textAlign = 'center';
    header.style.borderRadius = '5px 5px 0 0';
    header.style.border = '2px solid #075068f8';

    messageBox.appendChild(header);

    this.notificationResponse.forEach((notification) => {
      const message = document.createElement('p');
      message.textContent = notification;
      message.style.border = '2px solid #075068f8';
      message.style.borderTop = 'none';
      message.style.borderLeft = 'none';
      message.style.borderRight = 'none';
      messageBox.appendChild(message);
    });

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.marginTop = '10px';
    closeButton.onclick = () => {
      document.body.removeChild(overlay);
      this.messageCount = 0;
    };
    messageBox.appendChild(closeButton);
    overlay.appendChild(messageBox);
    document.body.appendChild(overlay);

    const closeOnKeyPress = (event: KeyboardEvent) => {
      document.body.removeChild(overlay);
      document.removeEventListener('keydown', closeOnKeyPress); // Remove the keydown listener
      this.messageCount = 0;
    };

    document.addEventListener('keydown', closeOnKeyPress);
  }

  openDialogProfileSetting() {
    this.dialog.open(ProfileSettingComponent).afterClosed().subscribe(() =>
      this.commonService.profileData().subscribe((res) => this.profileData = res));
  }

}
