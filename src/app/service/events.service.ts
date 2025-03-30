import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { EventData } from '../component/reminders/event-data';
import { BehaviorSubject } from 'rxjs';
import { DropDownData } from '../config-data';

@Injectable({
  providedIn: 'root'
})
export class EventsService extends BaseService {

  eventDataResponse = new BehaviorSubject<EventData[]>([]);
  eventData = this.eventDataResponse.asObservable();
  eventDropDownResponse = new BehaviorSubject<DropDownData[]>([]);
  eventDropDown = this.eventDropDownResponse.asObservable();

  constructor(private http: HttpClient) {
    super();
  }

  saveEventData(eventData) {
    if (eventData.eventDate) {
      eventData.eventDate = this.getFormattedDate(eventData.eventDate);
    }
    this.http.post<EventData[]>(this.baseUrl + 'event/eventDetail', eventData).subscribe(
      () => {
        this.displayMessage('Event Data created successfully');
        this.fetchEventData();
      },
      () => {
        this.displayMessage('Error Occured, Contact System Admin');
      });
  }

  fetchEventData() {
    this.http.get<EventData[]>(this.baseUrl + 'event/eventDetail').subscribe(
      (res) => {
        this.eventDataResponse.next(res);
      },
      () => this.displayMessage('Error Occured, Contact System Admin'));
    return this.eventData;
  }

  deleteRow(data) {
    this.http.delete<any>(this.baseUrl + 'event/' + data.eventId).subscribe(
      (res) => {
        this.displayMessage(res.message);
        this.fetchEventData();
      },
      () => this.displayMessage('Error Occured, Contact System Admin')
    );
  }

  fetchEventTypeDropdownData() {
    this.http.get<any>(this.baseUrl + '/config/dropDown?key=EventType').subscribe(
      (res) => {
        this.eventDropDownResponse.next(res);
      },
      () => this.displayMessage('Error Occured, Contact System Admin'));
    return this.eventDropDown;
  }

}
