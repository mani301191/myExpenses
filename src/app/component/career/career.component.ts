
import { Component, OnInit, ViewChild, inject, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxPrintDirective } from '../../directive/ngx-print.directive';
import { CareerData } from './career-data';
import { DropDownData } from '../../config-data';
import { CareerService } from '../../service/career.service';
import { CareerAddComponent } from './career-add.component';

@Component({
    selector: 'app-career',
    imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule, MatSortModule, MatPaginatorModule, MatIconModule, ReactiveFormsModule, MatSelectModule, FormsModule, NgxPrintDirective, MatDatepickerModule, MatNativeDateModule, MatDialogModule, MatTooltipModule],
    templateUrl: './career.component.html',
    styleUrls: ['./career.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager
})
export class CareerComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  readonly dialog = inject(MatDialog);

  displayedColumns: string[] = ['personName', 'recordType', 'orgName', 'recordId', 'designation', 'startDate', 'endDate', 'comments', 'actionsColumn'];
  personNames: DropDownData[] = [];
  selectedPerson = '';
  dataSource: MatTableDataSource<CareerData> = new MatTableDataSource<CareerData>([]);
  employmentData: CareerData[] = [];

  private allData: CareerData[] = [];

  constructor(private careerService: CareerService) {
  }

  ngOnInit() {
    this.fetchPersonNames();
    this.careerService.fetchCareerData().subscribe(data => {
      this.allData = data ?? [];
      this.applyPersonFilter();
    });
  }

  fetchPersonNames(): void {
    this.careerService.fetchPersonNames().subscribe(data => {
      this.personNames = data;
    });
  }

  onPersonChange(): void {
    this.applyPersonFilter();
  }

  openAddDialog(): void {
    this.dialog.open(CareerAddComponent);
  }

  applyPersonFilter(): void {
    const rows = this.selectedPerson
      ? this.allData.filter(row => row.personName === this.selectedPerson)
      : [];
    this.dataSource = new MatTableDataSource<CareerData>(rows);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.employmentData = rows
      .filter(row => row.recordType === 'Employment')
      .sort((a, b) => {
        const parseDate = (dateStr: string) => {
          if (!dateStr) return new Date();
          const [day, month, year] = dateStr.split('/').map(Number);
          return new Date(year, month - 1, day);
        };
        const dateA = parseDate(a.endDate?.toString());
        const dateB = parseDate(b.endDate?.toString());
        return dateB.getTime() - dateA.getTime();
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteRow(data: any): void {
    this.careerService.deleteRow(data);
  }

  calculateDuration(startDate: any, endDate: any): string {
   const parseDate = (dateStr: string) => {
      if (!dateStr) return null;
      const [day, month, year] = dateStr.split('/').map(Number);
      return new Date(year, month - 1, day);
    };
    const start = parseDate(startDate);
    const end = endDate ? parseDate(endDate) : new Date();
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months--;
      days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return `${years} years, ${months} months, ${days} days`;
  }


  enableEdit(element: any): void {
    // Set isEditing to true for the selected row
    element.isEditing = true;
  }

  updateRecord(element: any): void {
    element.isEditing = false;
    this.careerService.updateCareertDetail(element);
  }

}
