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
import { InsuranceService } from '../../service/insurance.service';

@Component({
  selector: 'app-insurance-add',
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatToolbarModule, MatTooltipModule, MatDatepickerModule, MatNativeDateModule, ReactiveFormsModule],
  templateUrl: './insurance-add.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './insurance-add.component.css'
})
export class InsuranceAddComponent {
  formGroup: FormGroup;
  readonly dialogRef = inject(MatDialogRef<InsuranceAddComponent>);
  insuranceTypes: DropDownData[] = [];
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  constructor(private formBuilder: FormBuilder, private insuranceService: InsuranceService) { }

  ngOnInit() {
    this.createForm();
    this.insuranceService.fetchInsuranceTypeDropdownData().subscribe(data => {
      this.insuranceTypes = data;
    });
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      insuranceType: ['', Validators.required],
      insuranceProvider: ['', Validators.required],
      policyNumber: ['', [Validators.required]],
      nominee: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      additionalDetails: [null]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  onSubmit(formData: any): void {
    if (this.formGroup.valid) {
      this.insuranceService.saveInsuranceData(formData);
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
