import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AddPersonFitnessComponent } from '../add-person-fitness/add-person-fitness.component';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

const patient = [{value:'Manikandan Narasimhan'},{value:'Radha'}];

@Component({
  selector: 'app-add-medical-details',
  standalone: true,
  imports: [ MatFormFieldModule, MatToolbarModule, ReactiveFormsModule,
    MatInputModule, CommonModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './add-medical-details.component.html',
  styleUrl: './add-medical-details.component.css'
})
export class AddMedicalDetailsComponent {

  formGroup: FormGroup;
  readonly dialogPerson = inject(MatDialogRef<AddPersonFitnessComponent>);
  patient:any;
  
  constructor(private formBuilder: FormBuilder) { }
  
  ngOnInit() {
    this.createForm();
    this.patient=patient;
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'date': [null, Validators.required],
      'patientName': [null, Validators.required],
      'problem': [null, Validators.required],
      'hospital': [null, Validators.required],
      'docterName': [null, Validators.required],
      'diagnosis': [null, Validators.required],
      'otherDetails': [null, Validators.required]
    });
  }

  close(): void {
    this.dialogPerson.close();
  }

  onSubmit(otherDetails) {
    console.log(otherDetails);
    if(this.formGroup.valid) {
    // servicecall
  }
 this.clear();
}

clear():void{
  this.formGroup.setValue(  {
    'date': '',
    'patientName': '',
    'problem': '',
    'hospital': '',
    'docterName': '',
    'diagnosis': '',
    'otherDetails':''
  });
}
}
