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
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  baseUrl = 'http://localhost:8003/api/expenseTracker';
  readonly dialogExpense = inject(MatDialogRef<ExpenseAddComponent>);
  _snackBar = inject(MatSnackBar);

  constructor(private formBuilder: FormBuilder,private http: HttpClient) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'expenseDate': [null, Validators.required],
      'expenseType': [null, Validators.required],
      'expenseOf': [null, Validators.required],
      'description': [null, Validators.required],
      'amount': [null, [Validators.required,Validators.pattern("^[0-9].*$")]]
    });
  }

  close():void {
    this.dialogExpense.close();
  }
 
  onSubmit(expenseData) {
    if(this.formGroup.valid) {
      expenseData.expenseDate = this.getFormattedDate(expenseData.expenseDate);
      this.http.post<any>(this.baseUrl+'/expenseDetail',expenseData).subscribe(
        (res) => {
          this.displayMessage('Record added sucessfully - ID :'+res.expenseId ); 
          this.clear();
           },
        () => {
          this.displayMessage('Error Occured, Contact System Admin' ); 
         
        }
    );
    }
  }

  displayMessage(message:string ) {
    this._snackBar.open(message , 'dismiss', {
      verticalPosition: 'top',
      duration: 3000
    });
  }

  getFormattedDate(date) {
    let day = ('0' + date.getDate()).slice(-2);
    let month = date.getMonth() + 1;
    return day + '/' + month + '/' +  date.getFullYear();
}

  clear():void{
    this.formGroup.setValue(  {
      'expenseDate': '',
      'expenseType':'',
      'expenseOf': '',
      'description':'',
      'amount': ''
    });
  }

}
