// Types
export interface MarketTrend {
    trend: 'bullish' | 'bearish' | 'neutral';
    value: number;
    confidence: number;
}

export interface RiskLevel {
    level: 'high' | 'medium' | 'low';
    value: number;
}

// Helpers pour les couleurs et styles
export const getTrendColor = (trend: string): string => {
    switch (trend) {
        case 'bullish': return 'text-green-400';
        case 'bearish': return 'text-red-400';
        default: return 'text-gray-400';
    }
};

// Au lieu de retourner directement le composant JSX, retournons la couleur
export const getRiskColor = (risk: string): string => {
    switch (risk) {
        case 'high': return 'text-red-400';
        case 'medium': return 'text-yellow-400';
        default: return 'text-green-400';
    }
};

// Formatage des données
export const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
};

export const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
};

// Helpers pour les indicateurs techniques
export const getIndicatorColor = (value: number, type: 'rsi' | 'macd'): string => {
    if (type === 'rsi') {
        return value > 70 ? 'text-red-400' : 
               value < 30 ? 'text-green-400' : 
               'text-gray-400';
    }
    return value > 0 ? 'text-green-400' : 'text-red-400';
};

// Classes Tailwind communes
export const cardClasses = {
    container: "bg-gray-800 rounded-lg shadow-md border border-gray-700 p-6",
    header: "text-lg font-semibold text-gray-100 mb-4",
    subheader: "text-sm text-gray-400",
    value: "text-2xl font-bold text-gray-100",
    indicator: {
        container: "flex justify-between items-center",
        label: "text-gray-400",
        value: "font-medium"
    }
}; 