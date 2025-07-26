import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FitnessService } from '../../../service/fitness.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-add-weight-details',
  standalone: true,
  imports: [MatFormFieldModule, MatToolbarModule, ReactiveFormsModule,
    MatInputModule, CommonModule, MatSelectModule, MatDatepickerModule, 
    MatNativeDateModule,MatTooltipModule,MatIcon],
  templateUrl: './add-weight-details.component.html',
  styleUrl: './add-weight-details.component.css'
})
export class AddWeightDetailsComponent {
  formGroup: FormGroup;
  readonly dialogPerson = inject(MatDialogRef<AddWeightDetailsComponent>);
  person: any;
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  constructor(private formBuilder: FormBuilder, private fitnessService: FitnessService) { }

  ngOnInit() {
    this.createForm();
    this.fitnessService.fetchPersonNames().subscribe((res) => this.person = res);
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'date': [null, Validators.required],
      'personName': [null, Validators.required],
      'height': [null,[Validators.required,Validators.pattern("^[0-9].*$")]],
      'weight': [null,[Validators.required,Validators.pattern("^[0-9].*$")]]
    });
  }

  close(): void {
    this.dialogPerson.close();
  }

  onSubmit(fields) {
    if (this.formGroup.valid) {
      this.fitnessService.savePersonWeight(fields).subscribe(() => { 
        this.formGroup.get('weight').reset();
       }
      );
    }
  }

  clear(): void {
    this.formGroupDirective.resetForm();
  }
}
