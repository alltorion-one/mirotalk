const axios = require('axios');
const config = require('./config');

// DeepL API configuration
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

/**
 * Translate text using DeepL API
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (ISO 639-1)
 * @param {string} sourceLang - Source language code (ISO 639-1), optional
 * @returns {Promise<string>} Translated text
 */
async function translateText(text, targetLang, sourceLang = null) {
    if (!DEEPL_API_KEY) {
        console.warn('DeepL API key not configured. Translation disabled.');
        return null;
    }

    try {
        const params = {
            auth_key: DEEPL_API_KEY,
            text: text,
            target_lang: targetLang.toUpperCase(),
        };

        // Add source language if specified
        if (sourceLang) {
            params.source_lang = sourceLang.toUpperCase();
        }

        const response = await axios.post(DEEPL_API_URL, null, { params });
        
        if (response.data && response.data.translations && response.data.translations.length > 0) {
            return response.data.translations[0].text;
        }
        
        return null;
    } catch (error) {
        console.error('Translation error:', error.message);
        return null;
    }
}

module.exports = {
    translateText
}; 