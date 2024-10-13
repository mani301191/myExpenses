import { Component } from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';

@Component({
  selector: 'app-monthly-income',
  standalone: true,
  imports: [MatCardModule,MatChipsModule],
  templateUrl: './monthly-income.component.html',
  styleUrl: './monthly-income.component.css'
})
export class MonthlyIncomeComponent {

}
