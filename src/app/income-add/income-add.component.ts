import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
  baseUrl = 'http://localhost:8003/api/expenseTracker';
  readonly dialogExpense = inject(MatDialogRef<IncomeAddComponent>);
  _snackBar = inject(MatSnackBar);

  constructor(private formBuilder: FormBuilder,private http: HttpClient) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'incomeDate': [null, Validators.required],
      'source': [null, Validators.required],
      'amount': [null, [Validators.required,Validators.pattern("^[0-9]*$")]]
    });
  }

  close():void {
    this.dialogExpense.close();
  }

  onSubmit(inputData) {
    if(this.formGroup.valid) {
    inputData.incomeDate = this.getFormattedDate(inputData.incomeDate);
    this.http.post<any>(this.baseUrl+'/incomeDetail',inputData).subscribe(
      (res) =>{
        this. displayMessage('Record created Successfully, Id : '+res.incomeId);
        this.clear();
      },
       () => {
       this. displayMessage('Error Occured, Contact System Admin');
  });
    }
  }

  displayMessage( message: string) {
    this._snackBar.open(message, 'dismiss', {
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
      'incomeDate': '',
      'source':'',
      'amount': ''
    });
  }

}
