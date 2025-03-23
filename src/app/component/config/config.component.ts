import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule } from '@angular/forms';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule,MatIcon,MatFormFieldModule,MatInputModule],
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
  inputs: ['displayedColumns', 'dataSource']
})
export class ConfigComponent {
    formGroup: FormGroup;
  displayedColumns: string[] = ['key', 'value','action'];
  dataSource = [
    { key: 'API_URL', value: 'https://api.example.com' },
    { key: 'APP_VERSION', value: '1.0.0' },
    // Add more key-value pairs as needed
  ];

  @ViewChild(MatTable,{static:true}) table: MatTable<any>;

  addData() {
    this.dataSource.unshift({ key: '', value: '' });
    this.table.renderRows();
  }

  deleteRow(index: number) {
    this.dataSource.splice(index, 1);
    this.table.renderRows();
  }


  saveData(){
   console.log(this.table.dataSource);
  }
}
