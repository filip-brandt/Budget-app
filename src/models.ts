export interface IBudgetEntry {
  id: string;
  type: "income" | "expense";
  description: string;
  amount: number;
  category: string;
}

export interface Categories {
  income: string[];
  expense: string[];
}