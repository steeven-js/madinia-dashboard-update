/**
 * Utility to handle Firebase Storage image URLs and prevent CORS issues
 */

// The base URL of our proxy server
// En production, cette valeur sera remplacée par l'URL du proxy déployé
// définie dans le fichier .env (VITE_PROXY_BASE_URL)
const PROXY_BASE_URL = import.meta.env.VITE_PROXY_BASE_URL || 'http://localhost:3031';

/**
 * Transforms a Firebase Storage URL to use the proxy service
 * @param {string} url - Original Firebase Storage URL
 * @returns {string} Proxied URL
 */
export const getProxiedImageUrl = (url) => {
    if (!url) return '';

    // Check if the URL is a Firebase Storage URL that might have CORS issues
    return url.includes('firebasestorage.googleapis.com')
        ? `${PROXY_BASE_URL}/storage-proxy?url=${encodeURIComponent(url)}`
        : url;
};

/**
 * Creates a new Image object with the proxied URL to avoid CORS issues
 * @param {string} url - Original image URL
 * @returns {HTMLImageElement} Image element with proxied source
 */
export const createProxiedImage = (url) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = getProxiedImageUrl(url);
    return img;
};
