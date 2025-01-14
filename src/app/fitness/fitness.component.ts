import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { FitnessDetailComponent } from './fitness-detail/fitness-detail.component';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddPersonFitnessComponent } from './add-person-fitness/add-person-fitness.component';
import { MedicalDetailsComponent } from './medical-details/medical-details.component';
import { WeightDetailsComponent } from './weight-details/weight-details.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { AddMedicalDetailsComponent } from './add-medical-details/add-medical-details.component';
import { AddWeightDetailsComponent } from './add-weight-details/add-weight-details.component';

const respData =[{name:'Manikandan Narasimhan',height:183,weight:95,trend:[{date:new Date(2024,1,1),weight:92},{date:new Date(2024,2,1),weight:89},{date:new Date(2024,3,1),weight:95}
  ,{date:new Date(2024,4,1),weight:92},{date:new Date(2024,5,1),weight:89},{date:new Date(2024,6,1),weight:95},
  {date:new Date(2024,7,1),weight:90},{date:new Date(2024,8,1),weight:99},{date:new Date(2024,9,1),weight:95},
  {date:new Date(2024,10,1),weight:92},{date:new Date(2024,11,1),weight:89},{date:new Date(2024,12,1),weight:88}
]},
{name:'Radha',height:163,weight:65,trend:[{date:new Date(2024,1,1),weight:62},{date:new Date(2024,2,1),weight:69},{date:new Date(2024,3,1),weight:95}
  ,{date:new Date(2024,4,1),weight:62},{date:new Date(2024,5,1),weight:69},{date:new Date(2024,6,1),weight:60},
  {date:new Date(2024,7,1),weight:60},{date:new Date(2024,8,1),weight:60},{date:new Date(2024,9,1),weight:60},
  {date:new Date(2024,10,1),weight:60},{date:new Date(2024,11,1),weight:60},{date:new Date(2024,12,1),weight:61}
]}];
@Component({
  selector: 'app-fitness',
  standalone: true,
  imports: [MatCardModule,MatIconModule,FitnessDetailComponent,CommonModule,
    MatDialogModule],
  templateUrl: './fitness.component.html',
  styleUrl: './fitness.component.css'
})
export class FitnessComponent {

 fitnessData = null;
 readonly dialog = inject(MatDialog);

  ngOnInit(): void {
   this.fitnessData = respData;
  }

  addFitnessInfo() :void {
    this.dialog.open(AddPersonFitnessComponent);
  }

  openMedicalDetails() :void {
    this.dialog.open(MedicalDetailsComponent);
  }

  openWeightDetails() :void {
    this.dialog.open(WeightDetailsComponent);
  }

  addMedicalDetails() :void {
    this.dialog.open(AddMedicalDetailsComponent);
  }

  addWeightDetails() :void {
    this.dialog.open(AddWeightDetailsComponent);
  }

  deleteRow(data):void{
    alert('deleted ' + data.name);
  }
}
