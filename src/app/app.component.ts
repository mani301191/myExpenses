import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AssetsComponent } from './assets/assets.component';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { FitnessComponent } from './fitness/fitness.component';
import { InvestmentsComponent } from './investments/investments.component';
import { InsurenceComponent } from './insurence/insurence.component';
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
    FitnessComponent, InvestmentsComponent, InsurenceComponent, ExpenseSummaryTableComponent,
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

  constructor(private commonService: CommonService, private notificationSvc: NotificationService) { }
  ngOnInit() {
    this.notificationSvc.fetchReminderData().subscribe((res) => this.messageCount = res.length);
    this.commonService.profileData().subscribe((res) => this.profileData = res);
  }
  onNavClick(input: number): void {
    this.tabIndex = input;
    this.messageCount = 0; //temp
  }

  onReminderClick(): void {
    this.messageCount = 1;
  }

  openDialogProfileSetting() {
    this.dialog.open(ProfileSettingComponent).afterClosed().subscribe(() =>
      this.commonService.profileData().subscribe((res) => this.profileData = res));
  }

}
