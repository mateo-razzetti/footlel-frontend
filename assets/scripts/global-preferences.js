/**
 * FOOTLEL — Global Preferences
 * assets/scripts/global-preferences.js
 *
 * Single source of truth for theme + animations on ALL pages.
 *
 * localStorage keys (read AND written with exactly these names):
 *   - 'footlel_theme'            : 'dark' (default) | 'light'
 *   - 'pref_toggle-animaciones'  : 'true' | 'false' (default)
 *
 * Exposes window.FootlelPrefs.{applyTheme, applyAnimations} so that
 * configuracion.html uses the very same code path as every other page.
 *
 * Usage: <script src="../../assets/scripts/global-preferences.js"></script>
 */
(function applyGlobalPreferences() {
    'use strict';

    var THEME_KEY = 'footlel_theme';
    var ANIM_KEY  = 'pref_toggle-animaciones';

    /* ── Logo paths ──────────────────────────────────────────────
       Resolved relative to THIS script (assets/scripts/), not to the
       page, so they are valid from any page depth and always point to
       the real files in assets/images/. */
    var scriptSrc = (document.currentScript && document.currentScript.src) || '';
    function imageUrl(name) {
        try { return new URL('../images/' + name, scriptSrc).href; }
        catch (e) { return '../../assets/images/' + name; }
    }
    var LOGO_DARK  = imageUrl('logo-oscuro.png');
    var LOGO_LIGHT = imageUrl('logo-claro.png');

    function readStorage(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }

    function isLightStored() { return readStorage(THEME_KEY) === 'light'; }
    function isAnimDisabledStored() { return readStorage(ANIM_KEY) === 'true'; }

    function syncLogo(light) {
        var logo = document.getElementById('main-logo');
        if (!logo) return;
        var target = light ? LOGO_LIGHT : LOGO_DARK;
        if (logo.src !== target) logo.src = target;
    }

    /* Applies a theme to <html> and <body> (if it already exists) + logo. */
    function applyTheme(isLight) {
        document.documentElement.classList.toggle('light-mode', isLight);
        if (document.body) {
            document.body.classList.toggle('light-mode', isLight);
            syncLogo(isLight);
        }
    }

    function applyAnimations(disabled) {
        document.documentElement.classList.toggle('disable-animations', disabled);
        if (document.body) {
            document.body.classList.toggle('disable-animations', disabled);
        }
    }

    /* Re-reads localStorage and applies everything. */
    function applyFromStorage() {
        applyTheme(isLightStored());
        applyAnimations(isAnimDisabledStored());
    }

    function getApiBaseUrl() {
        return String(window.API_BASE_URL || 'https://footlel-backend.onrender.com').replace(/\/+$/, '');
    }

    function isGuestSession() {
        return readStorage('footlel_guest') === 'true';
    }

    function readCompatStored() {
        return readStorage('pref_toggle-compat') === 'true';
    }

    /* GET /config/get-user-config (registered users with token). */
    function fetchUserConfig() {
        var token = readStorage('footlel_token');
        if (!token || isGuestSession()) return Promise.resolve(null);
        return fetch(getApiBaseUrl() + '/config/get-user-config', {
            headers: { 'Authorization': 'Bearer ' + token }
        }).then(function (r) { return r.ok ? r.json() : null; })
          .catch(function () { return null; });
    }

    /* PATCH /config/set-user-config, always sends the full object with the 3 states. */
    function saveUserConfig(darkModeState, animationState, compatibilityState) {
        var token = readStorage('footlel_token');
        if (!token || isGuestSession()) return Promise.resolve(null);
        return fetch(getApiBaseUrl() + '/config/set-user-config', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                dark_mode: Boolean(darkModeState),
                animation_state: Boolean(animationState),
                compatibility_mode: Boolean(compatibilityState)
            })
        });
    }

    /* Current states from localStorage, with one override applied. */
    function saveCurrentConfig(overrides) {
        var o = overrides || {};
        var dark = ('dark' in o) ? o.dark : !isLightStored();
        var anim = ('anim' in o) ? o.anim : isAnimDisabledStored();
        var compat = ('compat' in o) ? o.compat : readCompatStored();
        return saveUserConfig(dark, anim, compat);
    }

    /* Pulls the backend config into localStorage and applies it. */
    function syncConfigFromBackend() {
        return fetchUserConfig().then(function (cfg) {
            if (!cfg) return null;
            try {
                if (typeof cfg.dark_mode === 'boolean') localStorage.setItem(THEME_KEY, cfg.dark_mode ? 'dark' : 'light');
                if (typeof cfg.animation_state === 'boolean') localStorage.setItem(ANIM_KEY, String(cfg.animation_state));
                if (typeof cfg.compatibility_mode === 'boolean') localStorage.setItem('pref_toggle-compat', String(cfg.compatibility_mode));
            } catch (e) {}
            applyFromStorage();
            return cfg;
        });
    }

    function bindSessionCleanup() {
        var logoutSelectors = '#ddSessionAction, #btn-logout, a.item-danger[href*="login.html"], .link-guest';
        document.querySelectorAll(logoutSelectors).forEach(function (el) {
            el.addEventListener('click', function () {
                try { localStorage.removeItem('footlel_token'); } catch (e) {}
            });
        });
    }

    window.FootlelPrefs = {
        applyTheme: applyTheme,
        applyAnimations: applyAnimations,
        applyFromStorage: applyFromStorage,
        fetchUserConfig: fetchUserConfig,
        saveUserConfig: saveUserConfig,
        saveCurrentConfig: saveCurrentConfig,
        syncConfigFromBackend: syncConfigFromBackend,
        setDarkModeState: function (state) { return saveCurrentConfig({ dark: state }); },
        setAnimationState: function (state) { return saveCurrentConfig({ anim: state }); },
        setCompatibilityState: function (state) { return saveCurrentConfig({ compat: state }); }
    };

    /* Immediately (<html> always exists, avoids flash of wrong theme). */
    applyFromStorage();

    /* Once <body> exists. */
    document.addEventListener('DOMContentLoaded', function () {
        applyFromStorage();
        bindSessionCleanup();
    });

    /* Back/forward cache restores pages without re-running scripts. */
    window.addEventListener('pageshow', applyFromStorage);

    /* Changes made in another tab. */
    window.addEventListener('storage', function (e) {
        if (e.key === THEME_KEY || e.key === ANIM_KEY || e.key === null) applyFromStorage();
    });
})();