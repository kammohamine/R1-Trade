import React, { useState, useEffect } from 'react';
import marketPredictor from '../services/marketPredictor';
import { AlertTriangle } from 'lucide-react';
import {
    getRiskColor,
} from '../utils/marketUtils';
import { marketDataService } from '../services/marketDataService';
import { generateTradingAdvice } from '../services/groqService';
import { TradingAdvice } from '../types';

interface DashboardProps {
    symbol: string;
    refreshInterval?: number;
}

const MarketPredictionDashboard: React.FC<DashboardProps> = ({ 
    symbol, 
    refreshInterval = 60000
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [predictionData, setPredictionData] = useState<any>(null);
    const [historicalData, setHistoricalData] = useState<any[]>([]);
    const [predictions, setPredictions] = useState<TradingAdvice[]>([]);
    const [selectedPair, setSelectedPair] = useState('EURUSD');

    const fetchData = async () => {
        try {
            setLoading(true);
            const dailyData = await marketDataService.getForexCandles(symbol, '1D');
            setHistoricalData(dailyData);
            const prediction = await marketPredictor.predictMarket(symbol);
            setPredictionData(prediction);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const analyzeMarket = async () => {
        try {
            const candles = await marketDataService.getForexCandles(selectedPair, '1D');
            const prediction = await generateTradingAdvice(selectedPair, candles);
            setPredictions(prev => [prediction, ...prev.slice(0, 3)]);
        } catch (error) {
            console.error('Prediction error:', error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, refreshInterval);
        return () => clearInterval(interval);
    }, [symbol, refreshInterval]);

    if (loading) return <div className="flex items-center justify-center h-96">Loading...</div>;
    if (error) return <div className="text-red-500 p-4">{error}</div>;
    if (!predictionData) return null;

    const getRiskIcon = (risk: string) => {
        return <AlertTriangle className={getRiskColor(risk)} />;
    };

    return (
        <div className="p-6 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Prédictions de marché</h2>
                <div className="flex gap-4">
                    <select 
                        value={selectedPair}
                        onChange={(e) => setSelectedPair(e.target.value)}
                        className="bg-gray-700 px-4 py-2 rounded"
                    >
                        <option value="EURUSD">EUR/USD</option>
                        <option value="GBPJPY">GBP/JPY</option>
                        <option value="USDJPY">USD/JPY</option>
                    </select>
                    <button 
                        onClick={analyzeMarket}
                        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Générer
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {predictions.map((prediction, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">{prediction.pair}</h3>
                            <span className={`px-2 py-1 rounded ${prediction.direction === 'LONG' ? 'bg-green-900' : 'bg-red-900'}`}>
                                {prediction.direction}
                            </span>
                        </div>
                        <p className="text-gray-300">{prediction.reasoning}</p>
                        <div className="mt-4 flex justify-between items-center">
                            <span className="text-sm text-gray-400">Confiance</span>
                            <span className="text-blue-400">{prediction.confidence}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MarketPredictionDashboard;
