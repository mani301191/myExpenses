import { CommonModule } from '@angular/common';
import { Component, Inject, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AddPersonFitnessComponent } from '../add-person-fitness/add-person-fitness.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FitnessService } from '../../../service/fitness.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-add-medical-details',
  standalone: true,
  imports: [MatFormFieldModule, MatToolbarModule, ReactiveFormsModule,
    MatInputModule, CommonModule, MatSelectModule, MatDatepickerModule, 
    MatNativeDateModule, MatTooltipModule,MatIcon],
  templateUrl: './add-medical-details.component.html',
  styleUrl: './add-medical-details.component.css'
})
export class AddMedicalDetailsComponent {

  formGroup: FormGroup;
  readonly dialogPerson = inject(MatDialogRef<AddPersonFitnessComponent>);
  patient: any;
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  constructor(private formBuilder: FormBuilder, private fitnessService: FitnessService, @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.createForm();
    this.fitnessService.fetchPersonNames().subscribe((res) => this.patient = res);
  }

  createForm() {
    const patientName = this.data?.patientName || null;
    const date = this.data?.date || null;

  this.formGroup = this.formBuilder.group({
    date: [date, Validators.required],
    patientName: [patientName, Validators.required],
    problem: [null, Validators.required],
    hospital: [null, Validators.required],
    docterName: [null, Validators.required],
    diagnosis: [null, Validators.required],
    otherDetails: [null, Validators.required]
  });
  }

  close(): void {
    this.dialogPerson.close();
  }

  onSubmit(fields) {
    if (this.formGroup.valid) {
      this.fitnessService.saveMedicalDetails(fields).subscribe(() => this.clear());
    }
  }

  clear(): void {
    this.formGroupDirective.resetForm();
  }
}
