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
import { EventData } from './event-data';
import { EventsService } from '../../service/events.service';
import { DropDownData } from '../../config-data';

@Component({
  selector: 'app-reminders',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule,
    MatSortModule, MatPaginatorModule, MatIconModule, ReactiveFormsModule,
    MatSelectModule, FormsModule, CommonModule,
    MatDatepickerModule, MatNativeDateModule, MatTooltipModule],
  templateUrl: './reminders.component.html',
  styleUrl: './reminders.component.css'
})
export class RemindersComponent implements OnInit {
  formGroup: FormGroup;
  displayedColumns: string[] = ['eventDate', 'eventType', 'eventDetail', 'recurrence', 'actionsColumn'];
  eventData: any;
  dataSource: MatTableDataSource<EventData>;
  eventTypes: DropDownData[];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  constructor(private formBuilder: FormBuilder, private eventService: EventsService) {}

  ngOnInit() {
    this.createForm();
    this.fetchEventData();
    this.eventService.fetchEventTypeDropdownData().subscribe(data => {
      this.eventTypes = data;
    });
  }

  fetchEventData() {
    this.eventService.fetchEventData().subscribe((res) => {
      this.dataSource = new MatTableDataSource(res);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      const currentMonth = new Date().getMonth() + 1;
      const parseDate = (dateStr: string) => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
      };

      this.eventData = res.filter(event => {
        const eventDate = parseDate(event.eventDate.toString());
        if (!eventDate) return false;
        const eventMonth = eventDate.getMonth() + 1;
        return eventMonth === currentMonth;
      });
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'eventDate': [null, Validators.required],
      'eventType': [null, Validators.required],
      'eventDetail': [null, Validators.required],
      'recurrence': ['none'] // none, daily, weekly, monthly, yearly
    });
  }

  clear(): void {
    this.formGroupDirective.resetForm();
  }

  onSubmit(formData: any): void {
    if (this.formGroup.valid) {
      this.eventService.saveEventData(formData);
      this.clear();
    }
  }

  deleteRow(data: any): void {
    this.eventService.deleteRow(data);
  }

  getIcon(eventType: string): string {
    switch (eventType.toLowerCase()) {
      case 'birthday': return 'cake';
      case 'meetings': return 'event';
      case 'holiday': return 'beach_access';
      case 'paymentdue': return 'payment'; 
      case 'festival': return 'celebration';
      case 'travel': return 'flight_takeoff';
      default: return 'notifications';
    }
  }
  
  getIconColor(eventType: string): string {
    switch (eventType.toLowerCase()) {
      case 'birthday': return 'birthday';
      case 'meetings': return 'meeting';
      case 'holiday': return 'holiday';
      case 'paymentdue': return 'paymentdue';
      case 'festival': return 'celebration';
      case 'travel': return 'travel';
      default: return 'default';
    }
  }
}