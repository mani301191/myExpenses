import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormGroupDirective, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EventData } from './event-data';
import { EventsService } from '../../service/events.service';
import { DropDownData } from '../../config-data';

@Component({
    selector: 'app-reminders',
    imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule,
        MatSortModule, MatPaginatorModule, MatIconModule, ReactiveFormsModule,
        MatSelectModule, FormsModule, CommonModule,
        MatDatepickerModule, MatNativeDateModule, MatTooltipModule, MatProgressSpinnerModule],
    templateUrl: './reminders.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './reminders.component.css'
})
export class RemindersComponent implements OnInit {
  formGroup: FormGroup;
  displayedColumns: string[] = ['eventDate', 'eventType', 'eventDetail', 'recurrence', 'actionsColumn'];
  eventData: any;
  dataSource: MatTableDataSource<EventData>;
  eventTypes: DropDownData[];
  selectedFile: File = null;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  constructor(private formBuilder: FormBuilder, public eventService: EventsService) {}

  ngOnInit() {
    this.createForm();
    this.fetchEventData();
    this.eventService.fetchEventTypeDropdownData().subscribe(data => {
      this.eventTypes = data;
    });
  }

  fetchEventData() {
    this.eventService.fetchEventData().subscribe((res) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      const nextMonthStart = new Date(currentYear, currentMonth + 1, 1);
      const monthAfterNextStart = new Date(currentYear, currentMonth + 2, 1);

      const upcoming = res
        .map((event) => ({ event, effective: this.effectiveDate(event, today, currentYear) }))
        .filter((row) => row.effective && row.effective >= today)
        .sort((a, b) => a.effective.getTime() - b.effective.getTime())
        .map((row) => row.event);

      this.dataSource = new MatTableDataSource(upcoming);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      this.eventData = res
        .map((event) => ({ event, effective: this.effectiveDate(event, today, currentYear) }))
        .filter((row) => {
          if (!row.effective || row.effective < today) return false;
          if (row.effective < nextMonthStart) return true;
          if (row.effective < monthAfterNextStart) {
            const type = (row.event.eventType || '').toLowerCase();
            return type.includes('birthday') || type.includes('holiday');
          }
          return false;
        })
        .sort((a, b) => a.effective.getTime() - b.effective.getTime())
        .map((row) => row.event);
    });
  }

  private parseDate(dateStr: string): Date {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('/').map(Number);
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day);
  }

  private effectiveDate(event: EventData, today: Date, currentYear: number): Date {
    const original = this.parseDate(event.eventDate?.toString());
    if (!original) return null;
    if ((event.recurrence || '').toLowerCase() === 'yearly') {
      const occurrence = new Date(currentYear, original.getMonth(), original.getDate());
      return occurrence < today
        ? new Date(currentYear + 1, original.getMonth(), original.getDate())
        : occurrence;
    }
    return original;
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

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files && event.target.files.length ? event.target.files[0] : null;
  }

  uploadEvents(fileInput?: HTMLInputElement): void {
    if (!this.selectedFile) {
      this.eventService.uploadEventFile(null);
      return;
    }
    this.eventService.uploadEventFile(this.selectedFile);
    if (fileInput) {
      fileInput.value = '';
    }
    this.selectedFile = null;
  }

  deleteRow(data: any): void {
    this.eventService.deleteRow(data);
  }

  getIcon(eventType: string): string {
    const type = eventType?.toLowerCase() ?? '';
    if (type.includes('birthday')) return 'cake';
    if (type.includes('holiday')) return 'beach_access';
    if (type.includes('meeting')) return 'event';
    if (type.includes('payment')) return 'payment';
    if (type.includes('festival')) return 'celebration';
    if (type.includes('travel')) return 'flight_takeoff';
    return 'notifications';
  }
  
  getIconColor(eventType: string): string {
    const type = eventType?.toLowerCase() ?? '';
    if (type.includes('birthday')) return 'birthday';
    if (type.includes('holiday')) return 'holiday';
    if (type.includes('meeting')) return 'meeting';
    if (type.includes('payment')) return 'paymentdue';
    if (type.includes('festival')) return 'celebration';
    if (type.includes('travel')) return 'travel';
    return 'default';
  }
}