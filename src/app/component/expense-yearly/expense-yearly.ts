import { Category } from "./category";

export interface ExpenseYearly {
    year: number;
    expense: number;
    income: number;
    savings: number;
    estimated: number;
    category: Category[];
  }

  export interface  MonthlyExpByCatagory {
    category: string;
    January: number;
    February: number;
    March: number;
    April: number;
    May: number;
    June: number;
    July: number;
    August: number;
    September: number;
    October: number;
    November: number;
    December: number;
    total: number;
  }