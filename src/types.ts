export interface Trade {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice?: number;
  size: number;
  date: Date;
  status: 'OPEN' | 'CLOSED';
  pnl?: number;
  notes?: string;
}

export interface Account {
  balance: number;
  equity: number;
  openPositions: number;
  dailyPnL: number;
  totalTrades: number;
  winRate: number;
}

export interface DashboardStats {
  dailyPnL: number;
  weeklyPnL: number;
  monthlyPnL: number;
  totalTrades: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
}

export interface TradingAdvice {
  pair: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  reasoning: string;
  confidence: number;
  timeframe: string;
  riskReward: number;
}