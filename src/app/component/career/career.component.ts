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
  displayedColumns: string[] = ['recordType', 'orgName', 'designation',  'startDate', 'endDate', 'comments','actionsColumn'];
  employmentData: any;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  constructor(private formBuilder: FormBuilder) {
  }
  dataSource = new MatTableDataSource([
    { recordType: 'Education', orgName: 'XYZ School', designation: 'High School', comments: 'Graduated with honors', startDate: '01/01/2010', endDate: '01/03/2014' },
    { recordType: 'Education', orgName: 'ABC University', designation: 'Bachelor of Science', comments: 'Major in Computer Science', startDate: '09/01/2014', endDate: '05/15/2018' },
    { recordType: 'Education', orgName: 'DEF Institute', designation: 'Master of Science', comments: 'Specialized in AI', startDate: '09/01/2018', endDate: '05/15/2020' },
    { recordType: 'Employment', orgName: 'ABC Corp', designation: 'Software Engineer', comments: 'Developed web applications', startDate: '06/01/2020', endDate: '08/20/2021' },
    { recordType: 'Employment', orgName: 'DEF Inc', designation: 'Senior Developer', comments: 'Led a team of developers', startDate: '09/01/2021', endDate: '12/31/2022' },
    { recordType: 'Employment', orgName: 'GHI Ltd', designation: 'Tech Lead', comments: 'Managed multiple projects', startDate: '01/10/2023', endDate: '' }
  ]);

  ngOnInit() {
    this.createForm();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.employmentData = this.dataSource.data
      .filter(asset => asset.recordType === 'Employment')
      .sort((a, b) => {
      const dateA = a.endDate ? new Date(a.endDate).getTime() : new Date().getTime();
      const dateB = b.endDate ? new Date(b.endDate).getTime() : new Date().getTime();
      return dateB - dateA;
      });
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
      console.log(formData);
      this.clear();
    }
  }

  deleteRow(data: any): void {
    console.log(data);
  }

  calculateDuration(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
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
