import axios from 'axios';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

interface MarketData {
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface TechnicalIndicators {
    rsi: number;
    macd: {
        macdLine: number;
        signalLine: number;
        histogram: number;
    };
    sma: number;
    ema: number;
}

interface PredictionResult {
    prediction: number;
    confidence: number;
    indicators: TechnicalIndicators;
    supportLevels: number[];
    resistanceLevels: number[];
    trend: 'bullish' | 'bearish' | 'neutral';
    riskLevel: 'low' | 'medium' | 'high';
}

export class MarketPredictor {
    private static instance: MarketPredictor;
    
    private constructor() {}
    
    public static getInstance(): MarketPredictor {
        if (!MarketPredictor.instance) {
            MarketPredictor.instance = new MarketPredictor();
        }
        return MarketPredictor.instance;
    }

    private calculateRSI(prices: number[], period: number = 14): number {
        let gains = 0;
        let losses = 0;
        
        for (let i = 1; i < period + 1; i++) {
            const difference = prices[i] - prices[i - 1];
            if (difference >= 0) {
                gains += difference;
            } else {
                losses -= difference;
            }
        }
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    private calculateMACD(prices: number[]): { macdLine: number; signalLine: number; histogram: number } {
        const ema12 = this.calculateEMA(prices, 12);
        const ema26 = this.calculateEMA(prices, 26);
        const macdLine = ema12 - ema26;
        const signalLine = this.calculateEMA([macdLine], 9);
        const histogram = macdLine - signalLine;
        
        return { macdLine, signalLine, histogram };
    }

    private calculateEMA(prices: number[], period: number): number {
        const multiplier = 2 / (period + 1);
        let ema = prices[0];
        
        for (let i = 1; i < prices.length; i++) {
            ema = (prices[i] - ema) * multiplier + ema;
        }
        
        return ema;
    }

    private calculateSupportResistance(data: MarketData[]): { support: number[]; resistance: number[] } {
        const prices = data.map(d => d.close);
        const support: number[] = [];
        const resistance: number[] = [];
        
        for (let i = 1; i < prices.length - 1; i++) {
            if (prices[i] < prices[i - 1] && prices[i] < prices[i + 1]) {
                support.push(prices[i]);
            }
            if (prices[i] > prices[i - 1] && prices[i] > prices[i + 1]) {
                resistance.push(prices[i]);
            }
        }
        
        return {
            support: [...new Set(support)].slice(0, 3),
            resistance: [...new Set(resistance)].slice(0, 3)
        };
    }

    async getMarketData(symbol: string): Promise<MarketData[]> {
        try {
            const response = await axios.get(
                `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
            );
            
            const timeSeriesData = response.data['Time Series (Daily)'];
            return Object.entries(timeSeriesData).map(([date, values]: [string, any]) => ({
                timestamp: date,
                open: parseFloat(values['1. open']),
                high: parseFloat(values['2. high']),
                low: parseFloat(values['3. low']),
                close: parseFloat(values['4. close']),
                volume: parseFloat(values['5. volume'])
            }));
        } catch (error) {
            console.error('Error fetching market data:', error);
            throw error;
        }
    }

    async predictMarket(marketData: MarketData[]): Promise<PredictionResult> {
        try {
            const prices = marketData.map(d => d.close);
            
            // Calculate technical indicators
            const rsi = this.calculateRSI(prices);
            const macd = this.calculateMACD(prices);
            const sma = prices.reduce((a, b) => a + b, 0) / prices.length;
            const ema = this.calculateEMA(prices, 20);
            
            // Calculate support and resistance levels
            const { support, resistance } = this.calculateSupportResistance(marketData);
            
            // Prepare data for DeepSeek R1 model
            const formattedData = marketData.map((data, index) => ({
                close_price: data.close,
                volume: data.volume,
                rsi: index > 14 ? this.calculateRSI(prices.slice(index - 14, index + 1)) : null,
                macd_line: macd.macdLine,
                timestamp: data.timestamp
            }));

            // Make prediction using DeepSeek R1
            const response = await axios.post(
                'https://api.deepseek.com/v1/predict',
                {
                    model: "deepseek-r1",
                    data: formattedData,
                    parameters: {
                        prediction_horizon: 1,
                        confidence_interval: 0.95,
                        features: ['close_price', 'volume', 'rsi', 'macd_line']
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Determine trend and risk level
            const trend = response.data.prediction > prices[prices.length - 1] 
                ? 'bullish' 
                : response.data.prediction < prices[prices.length - 1] 
                    ? 'bearish' 
                    : 'neutral';

            // Calculate mean and standard deviation manually
            const pricesSlice = prices.slice(-30);
            const mean = pricesSlice.reduce((acc, val) => acc + val, 0) / pricesSlice.length;
            const variance = pricesSlice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / pricesSlice.length;
            const volatility = Math.sqrt(variance) / mean;
            const riskLevel = volatility > 0.2 ? 'high' : volatility > 0.1 ? 'medium' : 'low';

            return {
                prediction: response.data.prediction,
                confidence: response.data.confidence,
                indicators: {
                    rsi,
                    macd,
                    sma,
                    ema
                },
                supportLevels: support,
                resistanceLevels: resistance,
                trend,
                riskLevel
            };
        } catch (error) {
            console.error('Error making prediction:', error);
            throw error;
        }
    }
}

export default MarketPredictor.getInstance();
