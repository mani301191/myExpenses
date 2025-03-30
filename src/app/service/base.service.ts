import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export class BaseService {

  baseUrl = 'http://localhost:8003/api/';
   _snackBar = inject(MatSnackBar);

      displayMessage(message: string) {
        this._snackBar.open(message, 'dismiss', {
          verticalPosition: 'top',
          duration: 3000
        })
      }

      getFormattedDate(date) {
        let day = ('0' + date.getDate()).slice(-2);
        let month = date.getMonth() + 1;
        return day + '/' + month + '/' +  date.getFullYear();
    }
}
