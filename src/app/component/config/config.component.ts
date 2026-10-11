import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';

import { FormGroup, FormsModule } from '@angular/forms';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AppConfigService } from '../../service/app-config.service';
import { ConfigData } from '../../config-data';

@Component({
    selector: 'app-config',
    imports: [FormsModule, MatTableModule, MatFormFieldModule, MatInputModule],
    templateUrl: './config.component.html',
    styleUrls: ['./config.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    inputs: ['displayedColumns', 'dataSource']
})
export class ConfigComponent {
  formGroup: FormGroup;
  displayedColumns: string[] = ['key', 'value'];
  dataSource: ConfigData[] = [];
  isNew: false ;
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;

  constructor(private appConfigService: AppConfigService) {
  }
  ngOnInit() {
    this.fetchConfigData();
  }

  fetchConfigData() {
    this.appConfigService.fetchConfigData().subscribe(
      (res) => {
        this.dataSource = res.map(item => ({
          ...item,
          isNew: false // Mark all existing rows as not new
        }));
      }
    );
  }

  addData() {
    this.dataSource.unshift({ key: '', value: '' , isNew: true });
    this.table.renderRows();
  }

  deleteRow(data) {
    this.appConfigService.deleteRow(data);
  }


  saveData() {
    this.appConfigService.saveConfigData(this.table.dataSource);
  }

  saveDefaultConfigData() {
    this.appConfigService.saveDefaultConfigData();
  }
}
