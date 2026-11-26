/**
 * Centralized API configuration.
 *
 * - With Vite: reads VITE_API_URL from .env.
 * - With Live Server (no Vite): import.meta.env does not exist, so the fallback is used.
 *
 * Usage (in a <script type="module">):
 *   import { API_BASE_URL } from '../../services/apiConfig.js';
 */
const rawUrl = import.meta.env?.VITE_API_URL || 'https://footlel-backend.onrender.com';

// The trailing slash is removed so `${API_BASE_URL}/path` can be concatenated without double slashes.
export const API_BASE_URL = String(rawUrl).replace(/\/+$/, '');

// Also available globally in case any classic script needs it.
if (typeof window !== 'undefined') {
    window.API_BASE_URL = API_BASE_URL;
}

export default API_BASE_URL;
