import { RouterModule, Routes } from '@angular/router';
import { AppliancesComponent } from './component/appliances/appliances.component';
import { AssetsComponent } from './component/assets/assets.component';
import { CareerComponent } from './component/career/career.component';
import { ConfigComponent } from './component/config/config.component';
import { FitnessComponent } from './component/fitness/fitness.component';
import { InsuranceComponent } from './component/insurance/insurance.component';
import { InvestmentsComponent } from './component/investments/investments.component';
import { RemindersComponent } from './component/reminders/reminders.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgModule } from '@angular/core';
import { HomeComponent } from './component/home/home.component';

export const routes: Routes = [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'expense', component: HomeComponent },
    { path: 'fitness', component: FitnessComponent },
    { path: 'asset', component: AssetsComponent },
    { path: 'investment', component: InvestmentsComponent },
    { path: 'insurance', component: InsuranceComponent },
    { path: 'appliance', component: AppliancesComponent },
    { path: 'career', component: CareerComponent },
    { path: 'reminders', component: RemindersComponent },
    { path: 'config', component: ConfigComponent },
    // Add a wildcard route for 404
    { path: '**', redirectTo: 'dashboard' }
];
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }