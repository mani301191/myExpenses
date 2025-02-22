import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonService } from '../common.service';


@Component({
  selector: 'app-estimate-add',
  standalone: true,
  imports: [MatDatepickerModule,MatNativeDateModule,MatFormFieldModule, MatInputModule,ReactiveFormsModule,
    MatFormFieldModule,CommonModule,MatIconModule,MatToolbarModule,MatTableModule,FormsModule],
  templateUrl: './estimate-add.component.html',
  styleUrl: './estimate-add.component.css'
})
export class EstimateAddComponent {

  formGroup: FormGroup;
  readonly dialogExpense = inject(MatDialogRef<EstimateAddComponent>);
  _snackBar = inject(MatSnackBar);
  displayedColumns: string[] = ['date', 'description','amount', 'action'];
  dataSource : any=[];
  selectedDate: Date = new Date();

  @ViewChild(MatTable,{static:true}) table: MatTable<any>;

  constructor(private commonService: CommonService) { }

  ngOnInit() {
   this.getMonthlyTargetData();
   this.dataSource = this.table.dataSource;
  }

  getMonthlyTargetData() {
    this.commonService.fetchEstimateData(this.selectedDate).subscribe(
      (res)=>{
        this.table.dataSource=res;    
  });
  }

  openDatePicker(dp) {
    dp.open();
  }

  closeDatePicker(eventData: any, dp?: any) {
    // get month and year from eventData and close datepicker, thus not allowing user to select date
    this.selectedDate = eventData;
    dp.close();
    this.getMonthlyTargetData();
  }

  close():void {
    this.dialogExpense.close();
  }

  displayMessage( message: string) {
    this._snackBar.open(message, 'dismiss', {
      verticalPosition: 'top',
      duration: 3000
    });
  }

  addRowData(){
    let dataSource:any=[];
    dataSource= this.table.dataSource;
     dataSource.unshift({
      date:new Date(),
      description:'',
      amount:0.0
    });
    this.table.dataSource=dataSource;

    this.table.renderRows();
  }

  deleteRow(row_obj){
    if(row_obj.description != '') {
    this.commonService.deleteMonthlyTargetData(row_obj);
    }
    this.table.dataSource=this.dataSource;
    this.table.renderRows();
  }

  saveRowData(){
    this.commonService.saveEstimateData(this.table.dataSource);
  }

  openClone(){
    this.commonService.cloneEstimateData(this.selectedDate).subscribe( (res)=> this.table.dataSource=res);
  }

}
