/**
 * FOOTLEL — Preferences & Match State Utilities
 * services/preferencesUtils.js
 *
 * Utilidades puras para preferencias de usuario (tema, animaciones, compatibilidad),
 * avatares robot, invitaciones multijugador y estado de partida online.
 */

import { cleanUsername } from './stringUtils.js';

export const THEME_KEY = 'footlel_theme';
export const ANIM_KEY  = 'pref_toggle-animaciones';
export const COMPAT_KEY = 'pref_toggle-compat';

export const BASE_ROBOT_AVATARS = [
    'https://api.dicebear.com/8.x/bottts/svg?seed=footlel-1&backgroundColor=292929',
    'https://api.dicebear.com/8.x/bottts/svg?seed=footlel-2&backgroundColor=292929',
    'https://api.dicebear.com/8.x/bottts/svg?seed=footlel-3&backgroundColor=292929',
    'https://api.dicebear.com/8.x/bottts/svg?seed=footlel-4&backgroundColor=292929',
    'https://api.dicebear.com/8.x/bottts/svg?seed=footlel-5&backgroundColor=292929',
    'https://api.dicebear.com/8.x/bottts/svg?seed=footlel-6&backgroundColor=292929'
];

/**
 * Elige uno de los 6 avatares robot de forma determinística (si se provee rng) o aleatoria.
 * @param {() => number} [rng] Función que retorna número entre 0 y 1 (por defecto Math.random)
 * @returns {string} URL del avatar SVG
 */
export function pickRandomRobotAvatar(rng = Math.random) {
    const idx = Math.floor(rng() * BASE_ROBOT_AVATARS.length);
    const safeIdx = Math.max(0, Math.min(BASE_ROBOT_AVATARS.length - 1, idx));
    return BASE_ROBOT_AVATARS[safeIdx];
}

/**
 * Resuelve el identificador numérico de partida (game_id) a partir de respuestas heterogéneas.
 * @param {any} data
 * @returns {number | null}
 */
export function extractGameId(data) {
    if (!data || typeof data !== 'object') return null;
    let raw = data.game_id;
    if ((raw === undefined || raw === null) && data.data && typeof data.data === 'object') {
        raw = data.data.game_id;
    }
    if (raw === undefined || raw === null) {
        raw = data.id;
    }
    const n = Number(raw);
    return (raw !== undefined && raw !== null && raw !== '' && isFinite(n) && n > 0) ? n : null;
}

/**
 * Determina si la partida multijugador ha comenzado y contiene los datos requeridos del tablero.
 * @param {any} data
 * @returns {boolean}
 */
export function isMatchStarted(data) {
    if (!data || typeof data !== 'object') return false;

    const rawStarted = data.match_started !== undefined ? data.match_started : (data.data && data.data.match_started);
    let isStarted = (rawStarted === true || rawStarted === 'true' || rawStarted === 1 || rawStarted === '1');

    if (!isStarted) {
        const alt = data.game_started || data.started || (data.data && (data.data.game_started || data.data.started));
        if (alt === true || alt === 'true' || alt === 1 || alt === '1') isStarted = true;
    }

    const gid = extractGameId(data);
    if (gid !== null && gid > 0 && rawStarted !== false && rawStarted !== 'false') {
        isStarted = true;
    }

    if (!isStarted) return false;

    // Verificar que los datos del tablero o cabeceras hayan arribado
    const b = (data && data.board) || (data && data.data && data.data.board);
    if (Array.isArray(b) && b.length >= 2 && Array.isArray(b[0]) && b[0].length >= 3) {
        return true;
    }
    if (data.row_headers || (data.data && data.data.row_headers)) {
        return true;
    }

    return false;
}

/**
 * Extrae y deduplica la lista de nombres de usuario que enviaron invitaciones de partida o amistad.
 * @param {any} data
 * @returns {string[]}
 */
