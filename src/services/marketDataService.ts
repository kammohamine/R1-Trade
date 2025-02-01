import MetaApi from 'metaapi.cloud-sdk';
import { API_CONFIG } from '../config/api';
import { MarketData } from '../types';

const metaApi = new MetaApi(API_CONFIG.META_API_TOKEN);

class MarketDataService {
    private account: any;
    private subscribers: Map<string, (data: any) => void> = new Map();
    private connectionStatus = false;

    async connect(accountId: string) {
        try {
            this.account = await metaApi.metatraderAccountApi.getAccount(accountId);
            await this.account.waitConnected();
            await this.account.waitSynchronized();
            
            const connection = this.account.getStreamingConnection();
            await connection.connect();
            
            connection.on('price', (price: any) => {
                this.processMarketData({
                    symbol: price.symbol,
                    bid: price.bid,
                    ask: price.ask,
                    time: new Date(price.time).toISOString()
                });
            });
            
            this.connectionStatus = true;
            console.log('✅ Connected to MetaApi');
        } catch (error) {
            console.error('MetaApi connection failed:', error);
            throw error;
        }
    }

    private processMarketData(price: any) {
        this.notifySubscribers({
            symbol: price.symbol,
            price: price.ask,
            timestamp: price.time
        });
    }

    async getForexCandles(symbol: string, timeframe: string): Promise<MarketData[]> {
        const validTimeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];
        if (!validTimeframes.includes(timeframe.toLowerCase())) {
            throw new Error(`Timeframe ${timeframe} non supporté par MetaApi`);
        }
        const candles = await this.account.getHistoricalCandles(symbol, timeframe);
        return candles.map((c: any) => ({
            timestamp: new Date(c.time).toISOString(),
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
            volume: c.volume
        }));
    }

    async getCurrentRate(symbol: string): Promise<number> {
        const prices = await this.account.getBidAsk(symbol);
        return prices.ask;
    }

    private notifySubscribers(data: any) {
        this.subscribers.forEach(callback => callback(data));
    }

    public subscribeToMarketData(callback: (data: any) => void): () => void {
        const id = Math.random().toString(36).substr(2, 9);
        this.subscribers.set(id, callback);
        return () => this.subscribers.delete(id);
    }

    public getConnectionStatus(): boolean {
        return this.connectionStatus;
    }

    public disconnect() {
        if (this.account) {
            this.account.unsubscribe();
            this.connectionStatus = false;
            console.log('Disconnected from MetaApi');
        }
    }
}

export const marketDataService = new MarketDataService(); 