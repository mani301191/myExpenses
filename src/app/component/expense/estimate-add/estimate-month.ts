export interface MonthlyEstimate {
    date: Date;
    description: string;
    amount: number;
  }

  export interface Dropdown {
    id: String;
    value: string;
  }

  export interface ExpenseStatus {
    description: String;
    expenseAmount: number;
    estimatedAmount: number;
  }