export function parseMatchRequestNames(data) {
    if (!data) return [];
    let list = null;

    if (Array.isArray(data)) {
        list = data;
    } else if (typeof data === 'object') {
        const keys = ['match_request_names', 'friend_request_names', 'match_requests', 'match_invitations', 'requests'];
        for (let i = 0; i < keys.length; i++) {
            if (Array.isArray(data[keys[i]])) {
                list = data[keys[i]];
                break;
            }
        }
        if (!list && data.data && typeof data.data === 'object') {
            return parseMatchRequestNames(data.data);
        }
    }

    if (!list) return [];

    const seen = Object.create(null);
    const names = [];

    list.forEach(entry => {
        let rawName = entry;
        if (entry && typeof entry === 'object') {
            rawName = entry.user_name || entry.username || entry.friend_name ||
                      entry.sender_name || entry.challenger_name || entry.name || '';
        }
        const clean = cleanUsername(rawName);
        if (clean && !seen[clean.toLowerCase()]) {
            seen[clean.toLowerCase()] = true;
            names.push(clean);
        }
    });

    return names;
}

/**
 * Resuelve el estado del tema claro/oscuro.
 * @param {string | null} storedValue
 * @returns {{ isLight: boolean, themeClass: string }}
 */
export function resolveThemeState(storedValue) {
    const isLight = storedValue === 'light';
    return {
        isLight,
        themeClass: isLight ? 'light-mode' : 'dark-mode'
    };
}

/**
 * Resuelve si las animaciones están deshabilitadas.
 * @param {string | null} storedValue
 * @returns {{ animationsDisabled: boolean, animClass: string }}
 */
export function resolveAnimationState(storedValue) {
    const animationsDisabled = storedValue === 'true';
    return {
        animationsDisabled,
        animClass: animationsDisabled ? 'disable-animations' : ''
    };
}

/**
 * Resuelve si el Modo Compatibilidad (RNF7) está activo.
 * @param {string | null} storedValue
 * @returns {{ compatibilityEnabled: boolean, compatClass: string }}
 */
export function resolveCompatibilityState(storedValue) {
    const compatibilityEnabled = storedValue === 'true';
    return {
        compatibilityEnabled,
        compatClass: compatibilityEnabled ? 'compatibility-mode' : ''
    };
}

export const RANK_SHIELD_SVGS = {
    wood: '<svg class="rank-shield-svg rank-shield--wood" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 2L4 5.5v6.1C4 16.9 7.4 21.6 12 23c4.6-1.4 8-6.1 8-11.4V5.5L12 2z" fill="#8D5B4C" stroke="#5D3A2E" stroke-width="1.6"/></svg>',
    iron: '<svg class="rank-shield-svg rank-shield--iron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 2L3.8 5.2v6.4C3.8 17 7.3 21.7 12 23c4.7-1.3 8.2-6 8.2-11.4V5.2L12 2z" fill="#78909C" stroke="#37474F" stroke-width="1.6"/></svg>',
    bronze: '<svg class="rank-shield-svg rank-shield--bronze" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 2L4 5.3v6.3C4 16.9 7.4 21.6 12 23c4.6-1.4 8-6.1 8-11.4V5.3L12 2z" fill="#CD7F32" stroke="#7A4414" stroke-width="1.6"/></svg>',
    silver: '<svg class="rank-shield-svg rank-shield--silver" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 1.8L3.5 5.2v6.4c0 5.5 3.6 10.3 8.5 11.6 4.9-1.3 8.5-6.1 8.5-11.6V5.2L12 1.8z" fill="#E0E0E0" stroke="#757575" stroke-width="1.6"/></svg>',
    gold: '<svg class="rank-shield-svg rank-shield--gold" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 1.6L3.4 5v6.6c0 5.6 3.7 10.4 8.6 11.8 4.9-1.4 8.6-6.2 8.6-11.8V5L12 1.6z" fill="#FFD700" stroke="#B8860B" stroke-width="1.6"/></svg>',
    diamond: '<svg class="rank-shield-svg rank-shield--diamond" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 1.5L3.2 5v6.6c0 5.7 3.8 10.5 8.8 11.9 5-1.4 8.8-6.2 8.8-11.9V5L12 1.5z" fill="#00E5FF" stroke="#00838F" stroke-width="1.6"/></svg>'
};

/**
 * Calcula la información del rango del jugador según sus puntos totales e idioma.
 * Escala:
 *   0-299    : Madera / Wood    (#8D5B4C) -> III, II, I
 *   300-599  : Hierro / Iron    (#78909C) -> III, II, I
 *   600-899  : Bronce / Bronze  (#CD7F32) -> III, II, I
 *   900-1199 : Plata / Silver   (#E0E0E0) -> III, II, I
 *   1200-1499: Oro / Gold       (#FFD700) -> III, II, I
 *   1500+    : Diamante / Diamond (#00E5FF)
 * @param {number} points
 * @param {boolean} [isEnglish=false]
 */
