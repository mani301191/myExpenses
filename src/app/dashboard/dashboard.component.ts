import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { SummaryService } from '../service/summary.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatIconModule,CommonModule,CanvasJSAngularChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  expenseTrackingData: any = {};
  fitnessData: any[] = [];
  insuranceData: any[] = [];
 constructor( private summaryService: SummaryService) {
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
  }

}
