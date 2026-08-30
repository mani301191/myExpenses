import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { FitnessDetailComponent } from './fitness-detail.component';

describe('FitnessDetailComponent', () => {
  let component: FitnessDetailComponent;
  let fixture: ComponentFixture<FitnessDetailComponent>;

  const trendData = [
    { date: '01/01/2024', weight: 70 },
    { date: '02/01/2024', weight: 71 },
    { date: '03/01/2024', weight: 69 },
    { date: '04/01/2024', weight: 68 }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FitnessDetailComponent, NoopAnimationsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FitnessDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('chartData should build chartOptions with default height, width and line series', () => {
    component.chartData(trendData, 200, 300);
    expect(component.chartOptions).toBeTruthy();
    expect(component.chartOptions.height).toBe(200);
    expect(component.chartOptions.width).toBe(300);
    expect(component.chartOptions.data.length).toBe(1);
    expect(component.chartOptions.data[0].type).toBe('line');
    expect(component.chartOptions.data[0].name).toBe('Weight');
    expect(component.chartOptions.data[0].showInLegend).toBeTrue();
    expect(component.chartOptions.data[0].legendText).toBe('Date');
  });

  it('chartData should map each trend entry into a date/weight datapoint', () => {
    component.chartData(trendData, 200, 300);
    const dataPoints = component.chartOptions.data[0].dataPoints;
    expect(dataPoints).toEqual([
      { label: '01/01/2024', y: 70 },
      { label: '02/01/2024', y: 71 },
      { label: '03/01/2024', y: 69 },
      { label: '04/01/2024', y: 68 }
    ]);
  });

  it('chartData should only keep the last 12 datapoints', () => {
    const bigTrend = Array.from({ length: 20 }, (_, i) => ({ date: `0/${i + 1}/2024`, weight: i }));
    component.chartData(bigTrend, 200, 300);
    expect(component.chartOptions.data[0].dataPoints.length).toBe(12);
    expect(component.chartOptions.data[0].dataPoints[0].label).toBe('0/9/2024');
    expect(component.chartOptions.data[0].dataPoints[11].label).toBe('0/20/2024');
  });

  it('chartData should produce empty datapoints when trend is null or undefined', () => {
    component.chartData(null, 200, 300);
    expect(component.chartOptions.data[0].dataPoints).toEqual([]);
  });

  it('indexLabelFormatter should return the data point y value', () => {
    component.chartData(trendData, 200, 300);
    const formatter = component.chartOptions.data[0].indexLabelFormatter;
    expect(formatter({ dataPoint: { y: 75 } })).toBe(75);
  });

  it('ngOnChanges should re-render chartData using bound inputs', () => {
    component.trend = trendData;
    component.chartHeight = 400;
    component.chartWidth = 600;
    component.ngOnChanges();
    expect(component.chartOptions.height).toBe(400);
    expect(component.chartOptions.width).toBe(600);
    expect(component.chartOptions.data[0].dataPoints.length).toBe(4);
  });

  it('should re-render when inputs are assigned and change detection runs', () => {
    component.ngOnChanges();
    component.trend = trendData;
    component.chartHeight = 500;
    component.chartWidth = 700;
    component.ngOnChanges();
    expect(component.chartOptions.height).toBe(500);
    expect(component.chartOptions.width).toBe(700);
    expect(component.chartOptions.data[0].dataPoints[0].label).toBe('01/01/2024');
  });
});