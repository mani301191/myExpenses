export interface ExpenseMonthly {
    expenseDate: Date; 
    expenseId:number; 
    year: number;
    month: string;
    amount: number;
    expenseType: string;
    expenseOf:string;
    description:string;
  }