export function getRankInfo(points, isEnglish = false) {
    const eng = Boolean(isEnglish);
    const num = Number(points);
    const pts = (!isFinite(num) || num < 0) ? 0 : Math.floor(num);

    const tiers = [
        { key: 'wood',    es: 'Madera',   en: 'Wood',    color: '#8D5B4C' },
        { key: 'iron',    es: 'Hierro',   en: 'Iron',    color: '#78909C' },
        { key: 'bronze',  es: 'Bronce',   en: 'Bronze',  color: '#CD7F32' },
        { key: 'silver',  es: 'Plata',    en: 'Silver',  color: '#E0E0E0' },
        { key: 'gold',    es: 'Oro',      en: 'Gold',    color: '#FFD700' },
        { key: 'diamond', es: 'Diamante', en: 'Diamond', color: '#00E5FF' }
    ];

    let tier;
    let division = null;

    if (pts >= 1500) {
        tier = tiers[5];
        division = null;
    } else {
        const tierIndex = Math.min(4, Math.floor(pts / 300));
        tier = tiers[tierIndex];
        const rem = pts % 300;
        if (rem < 100) {
            division = 'III';
        } else if (rem < 200) {
            division = 'II';
        } else {
            division = 'I';
        }
    }

    const nameEs = division ? `${tier.es} ${division}` : tier.es;
    const nameEn = division ? `${tier.en} ${division}` : tier.en;
    const rankName = eng ? nameEn : nameEs;
    const svgMarkup = RANK_SHIELD_SVGS[tier.key];

    return {
        points: pts,
        key: tier.key,
        tier: tier.key,
        material: eng ? tier.en : tier.es,
        materialEs: tier.es,
        materialEn: tier.en,
        division,
        name: rankName,
        label: rankName,
        nameEs,
        nameEn,
        color: tier.color,
        svg: svgMarkup,
        shieldSvg: svgMarkup
    };
}

/**
 * Asigna o recupera un avatar válido para el usuario o invitado utilizando una interfaz de almacenamiento.
 * @param {string} username
 * @param {boolean} isGuest
 * @param {{ getItem: (k: string) => string | null, setItem: (k: string, v: string) => void }} [storage]
 * @returns {string} URL del avatar
 */
export function getOrAssignAvatar(username, isGuest, storage) {
    const store = (storage !== undefined) ? storage : (typeof localStorage !== 'undefined' ? localStorage : null);
    if (!store) return BASE_ROBOT_AVATARS[0];

    const cleanUser = cleanUsername(username || store.getItem('footlel_username') || '');

    if (isGuest) {
        let guestAv = store.getItem('footlel_guest_avatar') || store.getItem('footlel_avatar');
        if (!guestAv || guestAv.includes('avatar-default.png') || guestAv.startsWith('data:image/svg+xml')) {
            guestAv = pickRandomRobotAvatar();
            store.setItem('footlel_guest_avatar', guestAv);
            store.setItem('footlel_avatar', guestAv);
        }
        return guestAv;
    }

    const userKey = cleanUser ? (`footlel_avatar_${cleanUser}`) : null;
    let savedAv = (userKey && store.getItem(userKey)) || store.getItem('footlel_avatar');

    if (!savedAv || savedAv.includes('avatar-default.png') || savedAv.includes('seed=footlel-default')) {
        savedAv = pickRandomRobotAvatar();
        if (userKey) store.setItem(userKey, savedAv);
        store.setItem('footlel_avatar', savedAv);
    } else if (userKey && !store.getItem(userKey)) {
        store.setItem(userKey, savedAv);
    }

    return savedAv;
}

// Compatibilidad con entorno de navegador global
if (typeof window !== 'undefined') {
    window.FootlelPreferencesUtils = {
        THEME_KEY,
        ANIM_KEY,
        COMPAT_KEY,
        BASE_ROBOT_AVATARS,
        pickRandomRobotAvatar,
        extractGameId,
        isMatchStarted,
        parseMatchRequestNames,
        resolveThemeState,
        resolveAnimationState,
        resolveCompatibilityState,
        getRankInfo,
        getOrAssignAvatar
    };
}
