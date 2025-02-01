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

export interface MarketPrediction {
  prediction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  indicators: {
    rsi: number;
    macd: {
      macdLine: number;
      signalLine: number;
      histogram: number;
    };
    sma: number;
    ema: number;
  };
  supportLevels: number[];
  resistanceLevels: number[];
  trend: string;
  riskLevel: 'high' | 'medium' | 'low';
}

export interface MarketData {
  timeframe?: string;
  close: number;
  volume: number;
  timestamp?: string;
  open?: number;
  high?: number;
  low?: number;
}

export interface TradingAdvice {
  pair: string;
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  reasoning: string;
  confidence: number;
  timeframe: string;
  riskReward: number;
  key_levels: {
    support: number[];
    resistance: number[];
  };
  metaapiInfo?: {
    spread: number;
    executionSpeed: number;
  };
}

export interface GroqAnalysis {
  summary: string;
  confidence: number;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  reasoning: string;
  key_levels: {
    support: number[];
    resistance: number[];
  };
}