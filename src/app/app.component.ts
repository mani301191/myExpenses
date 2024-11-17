import { Component } from '@angular/core';
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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AssetsComponent, CommonModule, HomeComponent, 
    FitnessComponent, InvestmentsComponent, InsurenceComponent,ExpenseSummaryTableComponent, 
    AppliancesComponent,HttpClientModule],
  
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'myExpenses';
  tabIndex = 0;

  onNavClick(input: number): void {
    this.tabIndex = input;
  }
}
