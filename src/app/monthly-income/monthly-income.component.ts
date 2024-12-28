import { Component} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MonthlyIncome } from './monthly-income';
import { CommonModule } from '@angular/common';
import { ExpenseMonthly } from '../expense-monthly-table/expense-monthly-table';
import { CommonService } from '../common.service';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { ExpenseStatus } from '../estimate-add/estimate-month';
import { MatIcon } from '@angular/material/icon';
import {MatExpansionModule} from '@angular/material/expansion';

@Component({
  selector: 'app-monthly-income',
  standalone: true,
  imports: [MatCardModule, MatChipsModule, CommonModule, MatProgressBarModule,MatIcon,MatExpansionModule],
  templateUrl: './monthly-income.component.html',
  styleUrl: './monthly-income.component.css'
})
export class MonthlyIncomeComponent {
  selectedDate: Date =new Date();
  incomeData: MonthlyIncome[];
  expenseData: ExpenseMonthly[];
  expenseStatus :ExpenseStatus[];
  totalIncome: number=0;
  totalExpense: number=0;
  plannedExpense: number=0;
  unPlannedExpense: number=0;
  investmentExpense: number=0;
  estimate:number=0;
  savings: number=0;
  progress: number = 0;

  constructor( private commonService: CommonService) { }

  ngOnInit() {
    this.estimateData();
    this.initIncomeData();
    this.topExpenseData();
    this.plannedExpenseStatus();

  }

  initIncomeData() {
    this.commonService.fetchIncomeData(this.selectedDate).subscribe(
        (res) => { 
          this.incomeData=res;
          this.totalIncome = this.incomeData.map(data => data.amount).reduce((a, b) => a+b,0); 
          this.savings = this.totalIncome - this.totalExpense; 
          this.setMessage();
         });
  }

  topExpenseData() {
    this.commonService.fetchExpenseData(this.selectedDate).subscribe(
      (res) => { this.expenseData = res.sort((a,b) => b.amount-a.amount).slice(0,5); 
        this.totalExpense = res.map(data => data.amount).reduce((a, b) => a + b ,0);
        this.plannedExpense = res.filter(r=>r.expenseType=='Planned').map(data => data.amount).reduce((a, b) => a + b ,0);
        this.unPlannedExpense = res.filter(r=>r.expenseType=='UnPlanned').map(data => data.amount).reduce((a, b) => a + b ,0);
        this.investmentExpense = res.filter(r=>r.expenseType=='Investment').map(data => data.amount).reduce((a, b) => a + b ,0);
        this.savings = this.totalIncome - this.totalExpense;
        this.setMessage();
      }
    );
  }
  estimateData() {
    this.commonService.fetchEstimateData(this.selectedDate).subscribe(
      (res) => {
        if(res && res.length >0) {
        this.estimate=res.reduce( (acc,e ) => acc + e.amount , 0);
        }else{
        this.estimate=0;
        }
        this.setMessage();
      }
    );
  }

  plannedExpenseStatus() {
    this.commonService.plannedExpenseStatus(this.selectedDate).subscribe(
      (res) => { 
        this.expenseStatus=res;
       });
  }

  deleteRow(data) {
    this.commonService.deleteIncomeRecord(data);
  }

  setMessage() {
    let  percent = 0;
    if(this.totalExpense >0 && this.estimate  > 0) {
      percent= this.totalExpense/this.estimate * 100;
    }
    this.progress= percent;
  }

  updateColor(progress) {
    if (progress<80){
      return 'primary';
   } else if (progress>100){
      return 'accent';
   } else {
     return 'warn';
   }
 }
}
