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
  uploadingResponse = new BehaviorSubject<boolean>(false);
  uploading = this.uploadingResponse.asObservable();

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

  uploadEventFile(file: File) {
    if (!file) {
      this.displayMessage('Please select a file to upload');
      return this.eventData;
    }
    const formData = new FormData();
    formData.append('file', file);
    this.uploadingResponse.next(true);
    this.http.post(this.baseUrl + 'event/uploadEvents', formData, { responseType: 'text' })
      .subscribe(
        (res) => {
          this.displayMessage(res);
          this.fetchEventData();
        },
        () => this.displayMessage('Error Occured, Contact System Admin'),
        () => this.uploadingResponse.next(false));
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
    this.http.get<any>(this.baseUrl + 'config/dropDown?key=EventType').subscribe(
      (res) => {
        this.eventDropDownResponse.next(res);
      },
      () => this.displayMessage('Error Occured, Contact System Admin'));
    return this.eventDropDown;
  }

}
