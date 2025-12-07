import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { FixedDeposit } from './fixed-deposit';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { InvestmentService } from '../../../service/investment.service';
import { InrFormatPipe } from '../../../pipes/indian-currency.pipe';

@Component({
  selector: 'app-fixed-deposit',
  standalone: true,
  imports: [ MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    MatExpansionModule,
    InrFormatPipe],
  templateUrl: './fixed-deposit.component.html',
  styleUrl: './fixed-deposit.component.css'
})
export class FixedDepositComponent implements OnInit {

    fdForm!: FormGroup;
    editingId: number | null = null;
    fixedDeposits: FixedDeposit[] = [];
  
    constructor(private fb: FormBuilder, private investmentService: InvestmentService) {}
  
    ngOnInit(): void {
      this.fdForm = this.fb.group({
        bankName: ['', Validators.required],
        accountNumber: ['', Validators.required],
        openedDate: ['', Validators.required],
        maturityDate: ['', Validators.required],
        interestRate: ['', [Validators.required, Validators.min(1)]],
        nomineeName: ['', Validators.required],
        depositAmount: ['', Validators.required]
      },
      { validators: this.dateRangeValidator });
      this.investmentService.fetchFixedDeposits();
      this.investmentService.fixedDeposit.subscribe(data => {
        this.fixedDeposits = data;
        this.sortFDs();
      });

    }
  
    // ---------- Utility: Calculate Expected Maturity Amount ---------- //
    calculateMaturityAmount(deposit: number, interestRate: number, start: string, end: string): number {
      const years = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 3600 * 24 * 365);
  
      // Simple interest calculation
      const maturity = deposit + (deposit * interestRate * years) / 100;
  
      return Math.round(maturity);
    }
  
    // ---------- Utility: Calculate Current Value (as of today) ---------- //
    calculateCurrentValue(fd: FixedDeposit): number {
      const today = new Date().getTime();
      const start = new Date(fd.openedDate).getTime();
      const end = new Date(fd.maturityDate).getTime();
  
      const totalDuration = end - start;
      if (totalDuration <= 0) return fd.depositAmount;
      const elapsed = Math.min(today - start, totalDuration);
  
      const maturityValue = fd.expectedMaturityAmount;
      const growth = elapsed / totalDuration;
  
      // Linear interest growth approximation
      return Math.round(fd.depositAmount + (maturityValue - fd.depositAmount) * growth);
    }
  
    // Sort cards by maturity date (DESC)
    sortFDs() {
      this.fixedDeposits.sort((a, b) =>
        new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime()
      );
    }
  
    // Populate form for editing
    editFD(fd: FixedDeposit) {
      this.editingId = fd.id;
      this.fdForm.patchValue(fd);
    }
  
    // Create or Update FD
    saveFD() {
      if (this.fdForm.invalid) return;
  
      const formValue = this.fdForm.value;
      const maturityAmount = this.calculateMaturityAmount(
        formValue.depositAmount,
        formValue.interestRate,
        formValue.openedDate,
        formValue.maturityDate
      );
  
      if (this.editingId != null) {
        // update
        this.investmentService.updateFixedDeposit({id: this.editingId, ...formValue, expectedMaturityAmount: maturityAmount});
      } else {
        // create new
        this.investmentService.saveFixedDeposit({...formValue, expectedMaturityAmount: maturityAmount});
      }
  
      this.sortFDs();
      this.fdForm.reset();
      this.editingId = null;
    }
  
    deleteFD(id: number) {
      this.investmentService.deleteFixedDeposit({id});
    }
  
    cancelEdit() {
      this.editingId = null;
      this.fdForm.reset();
    }
  
    // ---------- Footer totals ---------- //
    get totalDeposit(): number {
      return this.fixedDeposits.reduce((sum, fd) => sum + fd.depositAmount, 0);
    }
  
    get totalCurrentValue(): number {
      return this.fixedDeposits.reduce((sum, fd) => sum + this.calculateCurrentValue(fd), 0);
    }

    dateRangeValidator(form: FormGroup) {
      const opened = form.get('openedDate');
      const maturity = form.get('maturityDate');
    
      if (!opened || !maturity) return null;
    
      const openedDate = opened.value;
      const maturityDate = maturity.value;
    
      if (!openedDate || !maturityDate) {
        maturity.setErrors(null);
        return null;
      }
    
      // If maturity < opened → set error on maturity control
      if (new Date(maturityDate) < new Date(openedDate)) {
        maturity.setErrors({ dateRangeInvalid: true });
      } else {
        // Remove only our custom error, keep others
        if (maturity.errors?.['dateRangeInvalid']) {
          delete maturity.errors['dateRangeInvalid'];
          if (Object.keys(maturity.errors).length === 0) {
            maturity.setErrors(null);
          }
        }
      }
    
      return null;
    }
}
