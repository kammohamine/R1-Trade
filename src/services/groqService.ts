import { Groq } from 'groq-sdk';
import { MarketData, TradingAdvice } from '../types';
import { marketDataService } from './marketDataService';

if (!import.meta.env.VITE_GROQ_API_KEY) {
    throw new Error('Clé API Groq manquante dans .env');
}

const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

class GroqService {
    public async generateTradingAdvice(symbol: string, data: MarketData[]): Promise<TradingAdvice> {
        if (data.length === 0) throw new Error('Aucune donnée de marché disponible');
        const lastCandle = data[data.length - 1];
        if (!lastCandle?.open || !lastCandle?.close) throw new Error('Dernière bougie incomplète');
        if (!lastCandle.high || !lastCandle.low || !lastCandle.volume) throw new Error('Données de bougie manquantes');
        
        const spread = await marketDataService.getCurrentRate(symbol);
        const volatility = this.calculateVolatility(data.slice(-30));
        
        const technicalAnalysis = `
            RSI(14): ${this.calculateRSI(data, 14).toFixed(2)}%
            MACD: ${this.calculateMACD(data).toFixed(5)}
            SMA(20): ${this.calculateSMA(data, 20).toFixed(5)}
            EMA(20): ${this.calculateEMA(data, 20).toFixed(5)}
            Support Levels: ${this.findSupportLevels(data).join(' | ')}
            Resistance Levels: ${this.findResistanceLevels(data).join(' | ')}
        `;

        const prompt = `[MetaApi Data Integration]
        En tant qu'analyste trading expert avec accès aux données temps réel de MetaApi, analysez ${symbol}.

        Dernière bougie:
        - Ouverture: ${lastCandle.open.toFixed(5)}
        - Haut: ${lastCandle.high.toFixed(5)}
        - Bas: ${lastCandle.low.toFixed(5)}
        - Clôture: ${lastCandle.close.toFixed(5)}
        - Volume: ${lastCandle.volume}
        
        Analyse technique:
        ${technicalAnalysis}
        
        Contexte marché:
        - Spread actuel: ${spread.toFixed(5)}
        - Volatilité (30 périodes): ${volatility.toFixed(2)}%
        
        Fournissez une recommandation structurée en JSON avec: symbol, recommendation, entry_price, stop_loss, 
        take_profit, analysis, confidence_score, risk_reward_ratio, support_levels[], resistance_levels[]`;

        try {
            const response = await groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'mixtral-8x7b-32768',
                response_format: { type: 'json_object' }
            });

            if (!response.choices[0].message.content) {
                throw new Error('Réponse Groq invalide');
            }

            return this.parseGroqResponse(JSON.parse(response.choices[0].message.content));
        } catch (error) {
            console.error('Erreur analyse Groq:', error);
            throw error;
        }
    }

    private parseGroqResponse(data: any): TradingAdvice {
        return {
            pair: data.symbol,
            direction: data.recommendation,
            entryPrice: data.entry_price,
            stopLoss: data.stop_loss,
            takeProfit: data.take_profit,
            reasoning: data.analysis,
            confidence: data.confidence_score,
            timeframe: data.timeframe,
            riskReward: data.risk_reward_ratio,
            key_levels: {
                support: data.support_levels,
                resistance: data.resistance_levels
            },
            metaapiInfo: {
                spread: data.spread,
                executionSpeed: data.execution_speed
            }
        };
    }

    private calculateVolatility(data: MarketData[]): number {
        const closes = data.map(c => c.close);
        const mean = closes.reduce((a, b) => a + b, 0) / closes.length;
        const variance = closes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / closes.length;
        return Math.sqrt(variance) / mean;
    }

    private calculateRSI(data: MarketData[], period: number): number {
        if (data.length < period) return 50; // Valeur neutre si pas assez de données
        let gains = 0;
        let losses = 0;
        
        for (let i = 1; i < period; i++) {
            if (!data[i] || !data[i-1]) continue; // Skip les données manquantes
            const diff = data[i].close - data[i-1].close;
            if (diff > 0) gains += diff;
            else losses -= diff;
        }
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        return avgLoss === 0 ? 100 : 100 - (100 / (1 + (avgGain / avgLoss)));
    }

    private calculateMACD(data: MarketData[]): number {
        const ema12 = this.calculateEMA(data, 12);
        const ema26 = this.calculateEMA(data, 26);
        return ema12 - ema26;
    }

    private calculateSMA(data: MarketData[], period: number): number {
        const slice = data.slice(-period);
        return slice.reduce((a, b) => a + b.close, 0) / period;
    }

    private calculateEMA(data: MarketData[], period: number): number {
        if (data.length < period) return data[data.length - 1]?.close || 0;
        const k = 2 / (period + 1);
        let ema = this.calculateSMA(data.slice(0, period), period);
        
        for (let i = period; i < data.length; i++) {
            if (!data[i]?.close) continue;
            ema = data[i].close * k + ema * (1 - k);
        }
        return ema;
    }

    private findSupportLevels(data: MarketData[]): number[] {
        return data
            .filter((c, i) => 
                i > 0 && 
                i + 1 < data.length && 
                c.low !== undefined && 
                data[i-1].low !== undefined && 
                data[i+1].low !== undefined && 
                c.low < data[i-1].low && 
                c.low < data[i+1].low
            )
            .map(c => c.low)
            .filter((low): low is number => low !== undefined)
            .slice(-3);
    }

    private findResistanceLevels(data: MarketData[]): number[] {
        return data
            .filter((c, i) => 
                i > 0 && 
                i + 1 < data.length && 
                c.high !== undefined && 
                data[i-1].high !== undefined && 
                data[i+1].high !== undefined && 
                c.high > data[i-1].high && 
                c.high > data[i+1].high
            )
            .map(c => c.high)
            .filter((high): high is number => high !== undefined)
            .slice(-3);
    }
}

export const groqService = new GroqService();