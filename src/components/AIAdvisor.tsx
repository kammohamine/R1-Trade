import { useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { TradingAdvice } from '../types';
import { generateTradingAdvice } from '../services/groqService';
import { marketDataService } from '../services/marketDataService';

export default function AIAdvisor() {
  const [loading, setLoading] = useState(false);
  const [selectedPair, setSelectedPair] = useState('EUR/USD');
  const [timeframe, setTimeframe] = useState('4H');
  const [advices, setAdvices] = useState<TradingAdvice[]>([]);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      await marketDataService.connect(import.meta.env.VITE_META_API_ACCOUNT_ID);
      const marketData = await marketDataService.getForexCandles(selectedPair, '1h');

      const analysis = await generateTradingAdvice(selectedPair, marketData);
      
      // Transformer l'analyse en format TradingAdvice
      const newAdvice: TradingAdvice = {
        pair: selectedPair,
        direction: analysis.direction,
        entryPrice: analysis.key_levels.support[0] || 0,
        stopLoss: analysis.key_levels.support[1] || 0,
        takeProfit: analysis.key_levels.resistance[0] || 0,
        reasoning: analysis.reasoning,
        confidence: analysis.confidence,
        timeframe: timeframe,
        riskReward: calculateRiskRewardRatio(
          analysis.key_levels.support,
          analysis.key_levels.resistance
        ),
        key_levels: {
          support: analysis.key_levels.support,
          resistance: analysis.key_levels.resistance
        }
      };

      setAdvices(prev => [newAdvice, ...prev.slice(0, 2)]);
    } catch (error) {
      console.error('Erreur MetaApi:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRiskRewardRatio = (support: number[], resistance: number[]): number => {
    if (support.length < 2 || resistance.length < 1) return 0;
    const risk = support[0] - support[1];
    const reward = resistance[0] - support[0];
    return reward / Math.abs(risk);
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
        {advices.map((advice, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-6 shadow-md border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  advice.direction === 'LONG' 
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

      <div className="mt-6 bg-gray-800 p-4 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Analyse IA Groq</h3>
        {advices.length > 0 && (
          <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-300">{advices[0].reasoning}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Confiance</p>
                <p className="text-2xl text-green-400">{advices[0].confidence}%</p>
              </div>
              <div className="bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-gray-400">Direction</p>
                <p className={`text-2xl ${
                  advices[0].direction === 'LONG' ? 'text-green-400' :
                  advices[0].direction === 'SHORT' ? 'text-red-400' : 
                  'text-gray-400'
                }`}>
                  {advices[0].direction}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}