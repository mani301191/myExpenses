import { Component, ViewChild, inject, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormGroupDirective, FormBuilder, Validators } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DropDownData } from '../../config-data';
import { EventsService } from '../../service/events.service';

@Component({
  selector: 'app-event-add',
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatToolbarModule, MatTooltipModule, MatDatepickerModule, MatNativeDateModule, ReactiveFormsModule],
  templateUrl: './event-add.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './event-add.component.css'
})
export class EventAddComponent {
  formGroup: FormGroup;
  readonly dialogRef = inject(MatDialogRef<EventAddComponent>);
  eventTypes: DropDownData[] = [];
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  constructor(private formBuilder: FormBuilder, public eventService: EventsService) { }

  ngOnInit() {
    this.createForm();
    this.eventService.fetchEventTypeDropdownData().subscribe(data => {
      this.eventTypes = data;
    });
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'eventDate': [null, Validators.required],
      'eventType': [null, Validators.required],
      'eventDetail': [null, Validators.required],
      'recurrence': ['none'] // none, daily, weekly, monthly, yearly
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  onSubmit(formData: any): void {
    if (this.formGroup.valid) {
      this.eventService.saveEventData(formData);
      this.clear();
    }
  }

  clear(): void {
    if (this.formGroupDirective) {
      this.formGroupDirective.resetForm();
    } else {
      this.formGroup.reset();
    }
  }
}
