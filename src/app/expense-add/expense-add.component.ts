import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar'; 
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonService } from '../common.service';
import { Dropdown } from '../estimate-add/estimate-month';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-expense-add',
  standalone: true,
  imports: [MatDatepickerModule,MatNativeDateModule,MatFormFieldModule, MatInputModule,ReactiveFormsModule,
    CommonModule,MatSelectModule,MatIconModule,MatToolbarModule,FormsModule,MatTooltipModule
],
  templateUrl: './expense-add.component.html',
  styleUrl: './expense-add.component.css'
})
export class ExpenseAddComponent {
  formGroup: FormGroup;
  readonly dialogExpense = inject(MatDialogRef<ExpenseAddComponent>);
  _snackBar = inject(MatSnackBar);
   items:Dropdown[];
   selectedDate: Date = new Date();
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;


  constructor(private formBuilder: FormBuilder,public dialog: MatDialog,
    private commonService:CommonService
  ) { }

  ngOnInit() {
    this.createForm();
    this.commonService.plannedExpense(this.selectedDate).subscribe(r=> this.items=r);
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'expenseDate': [null, Validators.required],
      'expenseType': [null, Validators.required],
      'expenseOf': [null, Validators.required],
      'description': [null],
      'amount': [null, [Validators.required,Validators.pattern("^[0-9].*$")]]
    });
  }

  close():void {
    this.dialogExpense.close();
  }
 
  onSubmit(expenseData) {
    if(this.formGroup.valid) {
      expenseData.expenseDate = this.commonService.getFormattedDate(expenseData.expenseDate);
      this.commonService.addExpenseDetail(expenseData).subscribe(() => this.clear());
    }
  }


  onDateChange(eventData: any) {
    this.commonService.plannedExpense(eventData.value).subscribe(r=> this.items=r);
  }

  clear():void{
    this.formGroupDirective.resetForm(); 
  }

}
