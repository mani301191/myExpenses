import { Component, Input } from '@angular/core';
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
  @Input() chartHeight: number = 200; 
  @Input() chartWidth: number = 300;

  ngOnChanges(): void {
    this.chartData(this.trend,this.chartHeight, this.chartWidth);
   }

  chartData(trend: any, height: number, width: number) : void {
    this.chartOptions = {
      height:height,
      width:width,
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
          dataPoints: (trend || []).slice(-12).map((x: any) => {
            return { label: x.date, y: x.weight };
          }),
          indexLabelFormatter: function (e: any) {
            return e.dataPoint.y;
          }
        }
      ],
    };
  }

}
