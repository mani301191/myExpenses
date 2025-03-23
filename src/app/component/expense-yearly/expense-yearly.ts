import { Category } from "./category";

export interface ExpenseYearly {
    year: number;
    expense: number;
    income: number;
    savings: number;
    estimated: number;
    category: Category[];
  }