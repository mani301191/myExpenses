import { inject, Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  baseUrl = 'http://localhost:8003/api/';
  notificationDataResponse = new BehaviorSubject<any[]>([]);    
  notificationData = this.notificationDataResponse.asObservable();
  _snackBar = inject(MatSnackBar);

  constructor(private http: HttpClient) { }

  fetchReminderData() {
    const mockData = [
      { eventDate: '03/01/2020', eventType: 'Birthday', eventDetail: 'John' },
      { eventDate: '06/15/2021', eventType: 'Anniversary', eventDetail: 'Jane Doe' },
      { eventDate: '12/25/2020', eventType: 'Holiday', eventDetail: 'Christmas' },
      { eventDate: '07/04/2021', eventType: 'Holiday', eventDetail: 'Independence Day' },
      { eventDate: '11/26/2020', eventType: 'Meeting', eventDetail: 'Project Kickoff' },
      { eventDate: '02/14/2025', eventType: 'Holiday', eventDetail: 'Valentine\'s Day' },
      { eventDate: '02/10/2025', eventType: 'Conference', eventDetail: 'Tech Summit' },
      { eventDate: '04/22/2021', eventType: 'Holiday', eventDetail: 'Earth Day' },
      { eventDate: '05/01/2021', eventType: 'Workshop', eventDetail: 'Angular Training' },
      { eventDate: '08/15/2021', eventType: 'Holiday', eventDetail: 'Independence Day' }
    ];

    this.notificationDataResponse.next(mockData);
    return this.notificationData;
  }
  // this.http.get<any[]>(this.baseUrl + 'notification/notificationDetails').subscribe(
  //   (res) => {  
  //     this.notificationDataResponse.next(res); 
  //    },
  //   () => this.displayMessage('Error Occured, Contact System Admin'));
  //   return this.notificationData;
  // }

  displayMessage(message: string) {
    this._snackBar.open(message, 'dismiss', {
      verticalPosition: 'top',
      duration: 3000
    })
  }
}

