import React, { useState, useEffect } from 'react';
import marketPredictor from '../services/marketPredictor';
import { ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import {
    getTrendColor,
    getRiskColor,
    formatPrice,
    formatPercentage,
    getIndicatorColor,
    cardClasses
} from '../utils/marketUtils';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { marketDataService } from '../services/marketDataService';

interface DashboardProps {
    symbol: string;
    refreshInterval?: number; // in milliseconds
}

const MarketPredictionDashboard: React.FC<DashboardProps> = ({ 
    symbol, 
    refreshInterval = 60000 // default 1 minute
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [predictionData, setPredictionData] = useState<any>(null);
    const [historicalData, setHistoricalData] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const dailyData = await marketDataService.getDailyData(symbol);
            setHistoricalData(dailyData);
            const prediction = await marketPredictor.predictMarket(dailyData);
            setPredictionData(prediction);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
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
        <div className={cardClasses.container}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Prediction Summary */}
                <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className={cardClasses.header}>Prediction Summary</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={cardClasses.value}>
                                {formatPrice(predictionData.prediction)}
                            </p>
                            <p className={`flex items-center ${getTrendColor(predictionData.trend)}`}>
                                {predictionData.trend === 'bullish' ? <ArrowUp /> : <ArrowDown />}
                                {predictionData.trend}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className={cardClasses.subheader}>Confidence</p>
                            <p className={cardClasses.value}>
                                {formatPercentage(predictionData.confidence)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Technical Indicators */}
                <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className={cardClasses.header}>Technical Indicators</h3>
                    <div className="space-y-2">
                        <div className={cardClasses.indicator.container}>
                            <span className={cardClasses.indicator.label}>RSI</span>
                            <span className={getIndicatorColor(predictionData.indicators.rsi, 'rsi')}>
                                {predictionData.indicators.rsi.toFixed(2)}
                            </span>
                        </div>
                        <div className={cardClasses.indicator.container}>
                            <span className={cardClasses.indicator.label}>MACD</span>
                            <span className={getIndicatorColor(predictionData.indicators.macd.histogram, 'macd')}>
                                {predictionData.indicators.macd.macdLine.toFixed(2)}
                            </span>
                        </div>
                        <div className={cardClasses.indicator.container}>
                            <span className={cardClasses.indicator.label}>EMA</span>
                            <span>{predictionData.indicators.ema.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Support & Resistance */}
                <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className={cardClasses.header}>Support & Resistance</h3>
                    <div className="space-y-2">
                        <div>
                            <p className={cardClasses.subheader}>Resistance Levels</p>
                            <div className="flex gap-2">
                                {predictionData.resistanceLevels.map((level: number, index: number) => (
                                    <span key={index} className="text-red-500">${level.toFixed(2)}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className={cardClasses.subheader}>Support Levels</p>
                            <div className="flex gap-2">
                                {predictionData.supportLevels.map((level: number, index: number) => (
                                    <span key={index} className="text-green-500">${level.toFixed(2)}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Price Chart */}
            <div className="mt-6 h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="timestamp" 
                            tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis domain={['auto', 'auto']} />
                        <Tooltip 
                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
                            formatter={(value: number) => ['$' + value.toFixed(2)]}
                        />
                        <Legend />
                        <Line 
                            type="monotone" 
                            dataKey="close" 
                            stroke="#2563eb" 
                            name="Price"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Risk Level */}
            <div className="mt-6 flex items-center gap-2">
                <span className="text-gray-600">Risk Level:</span>
                <div className="flex items-center gap-1">
                    {getRiskIcon(predictionData.riskLevel)}
                    <span className="capitalize">{predictionData.riskLevel}</span>
                </div>
            </div>
        </div>
    );
};

export default MarketPredictionDashboard;
