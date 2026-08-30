import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { FitnessComponent } from './fitness.component';
import { FitnessService } from '../../service/fitness.service';
import { AddPersonFitnessComponent } from './add-person-fitness/add-person-fitness.component';
import { AddMedicalDetailsComponent } from './add-medical-details/add-medical-details.component';
import { AddWeightDetailsComponent } from './add-weight-details/add-weight-details.component';
import { MedicalDetailsComponent } from './medical-details/medical-details.component';
import { WeightDetailsComponent } from './weight-details/weight-details.component';

describe('FitnessComponent', () => {
  let component: FitnessComponent;
  let fixture: ComponentFixture<FitnessComponent>;
  let fitnessServiceSpy: jasmine.SpyObj<FitnessService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let dialogResult: any;

  const mockPeople = [
    {
      personId: '1',
      personName: 'John',
      personPic: 'pic.png',
      currentHeight: 175,
      currentWeight: 70,
      trend: []
    },
    {
      personId: '2',
      personName: 'Doe',
      personPic: '',
      currentHeight: 165,
      currentWeight: 60,
      trend: [{ date: '01/01/2024', weight: 60 }]
    }
  ];

  beforeEach(async () => {
    dialogResult = { componentInstance: {}, afterClosed: () => of(null) };
    fitnessServiceSpy = jasmine.createSpyObj('FitnessService', [
      'fetchPersonDetails',
      'deletePersonData'
    ]);
    fitnessServiceSpy.fetchPersonDetails.and.returnValue(of([]));
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    dialogSpy.open.and.returnValue(dialogResult);

    await TestBed.configureTestingModule({
      imports: [FitnessComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MatSnackBar, useValue: {} },
        { provide: FitnessService, useValue: fitnessServiceSpy }
      ]
    });
    TestBed.overrideProvider(MatDialog, { useValue: dialogSpy });
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(FitnessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch person details on init', () => {
    expect(fitnessServiceSpy.fetchPersonDetails).toHaveBeenCalled();
    expect(component.fitnessData).toEqual([]);
  });

  it('should populate fitnessData from the service response', () => {
    fitnessServiceSpy.fetchPersonDetails.and.returnValue(of(mockPeople));
    component.loadPersonData();
    expect(component.fitnessData).toEqual(mockPeople);
  });

  it('addPerson should open the AddPerson dialog', () => {
    component.addPerson();
    expect(dialogSpy.open).toHaveBeenCalledWith(AddPersonFitnessComponent);
  });

  it('addPerson should reload person data after dialog closes', () => {
    component.addPerson();
    expect(fitnessServiceSpy.fetchPersonDetails).toHaveBeenCalled();
  });

  it('openMedicalDetails should open MedicalDetails dialog and pass person data to the instance', () => {
    component.openMedicalDetails(mockPeople[0]);
    expect(dialogSpy.open).toHaveBeenCalledWith(MedicalDetailsComponent);
    expect(dialogResult.componentInstance.patientName).toBe('John');
    expect(dialogResult.componentInstance.personPic).toBe('pic.png');
  });

  it('openMedicalDetails should keep personPic even when falsy', () => {
    component.openMedicalDetails(mockPeople[1]);
    expect(dialogResult.componentInstance.patientName).toBe('Doe');
    expect(dialogResult.componentInstance.personPic).toBe('');
  });

  it('openWeightDetails should open WeightDetails dialog with height option and pass person data', () => {
    component.openWeightDetails(mockPeople[0]);
    expect(dialogSpy.open).toHaveBeenCalledWith(WeightDetailsComponent, jasmine.objectContaining({ height: '180vh' }));
    expect(dialogResult.componentInstance.personName).toBe('John');
    expect(dialogResult.componentInstance.personPic).toBe('pic.png');
  });

  it('openWeightDetails should reload person data after dialog closes', () => {
    component.openWeightDetails(mockPeople[0]);
    expect(fitnessServiceSpy.fetchPersonDetails).toHaveBeenCalled();
  });

  it('addMedicalDetails should open AddMedicalDetails dialog with patient data', () => {
    component.addMedicalDetails(mockPeople[0]);
    expect(dialogSpy.open).toHaveBeenCalledWith(AddMedicalDetailsComponent, jasmine.objectContaining({
      data: jasmine.objectContaining({ patientName: 'John' })
    }));
  });

  it('addWeightDetails should open AddWeightDetails dialog with person data', () => {
    component.addWeightDetails(mockPeople[0]);
    expect(dialogSpy.open).toHaveBeenCalledWith(AddWeightDetailsComponent, jasmine.objectContaining({
      data: jasmine.objectContaining({ personName: 'John', height: 175 })
    }));
  });

  it('addWeightDetails should reload person data after dialog closes', () => {
    component.addWeightDetails(mockPeople[0]);
    expect(fitnessServiceSpy.fetchPersonDetails).toHaveBeenCalled();
  });

  it('deleteRow should delegate to deletePersonData', () => {
    component.deleteRow(mockPeople[0]);
    expect(fitnessServiceSpy.deletePersonData).toHaveBeenCalledWith(mockPeople[0]);
  });

  it('printData should set the document title to the fitness summary and call window.print', () => {
    const titleSpy = spyOnProperty(document, 'title', 'set');
    spyOn(window, 'print');
    component.printData();
    const expected = 'Fitness Summary-' + new Date().toISOString().split('T')[0];
    expect(titleSpy).toHaveBeenCalledWith(expected);
    expect(window.print).toHaveBeenCalled();
  });

  it('toggleChartExpand should toggle the expanded chart id', () => {
    expect(component.expandedChart).toBeNull();
    component.toggleChartExpand('1');
    expect(component.expandedChart).toBe('1');
    component.toggleChartExpand('1');
    expect(component.expandedChart).toBeNull();
    component.toggleChartExpand('2');
    expect(component.expandedChart).toBe('2');
  });
});