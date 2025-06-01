import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FitnessDetailComponent } from './fitness-detail/fitness-detail.component';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddPersonFitnessComponent } from './add-person-fitness/add-person-fitness.component';
import { MedicalDetailsComponent } from './medical-details/medical-details.component';
import { WeightDetailsComponent } from './weight-details/weight-details.component';
import { AddMedicalDetailsComponent } from './add-medical-details/add-medical-details.component';
import { AddWeightDetailsComponent } from './add-weight-details/add-weight-details.component';
import { FitnessService } from '../../service/fitness.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-fitness',
  standalone: true,
  imports: [MatCardModule, MatIconModule, FitnessDetailComponent, CommonModule,
    MatDialogModule,MatTooltipModule],
  templateUrl: './fitness.component.html',
  styleUrl: './fitness.component.css'
})
export class FitnessComponent {

  fitnessData = null;
  readonly dialog = inject(MatDialog);

  constructor(private fitnessService: FitnessService) { }

  ngOnInit(): void {
    this.loadPersonData();
  }

  loadPersonData(): void {
    this.fitnessService.fetchPersonDetails().subscribe((res) => this.fitnessData = res);
  }

  addPerson(): void {
    this.dialog.open(AddPersonFitnessComponent).afterClosed().subscribe(() => {
      this.loadPersonData();
    });
  }

  openMedicalDetails(data): void {
    let dialogRef = this.dialog.open(MedicalDetailsComponent);
    let instance = dialogRef.componentInstance;
    instance.patientName = data.personName;
    instance.personPic = data.personPic;
  }

  openWeightDetails(data): void {
    let dialogRef = this.dialog.open(WeightDetailsComponent);
    let instance = dialogRef.componentInstance;
    instance.personName = data.personName;
    instance.personPic = data.personPic;
    dialogRef.afterClosed().subscribe(() => this.loadPersonData());
  }

  addMedicalDetails(): void {
    this.dialog.open(AddMedicalDetailsComponent);
  }

  addWeightDetails(): void {
    this.dialog.open(AddWeightDetailsComponent).afterClosed().subscribe(() => this.loadPersonData());
  }

  deleteRow(data): void {
    this.fitnessService.deletePersonData(data);
  }

  printData(): void {
    const currentDate = new Date().toISOString().split('T')[0];
    window.document.title='Fitness Summary-'+currentDate;
    window.print();
  }
}
