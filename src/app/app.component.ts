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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AssetsComponent, CommonModule, HomeComponent, 
    FitnessComponent, InvestmentsComponent, InsurenceComponent,ExpenseSummaryTableComponent, 
    AppliancesComponent,HttpClientModule,MatIconModule,FormsModule],
  
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'myExpenses';
  tabIndex = 0;
  url: any ;
  readonly dialog = inject(MatDialog);
  profileData: ProfileData;

  constructor(private commonService: CommonService ) { }
  ngOnInit() {
  this.commonService.profileData().subscribe((res)=> this.profileData=res);
  }
  onNavClick(input: number): void {
    this.tabIndex = input;
  }
  
  openDialogProfileSetting() {
    this.dialog.open(ProfileSettingComponent).afterClosed().subscribe(()=>
       this.commonService.profileData().subscribe((res)=> this.profileData=res));
  }
  
}
