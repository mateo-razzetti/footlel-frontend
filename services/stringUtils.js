/**
 * FOOTLEL — String Manipulation & Formatting Utilities
 * services/stringUtils.js
 *
 * Utilidades puras para formateo de errores del backend, limpieza de nombres de usuario,
 * nombres y tokens de invitados, normalización de búsqueda y parseo de catálogos.
 */

/**
 * Limpia cualquier símbolo '@' al inicio del nombre de usuario y elimina espacios en blanco.
 * @param {any} rawName
 * @returns {string}
 */
export function cleanUsername(rawName) {
    if (rawName === null || rawName === undefined) return '';
    if (typeof rawName === 'object') {
        const candidate = rawName.user_name || rawName.username || rawName.friend_name ||
                          rawName.sender_name || rawName.challenger_name || rawName.name || '';
        return cleanUsername(candidate);
    }
    return String(rawName).trim().replace(/^@+/, '');
}

/**
 * Formatea el nombre de usuario de una sesión de invitado.
 * Convierte IDs numéricos puros a formato "Guest_12345" y descarta cadenas vacías o 'null'/'undefined'.
 * @param {any} rawName
 * @returns {string | null}
 */
export function formatGuestName(rawName) {
    if (rawName === null || rawName === undefined) return null;
    const trimmed = String(rawName).trim();
    if (!trimmed || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') {
        return null;
    }
    return /^\d+$/.test(trimmed) ? `Guest_${trimmed}` : trimmed;
}

/**
 * Extrae y formatea mensajes de error del Backend:
 * - Parsea respuestas JSON stringificadas `{ "detail": "..." }`
 * - Remueve prefijos técnicos redundantes ("error de login: ", etc.)
 * - Corrige caracteres sin ñ o sin tilde devueltos por el backend
 * - Asegura mayúscula inicial y puntuación final
 * @param {any} rawMsg
 * @returns {string}
 */
export function formatBackendError(rawMsg) {
    if (!rawMsg) return 'Ocurrió un error inesperado.';
    let msg = String(rawMsg).trim();

    if (msg.charAt(0) === '{') {
        try {
            const parsed = JSON.parse(msg);
            if (parsed && (parsed.detail || parsed.message)) {
                msg = String(parsed.detail || parsed.message).trim();
            }
        } catch (_) {}
    }

    // Quitar prefijos técnicos redundantes
    msg = msg.replace(/^error(\s+de\s+[a-záéíóúñ\s]+)?:\s*/i, '');

    // Reemplazo ortográfico de respuestas del backend
    msg = msg
        .replace(/\bcontrasenias\b/gi, 'contraseñas')
        .replace(/\bcontrasenia\b/gi, 'contraseña')
        .replace(/\binvalidos\b/gi, 'inválidos')
        .replace(/\binvalidas\b/gi, 'inválidas')
        .replace(/\binvalido\b/gi, 'inválido')
        .replace(/\binvalida\b/gi, 'inválida')
        .replace(/\bcodigos\b/gi, 'códigos')
        .replace(/\bcodigo\b/gi, 'código')
        .replace(/\busuario\s+invalido\b/gi, 'usuario inválido')
        .replace(/\bcorreo\s+electronico\b/gi, 'correo electrónico')
        .replace(/\belectronico\b/gi, 'electrónico')
        .replace(/\bnumeros\b/gi, 'números')
        .replace(/\bnumero\b/gi, 'número')
        .replace(/\btelefono\b/gi, 'teléfono')
        .replace(/\bsesion\b/gi, 'sesión')
        .replace(/\bverificacion\b/gi, 'verificación')
        .replace(/\bautenticacion\b/gi, 'autenticación')
        .replace(/\bconfiguracion\b/gi, 'configuración')
        .replace(/\binformacion\b/gi, 'información')
        .replace(/\bconexion\b/gi, 'conexión')
        .replace(/\boperacion\b/gi, 'operación')
        .replace(/\bmanana\b/gi, 'mañana')
        .replace(/\bminimo\b/gi, 'mínimo')
        .replace(/\bmaximo\b/gi, 'máximo')
        .replace(/\bexito\b/gi, 'éxito');

    if (msg.length > 0) {
        msg = msg.charAt(0).toUpperCase() + msg.slice(1);
    }
    if (msg.length > 0 && !/[.!?]$/.test(msg)) {
        msg += '.';
    }
    return msg;
}

