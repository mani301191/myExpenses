import { Component, OnInit, ViewChild, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DropDownData } from '../../config-data';
import { CareerService } from '../../service/career.service';

@Component({
  selector: 'app-career-add',
  imports: [MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatToolbarModule, MatDialogModule, MatTooltipModule, ReactiveFormsModule],
  templateUrl: './career-add.component.html',
  styleUrl: './career-add.component.css',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class CareerAddComponent {
  formGroup: FormGroup;
  readonly dialogRef = inject(MatDialogRef<CareerAddComponent>);
  personNames: DropDownData[] = [];
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  constructor(private formBuilder: FormBuilder, private careerService: CareerService) { }

  ngOnInit() {
    this.createForm();
    this.careerService.fetchPersonNames().subscribe(data => this.personNames = data);
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'personName': [null, Validators.required],
      'recordType': [null, Validators.required],
      'orgName': [null, Validators.required],
      'recordId': [null, Validators.required],
      'designation': [null],
      'comments': [null],
      'startDate': [null, Validators.required],
      'endDate': [null]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  onSubmit(careerData: any) {
    if (this.formGroup.valid) {
      this.careerService.saveCareerData(careerData);
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
