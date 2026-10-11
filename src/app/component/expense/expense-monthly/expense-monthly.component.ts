import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MonthlyIncomeComponent } from '../../monthly-income/monthly-income.component';
import { ExpenseMonthlyTableComponent } from '../expense-monthly-table/expense-monthly-table.component';


@Component({
    selector: 'app-expense-monthly',
    imports: [MonthlyIncomeComponent, ExpenseMonthlyTableComponent],
    templateUrl: './expense-monthly.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './expense-monthly.component.css'
})
export class ExpenseMonthlyComponent {

}
