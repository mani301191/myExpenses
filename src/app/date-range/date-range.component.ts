import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import {FormGroup, FormControl, ReactiveFormsModule} from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-date-range',
  standalone: true,
  imports: [MatFormFieldModule,CommonModule,MatDatepickerModule,MatNativeDateModule,ReactiveFormsModule],
  templateUrl: './date-range.component.html',
  styleUrl: './date-range.component.css'
})
export class DateRangeComponent {
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  @Output() dateRange = new EventEmitter<FormGroup>();

  dateRangeClick(){
    this.dateRange.emit(this.range);
  }
}
