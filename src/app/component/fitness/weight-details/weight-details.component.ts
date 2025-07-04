import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FitnessService } from '../../../service/fitness.service';
import { NgxPrintDirective } from '../../../directive/ngx-print.directive';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FitnessDetailComponent } from '../fitness-detail/fitness-detail.component';


@Component({
  selector: 'app-weight-details',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatIconModule, MatFormFieldModule, 
    MatInputModule, NgxPrintDirective,MatTooltipModule,FormsModule,CommonModule,FitnessDetailComponent],
  templateUrl: './weight-details.component.html',
  styleUrl: './weight-details.component.css'
})
export class WeightDetailsComponent {

  displayedColumns: string[] = ['date','height', 'weight','actionsColumn'];
  readonly dialogExpense = inject(MatDialogRef<WeightDetailsComponent>);
  dataSource: MatTableDataSource<any>;
  personName: string;
  personPic: string;
  data: any[] = []; 
 
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private fitnessService: FitnessService,private cdref: ChangeDetectorRef ) { }
  
  ngOnInit(): void {
    this.data = [];
    this.fitnessService.fetchPersonWeight(this.personName).subscribe((res)=>{
      this.data = res;
      this.dataSource = new MatTableDataSource(res);
      this.dataSource.paginator = this.paginator;
      this.cdref.detectChanges();
  });

  }

  close():void {
    this.dialogExpense.close();
  }

  deleteRow(data) {
    this.fitnessService.deletePersonWeightData(data);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  enableEdit(element: any): void {
    // Set isEditing to true for the selected row
    element.isEditing = true;
  }

  updateRecord(element: any): void {
    element.isEditing = false;
    this.fitnessService.updateWeightDetail(element);
  }
}
