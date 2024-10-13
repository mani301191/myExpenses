import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar'; 

@Component({
  selector: 'app-expense-add',
  standalone: true,
  imports: [MatDatepickerModule,MatNativeDateModule,MatFormFieldModule, MatInputModule,ReactiveFormsModule,
    MatFormFieldModule,CommonModule,MatSelectModule,MatIconModule,MatToolbarModule
],
  templateUrl: './expense-add.component.html',
  styleUrl: './expense-add.component.css'
})
export class ExpenseAddComponent {
  formGroup: FormGroup;
  post: any = '';
  dynamictype: string = "number";
  readonly dialogExpense = inject(MatDialogRef<ExpenseAddComponent>);

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'date': [null, Validators.required],
      'expenseType': [null, Validators.required],
      'expenseOf': [null, Validators.required],
      'description': [null, Validators.required],
      'amount': [null, [Validators.required,Validators.pattern("^[0-9]*$")]]
    });
  }

  close():void {
    this.dialogExpense.close();
  }

  onSubmit(post) {
    if(this.formGroup.valid) {
    this.post = post;
    //API call
    this.clear();
    }
  }

  clear():void{
    this.formGroup.setValue(  {
      'date': '',
      'expenseType':'',
      'expenseOf': '',
      'description':'',
      'amount': ''
    });
  }

}
