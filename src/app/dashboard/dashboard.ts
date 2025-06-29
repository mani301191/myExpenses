export interface DashboardData {
    expenseTrackingData: {
      income: number;
      estimate: number;
      expense: number;
      currentMonth: string;
    };
    fitnessData: Array<{
      name: string;
      minWeight: number;
      minWeightDate: string;
      maxWeight: number;
      maxWeightDate: string;
      currentWeight: number;
      currentWeightDate: string;
    }>;
    insuranceData: Array<{
      type: string;
      expiryDate: string;
    }>;
    assetData: Array<{
      name: string;
      value: number;
    }>;
    dayWiseExpenses: Array<{
      date: string;
      expense: number;
    }>;
  }

  export interface DayWiseExpenses{
    date: string;
    expense: number;
  }