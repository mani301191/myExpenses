import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormGroupDirective } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonService } from '../../service/common.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-income-add',
  standalone: true,
  imports: [MatDatepickerModule,MatNativeDateModule,MatFormFieldModule, MatInputModule,ReactiveFormsModule,
    MatFormFieldModule,CommonModule,MatIconModule,MatToolbarModule,MatTooltipModule],
  templateUrl: './income-add.component.html',
  styleUrl: './income-add.component.css'
})
export class IncomeAddComponent {

  formGroup: FormGroup;
  readonly dialogExpense = inject(MatDialogRef<IncomeAddComponent>);
  _snackBar = inject(MatSnackBar);
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  constructor(private formBuilder: FormBuilder,private commonService: CommonService) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'incomeDate': [null, Validators.required],
      'source': [null, Validators.required],
      'amount': [null, [Validators.required,Validators.pattern("^[0-9].*$")]]
    });
  }

  close():void {
    this.dialogExpense.close();
  }

  onSubmit(inputData) {
    if (this.formGroup.valid) {
      inputData.incomeDate = this.commonService.getFormattedDate(inputData.incomeDate);
      this.commonService.addIncomeDetail(inputData).subscribe(() => this.clear());
    }
  }

  clear():void{
    this.formGroupDirective.resetForm(); 
  }

}
