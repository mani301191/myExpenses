import { Component, ViewChild, inject, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormGroupDirective, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DropDownData } from '../../config-data';
import { InvestmentService } from '../../service/investment.service';

@Component({
  selector: 'app-investment-add',
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatToolbarModule, MatTooltipModule, ReactiveFormsModule],
  templateUrl: './investment-add.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './investment-add.component.css'
})
export class InvestmentAddComponent {
  formGroup: FormGroup;
  readonly dialogRef = inject(MatDialogRef<InvestmentAddComponent>);
  investmentsList: DropDownData[] = [];
  investStatusList: DropDownData[] = [];
  @ViewChild(FormGroupDirective) formGroupDirective: FormGroupDirective;

  constructor(private formBuilder: FormBuilder, private investmentService: InvestmentService) { }

  ngOnInit() {
    this.createForm();
    this.investmentService.fetchInvestmentDropdownData().subscribe(data => {
      this.investmentsList = data;
    });
    this.investmentService.fetchInvestmentStatusDropdownData().subscribe(data => {
      this.investStatusList = data;
    });
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      'investment': [null, Validators.required],
      'investmentDetail': [null, Validators.required],
      'vendorAccountNumber': [null, [Validators.required]],
      'nominee': [null, Validators.required],
      'additionalDetails': [null],
      'status': [null, Validators.required]
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  onSubmit(formData: any): void {
    if (this.formGroup.valid) {
      this.investmentService.saveInvestmentData(formData);
      this.clear();
    }
  }

  clear(): void {
    if (this.formGroupDirective) {
      this.formGroupDirective.resetForm();
    } else {
      this.formGroup.reset();
    }
  }
}