/**
 * Normaliza un término de búsqueda eliminando tildes/diacríticos y convirtiendo a minúsculas.
 * @param {string} str
 * @returns {string}
 */
export function normalizeSearchText(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

/**
 * Parsea el contenido en texto plano o CSV del listado de jugadores y retorna un arreglo único.
 * @param {string} rawText
 * @returns {string[]}
 */
export function parsePlayerRosterText(rawText) {
    if (!rawText || typeof rawText !== 'string') return [];
    const lines = rawText.split(/\r?\n/);
    const seen = new Set();
    const result = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const firstCol = line.includes(',') ? line.split(',')[0] : line;
        const cleanName = firstCol.trim().replace(/^"|"$/g, '').trim();
        if (cleanName.length > 0 && !cleanName.toLowerCase().startsWith('player_name')) {
            if (!seen.has(cleanName)) {
                seen.add(cleanName);
                result.push(cleanName);
            }
        }
    }
    return result;
}

/**
 * Extrae el token JWT devuelto por el endpoint de inicio de sesión de invitado.
 * @param {any} guestData
 * @returns {string | null}
 */
export function extractGuestToken(guestData) {
    if (!guestData) return null;
    if (typeof guestData === 'string') {
        const s = guestData.trim();
        if (/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(s)) return s;
        return null;
    }
    if (typeof guestData === 'object') {
        const candidate =
            guestData.access_token ||
            guestData.token ||
            guestData.jwt ||
            (guestData.data && (guestData.data.access_token || guestData.data.token || guestData.data.jwt));
        if (candidate && String(candidate).trim()) {
            return String(candidate).trim();
        }
    }
    return null;
}

/**
 * Decodifica la parte `sub` o identificador de usuario a partir del token JWT.
 * @param {string} token
 * @returns {string | null}
 */
export function decodeJwtSub(token) {
    if (!token || typeof token !== 'string') return null;
    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        // Soporte tanto para navegador (atob) como Node (Buffer)
        const jsonStr = (typeof atob === 'function')
            ? atob(base64)
            : Buffer.from(base64, 'base64').toString('utf-8');
        const json = JSON.parse(jsonStr);
        return (json && (json.sub ?? json.user_id ?? json.user_name ?? json.id)) ? String(json.sub ?? json.user_id ?? json.user_name ?? json.id) : null;
    } catch (_) {
        return null;
    }
}

/**
 * Extrae el nombre o identificador de invitado de la respuesta del backend.
 * @param {any} guestData
 * @returns {string | null}
 */
export function extractGuestName(guestData) {
    if (typeof guestData === 'string' && guestData.trim()) {
        const s = guestData.trim();
        if (/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(s)) return null;
        return formatGuestName(s);
    }
    if (guestData && typeof guestData === 'object') {
        const candidate =
            guestData.user_strid ||
            guestData.guest_name ||
            guestData.user_name ||
            guestData.username ||
            guestData.user_id ||
            guestData.id ||
            (typeof guestData.result === 'string' && guestData.result.toLowerCase() !== 'success'
                ? guestData.result
                : null);
        if (candidate !== null && candidate !== undefined && String(candidate).trim()) {
            return formatGuestName(candidate);
        }
    }
    return null;
}

// Compatibilidad con entorno de navegador global
if (typeof window !== 'undefined') {
    window.FootlelStringUtils = {
        cleanUsername,
        formatGuestName,
        formatBackendError,
        normalizeSearchText,
        parsePlayerRosterText,
        extractGuestToken,
        decodeJwtSub,
        extractGuestName
    };
}
