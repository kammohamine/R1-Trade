export const API_CONFIG = {
    META_API: {
        TOKEN: import.meta.env.VITE_META_API_TOKEN,
        ACCOUNT_ID: import.meta.env.VITE_META_API_ACCOUNT_ID
    },
    GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY
};

// Ajout d'une fonction de vérification
export const validateApiConfig = () => {
    if (!API_CONFIG.META_API.TOKEN || !API_CONFIG.META_API.ACCOUNT_ID) {
        throw new Error('Configuration MetaApi incomplète');
    }
    if (!API_CONFIG.GROQ_API_KEY) {
        throw new Error('Groq API key is not configured');
    }
    return true;
}; 