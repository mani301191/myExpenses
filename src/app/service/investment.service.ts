import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { InvestmentData } from '../component/investments/investment-data';
import { BehaviorSubject } from 'rxjs';
import { DropDownData } from '../config-data';

@Injectable({
  providedIn: 'root'
})
export class InvestmentService extends BaseService {

   investmentDataResponse = new BehaviorSubject<InvestmentData[]>([]);
   investmentData = this.investmentDataResponse.asObservable();
   investmentResponse = new BehaviorSubject<DropDownData[]>([]);
   investment = this.investmentResponse.asObservable();
   investmentStatusResponse = new BehaviorSubject<DropDownData[]>([]);
   investmentStatus = this.investmentStatusResponse.asObservable();

  constructor(private http: HttpClient) {
    super();
  }

   saveInvestmentData(investmentData) {
        this.http.post<InvestmentData>(this.baseUrl+'investment/investDetail',investmentData).subscribe(
          () => {
            this.displayMessage('Investment Data created successfully' ); 
            this.fetchInvestmentData();
             },
          () => {
            this.displayMessage('Error Occured, Contact System Admin' ); 
          });
        }
  
    fetchInvestmentData() {
      this.http.get<InvestmentData[]>(this.baseUrl + 'investment/investments').subscribe(
        (res) => {  
          this.investmentDataResponse.next(res); 
         },
        () => this.displayMessage('Error Occured, Contact System Admin'));
        return this.investmentData;
    }
  
    deleteRow(data) {
      this.http.delete<any>(this.baseUrl + 'investment/' + data.investId).subscribe(
        (res) => {
          this.displayMessage(res.message);
          this.fetchInvestmentData();
        },
        () => this.displayMessage('Error Occured, Contact System Admin')
      );
    }

    updateInvestmentStatus(data) {
      this.http.patch<any>(this.baseUrl + 'investment/investDetail',data).subscribe(
        (res) => {
          this.displayMessage(res.message);
          this.fetchInvestmentData();
        },
        () => this.displayMessage('Error Occured, Contact System Admin')
      );
    }
  
    fetchInvestmentDropdownData() {
      this.http.get<any>(this.baseUrl + '/config/dropDown?key=Investment' ).subscribe(
       (res) => {  
           this.investmentResponse.next(res);
        },
       () => this.displayMessage('Error Occured, Contact System Admin'));
       return this.investment;
   }

   fetchInvestmentStatusDropdownData() {
    this.http.get<any>(this.baseUrl + '/config/dropDown?key=InvestmentStatus' ).subscribe(
     (res) => {  
         this.investmentStatusResponse.next(res);
      },
     () => this.displayMessage('Error Occured, Contact System Admin'));
     return this.investmentStatus;
 }
}
