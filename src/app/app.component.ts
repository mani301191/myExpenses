import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AssetsComponent } from './assets/assets.component';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { FitnessComponent } from './fitness/fitness.component';
import { InvestmentsComponent } from './investments/investments.component';
import { InsuranceComponent } from './insurance/insurance.component';
import { AppliancesComponent } from './appliances/appliances.component';
import { ExpenseSummaryTableComponent } from './expense-summary-table/expense-summary-table.component';
import { HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ProfileSettingComponent } from './profile-setting/profile-setting.component';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from './common.service';
import { ProfileData } from './profile-setting/profile-data';
import { ConfigComponent } from './config/config.component';
import { RemindersComponent } from './reminders/reminders.component';
import { CareerComponent } from './career/career.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AssetsComponent, CommonModule, HomeComponent,
    FitnessComponent, InvestmentsComponent, InsuranceComponent, ExpenseSummaryTableComponent,
    AppliancesComponent, HttpClientModule, MatIconModule, FormsModule, ConfigComponent,
    RemindersComponent, CareerComponent, MatTooltipModule],

  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'myExpenses';
  tabIndex = 0;
  url: any;
  readonly dialog = inject(MatDialog);
  profileData: ProfileData;
  messageCount: number = 0;
  notificationResponse:any[] = [];

  constructor(private commonService: CommonService, private notificationSvc: NotificationService) { }
  ngOnInit() {
    this.notificationSvc.fetchReminderData().subscribe((res) => {
      const currentMonth = new Date().getMonth();
      res.forEach((event) => {
        const eventDate = new Date(event.eventDate);
        if (eventDate.getMonth() === currentMonth) {
          this.notificationResponse.push(event.eventType + ' - ' + event.eventDate + ' - ' + event.eventDetail);
        }
      });
      this.messageCount = this.notificationResponse.length;
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
  }

  openDialogProfileSetting() {
    this.dialog.open(ProfileSettingComponent).afterClosed().subscribe(() =>
      this.commonService.profileData().subscribe((res) => this.profileData = res));
  }

}
