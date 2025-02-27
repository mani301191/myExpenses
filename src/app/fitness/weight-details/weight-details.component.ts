import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FitnessService } from '../../fitness.service';
import { NgxPrintDirective } from '../../ngx-print.directive';
import { MatTooltipModule } from '@angular/material/tooltip';

const res =[{date:'11/01/2025',height:180,weight:95},
  {date:'08/01/2025',height:150,weight:62}]

@Component({
  selector: 'app-weight-details',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatIconModule, MatFormFieldModule, MatInputModule, NgxPrintDirective,MatTooltipModule],
  templateUrl: './weight-details.component.html',
  styleUrl: './weight-details.component.css'
})
export class WeightDetailsComponent {

  displayedColumns: string[] = ['date','height', 'weight','actionsColumn'];
  readonly dialogExpense = inject(MatDialogRef<WeightDetailsComponent>);
  dataSource: MatTableDataSource<any>;
  personName: string;
  personPic: string;
 
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private fitnessService: FitnessService,private cdref: ChangeDetectorRef ) { }
  
  ngOnInit(): void {
    this.fitnessService.fetchPersonWeight(this.personName).subscribe((res)=>{
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
}
