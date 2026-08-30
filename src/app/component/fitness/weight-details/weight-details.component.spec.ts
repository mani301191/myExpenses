import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { WeightDetailsComponent } from './weight-details.component';
import { FitnessService } from '../../../service/fitness.service';

describe('WeightDetailsComponent', () => {
  let component: WeightDetailsComponent;
  let fixture: ComponentFixture<WeightDetailsComponent>;
  let fitnessServiceSpy: jasmine.SpyObj<FitnessService>;
  let dialogSpy: jasmine.SpyObj<MatDialogRef<WeightDetailsComponent>>;

  const mockWeight = [
    { id: 'w1', date: '01/01/2024', height: '175', weight: '70' },
    { id: 'w2', date: '02/01/2024', height: '176', weight: '71' },
    { id: 'w3', date: '03/01/2024', height: '175', weight: '69' }
  ];

  beforeEach(async () => {
    dialogSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    fitnessServiceSpy = jasmine.createSpyObj('FitnessService', [
      'fetchPersonWeight',
      'deletePersonWeightData',
      'updateWeightDetail'
    ]);
    fitnessServiceSpy.fetchPersonWeight.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [WeightDetailsComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: {} },
        { provide: MatDialogRef, useValue: dialogSpy },
        { provide: FitnessService, useValue: fitnessServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeightDetailsComponent);
    component = fixture.componentInstance;
    component.personName = 'John';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch person weight on init and populate the data array and table', () => {
    expect(fitnessServiceSpy.fetchPersonWeight).toHaveBeenCalledWith('John');
    expect(component.data).toEqual([]);
    expect(component.dataSource).toBeTruthy();
    expect(component.dataSource.data).toEqual([]);
  });

  it('should fetch weight details for the assigned person name', () => {
    fitnessServiceSpy.fetchPersonWeight.and.returnValue(of([]));
    fitnessServiceSpy.fetchPersonWeight.calls.reset();
    component.personName = 'Jane';
    component.ngOnInit();
    expect(fitnessServiceSpy.fetchPersonWeight).toHaveBeenCalledWith('Jane');
  });

  it('should populate dataSource from the service response', () => {
    fitnessServiceSpy.fetchPersonWeight.and.returnValue(of(mockWeight));
    component.ngOnInit();
    expect(component.data.length).toBe(3);
    expect(component.dataSource.data).toEqual(mockWeight);
  });

  it('applyFilter should set the trimmed lowercase filter on the datasource', () => {
    fitnessServiceSpy.fetchPersonWeight.and.returnValue(of(mockWeight));
    component.ngOnInit();
    const event = { target: { value: '  70 ' } } as any;
    component.applyFilter(event);
    expect(component.dataSource.filter).toBe('70');
  });

  it('applyFilter should send the paginator back to the first page when present', () => {
    fitnessServiceSpy.fetchPersonWeight.and.returnValue(of(mockWeight));
    component.ngOnInit();
    const firstPageSpy = jasmine.createSpy('firstPage');
    component.dataSource.paginator = { firstPage: firstPageSpy, page: of(null), initialized: of(null as any) } as any;
    const event = { target: { value: '70' } } as any;
    component.applyFilter(event);
    expect(firstPageSpy).toHaveBeenCalled();
  });

  it('enableEdit should flag the row as editing', () => {
    const element: any = { weight: '70' };
    component.enableEdit(element);
    expect(element.isEditing).toBeTrue();
  });

  it('updateRecord should unflag the row and call updateWeightDetail', () => {
    const element = { id: 'w1', weight: '72', isEditing: true };
    component.updateRecord(element);
    expect(element.isEditing).toBeFalse();
    expect(fitnessServiceSpy.updateWeightDetail).toHaveBeenCalledWith(element);
  });

  it('deleteRow should call deletePersonWeightData', () => {
    component.deleteRow(mockWeight[0]);
    expect(fitnessServiceSpy.deletePersonWeightData).toHaveBeenCalledWith(mockWeight[0]);
  });

  it('close should close the dialog', () => {
    component.close();
    expect(dialogSpy.close).toHaveBeenCalled();
  });
});