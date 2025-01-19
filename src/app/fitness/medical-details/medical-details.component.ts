import { Component, inject, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FitnessService } from '../../fitness.service';

@Component({
  selector: 'app-medical-details',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatIconModule, MatFormFieldModule, MatInputModule],
  templateUrl: './medical-details.component.html',
  styleUrl: './medical-details.component.css'
})
export class MedicalDetailsComponent {

  displayedColumns: string[] = ['date', 'patientName','problem', 'hospital', 'docterName', 'diagnosis','otherDetails','actionsColumn'];
  readonly dialogExpense = inject(MatDialogRef<MedicalDetailsComponent>);
  dataSource: MatTableDataSource<any>;
  patientName:string;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private fitnessService: FitnessService) { }

  ngOnInit(): void {
    this.fitnessService.fetchMedicalDetails(this.patientName).subscribe((res)=> this.dataSource = new MatTableDataSource(res));
  }

  close():void {
    this.dialogExpense.close();
  }

  deleteRow(data) {
    this.fitnessService.deleteMedicalDetailData(data);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
