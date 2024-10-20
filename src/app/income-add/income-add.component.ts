import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';

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
  post: any = '';
  dynamictype: string = "number";
  readonly dialogExpense = inject(MatDialogRef<IncomeAddComponent>);

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'date': [null, Validators.required],
      'source': [null, Validators.required],
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
      'source':'',
      'amount': ''
    });
  }

}
