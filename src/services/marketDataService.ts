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

class MarketDataService {
    private finnhubClient;
    private validSymbols: string[] = [];

    constructor() {
        this.finnhubClient = axios.create({
            baseURL: API_CONFIG.FINNHUB_URL,
            headers: {
                'X-Finnhub-Token': API_CONFIG.FINNHUB_API_KEY
            }
        });
        this.initValidSymbols();
    }

    private async initValidSymbols() {
        try {
            console.log('🔄 Initializing Forex symbols...');
            const response = await this.finnhubClient.get('/forex/symbol');
            this.validSymbols = response.data.map((item: any) => item.symbol);
            console.log('✅ Available Forex symbols:', this.validSymbols);
        } catch (error) {
            console.error('❌ Error fetching symbols:', {
                error,
                status: axios.isAxiosError(error) ? error.response?.status : 'unknown'
            });
        }
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

    async getCurrentRate(fromSymbol: string, toSymbol: string): Promise<number> {
        try {
            console.log(`🔄 Getting rate for ${fromSymbol}/${toSymbol}`);
            
            if (this.validSymbols.length === 0) {
                console.log('⚠️ No symbols loaded, initializing...');
                await this.initValidSymbols();
            }

            const possibleSymbols = [
                `${fromSymbol}${toSymbol}:FXCM`,
                `${fromSymbol}${toSymbol}:OANDA`
            ];
            
            console.log('🔍 Checking possible symbols:', possibleSymbols);
            console.log('📋 Against valid symbols:', this.validSymbols);

            const validSymbol = possibleSymbols.find(s => this.validSymbols.includes(s));
            
            if (!validSymbol) {
                throw new Error(`❌ No valid symbol found for ${fromSymbol}/${toSymbol}`);
            }

            console.log(`✅ Using symbol: ${validSymbol}`);

            const now = Math.floor(Date.now() / 1000);
            const fiveMinutesAgo = now - 5 * 60;

            console.log(`📊 Fetching data from ${new Date(fiveMinutesAgo * 1000)} to ${new Date(now * 1000)}`);

            const response = await this.finnhubClient.get('/forex/candle', {
                params: {
                    symbol: validSymbol,
                    resolution: '1',
                    from: fiveMinutesAgo,
                    to: now
                }
            });

            console.log('📡 API Response:', response.data);

            if (!response.data || response.data.s === 'no_data') {
                throw new Error(`❌ No data available for ${validSymbol}`);
            }

            const rate = response.data.c[response.data.c.length - 1];
            console.log(`💱 Latest rate for ${validSymbol}: ${rate}`);
            
            return rate;
        } catch (error) {
            console.error('❌ Error details:', {
                error,
                message: error instanceof Error ? error.message : 'Unknown error',
                validSymbols: this.validSymbols,
                status: axios.isAxiosError(error) ? error.response?.status : 'unknown'
            });
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
}

export const marketDataService = new MarketDataService(); 