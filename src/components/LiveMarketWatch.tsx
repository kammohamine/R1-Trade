import { useState, useEffect } from 'react';
import { marketDataService } from '../services/marketDataService';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatPrice } from '../utils/marketUtils';
import React from 'react';

interface MarketPrice {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    spread: number;
}

const FOREX_PAIRS = [
    { from: 'EUR', to: 'USD', symbol: 'EUR/USD' },
    { from: 'GBP', to: 'USD', symbol: 'GBP/USD' },
    { from: 'USD', to: 'JPY', symbol: 'USD/JPY' },
    { from: 'BTC', to: 'USD', symbol: 'BTC/USD' }
];
const REFRESH_INTERVAL = 10000; // 10 secondes

const MarketCard = React.memo(({ item }: { item: MarketPrice }) => (
    <div className="bg-gray-700 rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-100">{item.symbol}</h3>
        </div>
        
        <div className="flex justify-between items-end">
            <div>
                <p className="text-2xl font-bold text-gray-100">
                    {formatPrice(item.price)}
                </p>
                <div className="flex items-center space-x-2">
                    {item.change >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`${item.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {item.change.toFixed(4)} ({item.changePercent.toFixed(2)}%)
                    </span>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm text-gray-400">Spread</p>
                <p className="text-gray-200">
                    {(!isNaN(item.spread) ? (item.spread * 10000).toFixed(1) : '0.0')} pips
                </p>
            </div>
        </div>
    </div>
));

const LiveMarketWatch = () => {
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [connectionStatus, setConnectionStatus] = useState(false);

    useEffect(() => {
        const unsubscribe = marketDataService.subscribeToMarketData((data) => {
            setPrices(prev => ({
                ...prev,
                [data.symbol]: data.price
            }));
        });

        return () => {
            unsubscribe();
            marketDataService.disconnect();
        };
    }, []);

    return (
        <div className="p-4 bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Marché en direct</h2>
                <div className={`w-3 h-3 rounded-full ${connectionStatus ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                {Object.entries(prices).map(([pair, price]) => (
                    <div key={pair} className="bg-gray-700 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">{pair}</span>
                            <span className="text-green-400">${price.toFixed(5)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveMarketWatch; 