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
import { AppliancesService } from '../../service/appliances.service';

@Component({
  selector: 'app-appliances-add',
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatToolbarModule, MatTooltipModule, MatDatepickerModule, MatNativeDateModule, ReactiveFormsModule],
  templateUrl: './appliances-add.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './appliances-add.component.css'
})
export class AppliancesAddComponent {
  formGroup: FormGroup;
  readonly dialogRef = inject(MatDialogRef<AppliancesAddComponent>);
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  constructor(private formBuilder: FormBuilder, private appliancesService: AppliancesService) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'applianceName': [null, Validators.required],
      'amc': [null, Validators.required],
      'amcEndDate': [null],
      'lastServicedDate': [null],
      'additionalDetails': [null]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  onSubmit(formData: any): void {
    if (this.formGroup.valid) {
      this.appliancesService.saveAppliancesData(formData);
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
