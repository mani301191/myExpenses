import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { EventAddComponent } from './event-add.component';
import { EventsService } from '../../service/events.service';

describe('EventAddComponent', () => {
  let component: EventAddComponent;
  let fixture: ComponentFixture<EventAddComponent>;
  let eventsServiceSpy: jasmine.SpyObj<EventsService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<EventAddComponent>>;

  beforeEach(async () => {
    eventsServiceSpy = jasmine.createSpyObj('EventsService', [
      'fetchEventTypeDropdownData',
      'saveEventData'
    ]);
    eventsServiceSpy.fetchEventTypeDropdownData.and.returnValue(
      of([{ id: '1', value: 'Birthday' }, { id: '2', value: 'Meeting' }] as any)
    );

    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [EventAddComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: EventsService, useValue: eventsServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the event types on init', () => {
    expect(eventsServiceSpy.fetchEventTypeDropdownData).toHaveBeenCalledTimes(1);
    expect(component.eventTypes.length).toBe(2);
  });

  describe('form validation', () => {
    it('should require date, type and detail', () => {
      expect(component.formGroup.valid).toBeFalse();
      expect(component.formGroup.get('eventDate')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.get('eventType')!.errors?.['required']).toBeTruthy();
      expect(component.formGroup.get('eventDetail')!.errors?.['required']).toBeTruthy();
    });

    it('should default the recurrence to none', () => {
      expect(component.formGroup.get('recurrence')!.value).toBe('none');
    });

    it('should become valid once required fields are filled', () => {
      component.formGroup.setValue({
        eventDate: new Date(2026, 2, 15),
        eventType: 'Birthday',
        eventDetail: 'Alice',
        recurrence: 'yearly'
      });
      expect(component.formGroup.valid).toBeTrue();
    });
  });

  describe('onSubmit', () => {
    it('should save a valid form and clear it', () => {
      const value = {
        eventDate: new Date(2026, 2, 15),
        eventType: 'Birthday',
        eventDetail: 'Alice',
        recurrence: 'yearly'
      };
      component.formGroup.setValue(value);
      component.onSubmit(component.formGroup.value);
      expect(eventsServiceSpy.saveEventData).toHaveBeenCalledWith(value);
      expect(component.formGroup.get('eventDetail')!.value).toBeNull();
    });

    it('should not save an invalid form', () => {
      component.onSubmit(component.formGroup.value);
      expect(eventsServiceSpy.saveEventData).not.toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('should close the dialog', () => {
      component.close();
      expect(dialogRefSpy.close).toHaveBeenCalled();
    });
  });
});
