import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-reminders',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule,
          MatSortModule, MatPaginatorModule, MatIconModule, ReactiveFormsModule,
          MatSelectModule, FormsModule, CommonModule, 
          MatDatepickerModule, MatNativeDateModule,MatTooltipModule],
  templateUrl: './reminders.component.html',
  styleUrl: './reminders.component.css'
})
export class RemindersComponent  implements OnInit {
  formGroup: FormGroup;
  displayedColumns: string[] = ['eventDate', 'eventType', 'eventDetail', 'actionsColumn'];
  status:String;
  eventData: any;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  constructor(private formBuilder: FormBuilder) {
  }
  dataSource = new MatTableDataSource([
      { eventDate: '03/01/2020', eventType: 'Birthday', eventDetail: 'John' },
      { eventDate: '06/15/2021', eventType: 'Anniversary', eventDetail: 'Jane Doe' },
      { eventDate: '12/25/2020', eventType: 'Holiday', eventDetail: 'Christmas' },
      { eventDate: '07/04/2021', eventType: 'Holiday', eventDetail: 'Independence Day' },
      { eventDate: '11/26/2020', eventType: 'Meeting', eventDetail: 'Project Kickoff' },
      { eventDate: '02/14/2025', eventType: 'Holiday', eventDetail: 'Valentine\'s Day' },
      { eventDate: '02/10/2025', eventType: 'Conference', eventDetail: 'Tech Summit' },
      { eventDate: '04/22/2021', eventType: 'Holiday', eventDetail: 'Earth Day' },
      { eventDate: '05/01/2021', eventType: 'Workshop', eventDetail: 'Angular Training' },
      { eventDate: '08/15/2021', eventType: 'Holiday', eventDetail: 'Independence Day' }
  ]);

  ngOnInit() {
    this.createForm();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    const currentMonth = new Date().getMonth() + 1; 
    this.eventData = this.dataSource.data.filter(event => {
      const eventMonth = new Date(event.eventDate).getMonth() + 1;
      return eventMonth === currentMonth;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'eventDate': [null, Validators.required],
      'eventType': [null, Validators.required],
      'eventDetail': [null, Validators.required]
    });
  }

  clear(): void {
    this.formGroupDirective.resetForm();
  }

  onSubmit(formData: any): void {
    if (this.formGroup.valid) {
      console.log(formData);
      this.clear();
    }
  }

  deleteRow(data: any): void {
    console.log(data);
  }
}
