import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';

@Component({
  selector: 'app-fitness-detail',
  standalone: true,
  imports: [CanvasJSAngularChartsModule],
  templateUrl: './fitness-detail.component.html',
  styleUrl: './fitness-detail.component.css'
})
export class FitnessDetailComponent {
  chartOptions : any;

  @Input() trend: any;

  ngOnInit(): void {
    this.chartData(this.trend);
   }

  chartData(trend: any) : void {
    this.chartOptions = {
      height:200,
      width:300,
      toolTip: {
        shared: true
      },
      axisY: {
        title: "Weight",
      },     
      data: [
        {
          type: 'line',
          name: "Weight",
          legendText: "Date",
          showInLegend: true,
          dataPoints: trend.slice(0, 12).map((x) => {
            return  {label:x.date.toJSON().slice(0, 10), y:x.weight }   
             })
        }
      ],
    };
  }

}
