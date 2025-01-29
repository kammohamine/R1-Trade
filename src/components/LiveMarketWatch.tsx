import { useState, useEffect } from 'react';
import { marketDataService } from '../services/marketDataService';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatPrice } from '../utils/marketUtils';

interface MarketPrice {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    lastUpdate: string;
}

const FOREX_PAIRS = [
    { from: 'EUR', to: 'USD', symbol: 'EUR/USD' },
    { from: 'GBP', to: 'USD', symbol: 'GBP/USD' },
    { from: 'USD', to: 'JPY', symbol: 'USD/JPY' }
];
const REFRESH_INTERVAL = 10000; // 10 secondes

export default function LiveMarketWatch() {
    const [marketData, setMarketData] = useState<MarketPrice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('🔄 Initializing market watch');
        
        // État initial
        setMarketData([
            { symbol: 'EUR/USD', price: 0, change: 0, changePercent: 0, volume: 0, lastUpdate: 'Connecting...' },
            { symbol: 'GBP/USD', price: 0, change: 0, changePercent: 0, volume: 0, lastUpdate: 'Connecting...' },
            { symbol: 'USD/JPY', price: 0, change: 0, changePercent: 0, volume: 0, lastUpdate: 'Connecting...' }
        ]);

        const unsubscribe = marketDataService.subscribeToMarketData((data) => {
            console.log('📈 Processing market data:', data);
            setMarketData(prevData => {
                const updatedData = [...prevData];
                const index = updatedData.findIndex(item => item.symbol === data.symbol);
                
                if (index !== -1) {
                    const oldPrice = updatedData[index].price;
                    const newPrice = data.price;
                    const change = newPrice - oldPrice;
                    const changePercent = oldPrice !== 0 ? (change / oldPrice) * 100 : 0;
                    
                    updatedData[index] = {
                        ...updatedData[index],
                        price: newPrice,
                        change: change,
                        changePercent: changePercent,
                        volume: data.volume,
                        lastUpdate: new Date(data.timestamp).toLocaleTimeString()
                    };
                }
                
                return updatedData;
            });
            setLoading(false);
        });

        return () => {
            console.log('🔌 Cleaning up subscription');
            unsubscribe();
            marketDataService.disconnect();
        };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-6 bg-gray-800 rounded-lg">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-gray-800 rounded-lg">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-800 rounded-lg shadow-md border border-gray-700">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Live Market Watch</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {marketData.map((item) => (
                    <div key={item.symbol} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-100">{item.symbol}</h3>
                            <span className="text-sm text-gray-400">{item.lastUpdate}</span>
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
                                <p className="text-sm text-gray-400">Volume</p>
                                <p className="text-gray-200">{item.volume.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 