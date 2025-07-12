import { Injectable } from '@angular/core';
import { Asset } from '../component/assets/asset-data';
import { BaseService } from './base.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { DropDownData } from '../config-data';

@Injectable({
  providedIn: 'root'
})
export class AssetService extends BaseService {

  assetDataResponse = new BehaviorSubject<Asset[]>([]);
  assetData = this.assetDataResponse.asObservable();
  assetTypesResponse = new BehaviorSubject<DropDownData[]>([]);
  assetTypes = this.assetTypesResponse.asObservable();
  assetsResponse = new BehaviorSubject<DropDownData[]>([]);
  assets = this.assetsResponse.asObservable();
  assetStatusResponse = new BehaviorSubject<DropDownData[]>([]);
  assetStatus = this.assetStatusResponse.asObservable();

  constructor(private http: HttpClient) {
    super();
  }
  
   saveAssetData(assetData) {
      this.http.post<Asset>(this.baseUrl+'asset/assetDetail',assetData).subscribe(
        () => {
          this.displayMessage('Asset Data created successfully' ); 
          this.fetchAssetData();
           },
        () => {
          this.displayMessage('Error Occured, Contact System Admin' ); 
        });
      }

  fetchAssetData() {
    this.http.get<Asset[]>(this.baseUrl + 'asset/assetDetails').subscribe(
      (res) => {  
        this.assetDataResponse.next(res); 
       },
      () => this.displayMessage('Error Occured, Contact System Admin'));
      return this.assetData;
  }

  deleteRow(data) {
    this.http.delete<any>(this.baseUrl + 'asset/' + data.id).subscribe(
      (res) => {
        this.displayMessage(res.message);
        this.fetchAssetData();
      },
      () => this.displayMessage('Error Occured, Contact System Admin')
    );
  }

  updateAssetStatus(data) {
    this.http.patch<any>(this.baseUrl + 'asset/assetDetail',data).subscribe(
      (res) => {
        this.displayMessage(res.message);
        this.fetchAssetData();
      },
      () => this.displayMessage('Error Occured, Contact System Admin')
    );
  }

  fetchAssetTypesDropdownData() {
     this.http.get<any>(this.baseUrl + '/config/dropDown?key=AssetTypes' ).subscribe(
      (res) => {  
          this.assetTypesResponse.next(res);
       },
      () => this.displayMessage('Error Occured, Contact System Admin'));
      return this.assetTypes;
  }

  fetchAssetDropdownData() {
    this.http.get<any>(this.baseUrl + '/config/dropDown?key=Assets' ).subscribe(
     (res) => {  
         this.assetsResponse.next(res);
      },
     () => this.displayMessage('Error Occured, Contact System Admin'));
     return this.assets;
 }

 fetchAssetStatusDropdownData() {
  this.http.get<any>(this.baseUrl + '/config/dropDown?key=AssetStatus').subscribe(
   (res) => {  
       this.assetStatusResponse.next(res);
    },
   () => this.displayMessage('Error Occured, Contact System Admin'));
   return this.assetStatus;
}

}
