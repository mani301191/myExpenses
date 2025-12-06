export interface FixedDeposit {
  id: number;
  bankName: string;
  accountNumber: string;
  openedDate: string;
  maturityDate: string;
  interestRate: number;
  nomineeName: string;
  depositAmount: number;
  expectedMaturityAmount: number; // auto calculated  
}