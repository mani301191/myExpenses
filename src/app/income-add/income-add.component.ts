import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonService } from '../common.service';

@Component({
  selector: 'app-income-add',
  standalone: true,
  imports: [MatDatepickerModule,MatNativeDateModule,MatFormFieldModule, MatInputModule,ReactiveFormsModule,
    MatFormFieldModule,CommonModule,MatIconModule,MatToolbarModule],
  templateUrl: './income-add.component.html',
  styleUrl: './income-add.component.css'
})
export class IncomeAddComponent {

  formGroup: FormGroup;
  readonly dialogExpense = inject(MatDialogRef<IncomeAddComponent>);
  _snackBar = inject(MatSnackBar);

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
    this.formGroup.setValue(  {
      'incomeDate': '',
      'source':'',
      'amount': ''
    });
  }

}
