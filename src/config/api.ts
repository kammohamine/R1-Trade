export const API_CONFIG = {
    FINNHUB_API_KEY: 'cucom2hr01qri16ocvhgcucom2hr01qri16ocvi0',
    FINNHUB_URL: 'https://finnhub.io/api/v1'
};

// Ajout d'une fonction de vérification
export const validateApiConfig = () => {
    if (!API_CONFIG.FINNHUB_API_KEY) {
        throw new Error('Finnhub API key is not configured');
    }
    return true;
}; 