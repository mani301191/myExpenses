import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
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
import { CareerService } from '../../service/career.service';

@Component({
  selector: 'app-career',
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule,
    MatSortModule, MatPaginatorModule, MatIconModule, ReactiveFormsModule,
    MatSelectModule, FormsModule, CommonModule, NgxPrintDirective,
    MatDatepickerModule, MatNativeDateModule, MatTooltipModule],
  templateUrl: './career.component.html',
  styleUrl: './career.component.css'
})
export class CareerComponent implements OnInit {
  formGroup: FormGroup;
  displayedColumns: string[] = ['recordType', 'orgName', 'designation', 'startDate', 'endDate', 'comments', 'actionsColumn'];
  employmentData: any;
  dataSource: MatTableDataSource<CareerData>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  constructor(private formBuilder: FormBuilder, private careerService: CareerService) {
  }


  ngOnInit() {
    this.createForm();
    this.fetchAppliancesData();
  }

  fetchAppliancesData() {
    this.careerService.fetchCareerData().subscribe(
      (res) => {
        this.dataSource = new MatTableDataSource(res);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.employmentData = this.dataSource.data
          .filter(asset => asset.recordType === 'Employment')
          .sort((a, b) => {
            const parseDate = (dateStr: string) => {
              if (!dateStr) return new Date(); // If no date, use current date
              const [day, month, year] = dateStr.split('/').map(Number); // Parse dd/MM/yyyy
              return new Date(year, month - 1, day); // Create a Date object
            };
            const dateA = parseDate(a.endDate?.toString());
            const dateB = parseDate(b.endDate?.toString());
  
            return dateB.getTime() - dateA.getTime(); // Sort in descending order
  
          });
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      recordType: [null, Validators.required],
      orgName: [null, [Validators.required]],
      designation: [null],
      comments: [null],
      startDate: [null, Validators.required],
      endDate: [null]
    });
  }

  clear(): void {
    this.formGroupDirective.resetForm();
  }

  onSubmit(formData: any): void {
    if (this.formGroup.valid) {
      this.careerService.saveCareerData(formData);
      this.clear();
    }
  }

  deleteRow(data: any): void {
    this.careerService.deleteRow(data);
  }

  calculateDuration(startDate: string, endDate: string): string {
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
  
}
