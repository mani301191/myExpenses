import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { ConfigData } from '../config-data';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService extends BaseService {

   configDataResponse = new BehaviorSubject<ConfigData[]>([]);
   configData = this.configDataResponse.asObservable();

  constructor(private http: HttpClient) {
    super();
  }

   saveConfigData(configData) {
        this.http.post<ConfigData[]>(this.baseUrl+'config/appConfig',configData).subscribe(
          () => {
            this.displayMessage('Config Data created successfully' ); 
            this.fetchConfigData();
             },
          () => {
            this.displayMessage('Error Occured, Contact System Admin' ); 
          });
        }
  
    fetchConfigData() {
      this.http.get<ConfigData[]>(this.baseUrl + 'config/appConfig').subscribe(
        (res) => {  
          this.configDataResponse.next(res); 
         },
        () => this.displayMessage('Error Occured, Contact System Admin'));
        return this.configData;
    }
  
    deleteRow(data) {
      this.http.delete<any>(this.baseUrl + 'config/' + data.key).subscribe(
        (res) => {
          this.displayMessage(res.message);
          this.fetchConfigData();
        },
        () => this.displayMessage('Error Occured, Contact System Admin')
      );
    }
}
