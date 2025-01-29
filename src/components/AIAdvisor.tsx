import { useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { TradingAdvice } from '../types';

const mockAdvice: TradingAdvice[] = [
  {
    pair: 'EUR/USD',
    direction: 'BUY',
    entryPrice: 1.0850,
    stopLoss: 1.0820,
    takeProfit: 1.0920,
    reasoning: 'Strong bullish momentum with support at 1.0820. RSI indicates oversold conditions and MACD shows potential reversal.',
    confidence: 85,
    timeframe: '4H',
    riskReward: 2.33
  },
  {
    pair: 'GBP/JPY',
    direction: 'SELL',
    entryPrice: 185.500,
    stopLoss: 185.800,
    takeProfit: 184.600,
    reasoning: 'Price reached major resistance zone with bearish divergence on RSI. Previous support turned resistance.',
    confidence: 78,
    timeframe: '1D',
    riskReward: 3.0
  }
];

export default function AIAdvisor() {
  const [loading, setLoading] = useState(false);
  const [selectedPair, setSelectedPair] = useState('EUR/USD');
  const [timeframe, setTimeframe] = useState('4H');

  const handleAnalyze = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-md border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-100">AI Trading Advisor</h2>
        </div>
        <div className="flex space-x-4">
          <select
            value={selectedPair}
            onChange={(e) => setSelectedPair(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="EUR/USD">EUR/USD</option>
            <option value="GBP/JPY">GBP/JPY</option>
            <option value="USD/JPY">USD/JPY</option>
            <option value="GBP/USD">GBP/USD</option>
          </select>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="15M">15M</option>
            <option value="1H">1H</option>
            <option value="4H">4H</option>
            <option value="1D">1D</option>
          </select>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 text-gray-100 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Brain className="w-5 h-5" />
            )}
            <span>Analyze</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {mockAdvice.map((advice, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-6 shadow-md border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  advice.direction === 'BUY' 
                    ? 'bg-green-900 text-green-300' 
                    : 'bg-red-900 text-red-300'
                }`}>
                  {advice.direction}
                </div>
                <span className="text-xl font-bold text-gray-100">{advice.pair}</span>
                <span className="text-gray-400">{advice.timeframe}</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span className="font-medium text-gray-100">Confidence: {advice.confidence}%</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-4">
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Entry Price</p>
                <p className="text-lg font-semibold text-gray-100">{advice.entryPrice.toFixed(5)}</p>
              </div>
              <div className="text-center p-4 bg-red-900/30 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Stop Loss</p>
                <p className="text-lg font-semibold text-red-400">{advice.stopLoss.toFixed(5)}</p>
              </div>
              <div className="text-center p-4 bg-green-900/30 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Take Profit</p>
                <p className="text-lg font-semibold text-green-400">{advice.takeProfit.toFixed(5)}</p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Analysis</h4>
              <p className="text-gray-300">{advice.reasoning}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="flex items-center space-x-2 text-gray-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm">Risk/Reward Ratio: {advice.riskReward.toFixed(2)}</span>
              </div>
              <button className="flex items-center space-x-2 text-blue-400 hover:text-blue-300">
                <span>Place Trade</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}