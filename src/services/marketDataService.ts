import axios from 'axios';
import { API_CONFIG } from '../config/api';

export interface MarketData {
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface WebSocketMessage {
    data: string;
    type: 'trade' | 'ping' | 'error';
}

class MarketDataService {
    private finnhubClient;
    private ws: WebSocket | null = null;
    private subscribers: Map<string, (data: any) => void> = new Map();

    constructor() {
        this.finnhubClient = axios.create({
            baseURL: API_CONFIG.FINNHUB_URL,
            headers: {
                'X-Finnhub-Token': API_CONFIG.FINNHUB_API_KEY
            }
        });
        this.initWebSocket();
    }

    private initWebSocket() {
        this.ws = new WebSocket(`wss://ws.finnhub.io?token=${API_CONFIG.FINNHUB_API_KEY}`);

        this.ws.onopen = () => {
            console.log('🔌 WebSocket Connected');
            // Format correct selon la doc Finnhub
            const symbols = ['fxrate:OANDA:EUR_USD', 'fxrate:OANDA:GBP_USD', 'fxrate:OANDA:USD_JPY'];
            symbols.forEach(symbol => {
                const message = JSON.stringify({'type': 'subscribe', 'symbol': symbol});
                this.ws?.send(message);
                console.log(`📈 Subscribe message sent:`, message);
            });
        };

        this.ws.onmessage = (event) => {
            console.log('📊 Raw message:', event.data);
            try {
                const data = JSON.parse(event.data);
                // Format de données selon la doc Finnhub
                if (data.type === 'trade' && data.data) {
                    data.data.forEach((trade: any) => {
                        const formattedData = {
                            symbol: trade.s.replace('fxrate:OANDA:', '').replace('_', '/'),
                            price: trade.p,
                            timestamp: trade.t,
                            volume: trade.v
                        };
                        console.log('💱 Formatted trade:', formattedData);
                        this.notifySubscribers(formattedData);
                    });
                }
            } catch (error) {
                console.error('Error processing message:', error);
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        this.ws.onclose = () => {
            console.log('WebSocket Disconnected');
            setTimeout(() => this.initWebSocket(), 5000);
        };
    }

    private subscribeToSymbol(symbol: string) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'subscribe', symbol }));
            console.log(`📈 Subscribed to ${symbol}`);
        }
    }

    private unsubscribeFromSymbol(symbol: string) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
            console.log(`Unsubscribed from ${symbol}`);
        }
    }

    private notifySubscribers(data: any) {
        this.subscribers.forEach(callback => callback(data));
    }

    public subscribeToMarketData(callback: (data: any) => void): () => void {
        const id = Math.random().toString(36).substring(7);
        this.subscribers.set(id, callback);
        
        // Retourner une fonction de nettoyage
        return () => {
            this.subscribers.delete(id);
        };
    }

    async getIntraday(symbol: string, interval: string = '5min'): Promise<MarketData[]> {
        try {
            // Utiliser finnhubClient au lieu de axios.get direct
            const response = await this.finnhubClient.get('/forex/candle', {
                params: {
                    symbol: `${symbol}:FXCM`,
                    resolution: interval,
                    from: Math.floor((Date.now() - 24*60*60*1000) / 1000),
                    to: Math.floor(Date.now() / 1000)
                }
            });

            return response.data.c.map((close: number, index: number) => ({
                timestamp: new Date(response.data.t[index] * 1000).toISOString(),
                open: response.data.o[index],
                high: response.data.h[index],
                low: response.data.l[index],
                close: close,
                volume: response.data.v[index] || 0
            }));
        } catch (error) {
            console.error('Finnhub API Error:', error);
            throw error;
        }
    }

    async getDailyData(symbol: string): Promise<MarketData[]> {
        try {
            const response = await this.finnhubClient.get('/forex/candle', {
                params: {
                    symbol: `${symbol}:FXCM`,
                    resolution: 'D',
                    from: Math.floor((Date.now() - 30*24*60*60*1000) / 1000),
                    to: Math.floor(Date.now() / 1000)
                }
            });

            return response.data.c.map((close: number, index: number) => ({
                timestamp: new Date(response.data.t[index] * 1000).toISOString(),
                open: response.data.o[index],
                high: response.data.h[index],
                low: response.data.l[index],
                close: close,
                volume: response.data.v[index] || 0
            }));
        } catch (error) {
            console.error('Finnhub API Error:', error);
            throw error;
        }
    }

    async getForexRate(fromCurrency: string, toCurrency: string): Promise<number> {
        try {
            const response = await axios.get(API_CONFIG.FINNHUB_URL, {
                params: {
                    function: 'CURRENCY_EXCHANGE_RATE',
                    from_currency: fromCurrency,
                    to_currency: toCurrency,
                    apikey: API_CONFIG.FINNHUB_API_KEY
                }
            });

            return parseFloat(response.data['Realtime Currency Exchange Rate']['5. Exchange Rate']);
        } catch (error) {
            console.error('Error fetching forex rate:', error);
            throw error;
        }
    }

    async getForexCandles(symbol: string, resolution: string = '1', from: number, to: number) {
        try {
            const response = await this.finnhubClient.get('/forex/candle', {
                params: {
                    symbol,
                    resolution,
                    from,
                    to
                }
            });

            if (response.data.s !== 'ok') {
                throw new Error('Invalid data received');
            }

            return response.data;
        } catch (error) {
            console.error('Error fetching candles:', error);
            throw error;
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

export const marketDataService = new MarketDataService(); 