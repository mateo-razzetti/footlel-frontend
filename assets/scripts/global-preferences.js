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

    function patchUserStatState(endpointPath, state) {
        var token = readStorage('footlel_token');
        if (!token) return Promise.resolve(null);
        return fetch(getApiBaseUrl() + endpointPath, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ boolean: Boolean(state) })
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
        setDarkModeState: function (state) { return patchUserStatState('/stat/set-user-dark-mode-state', state); },
        setAnimationState: function (state) { return patchUserStatState('/stat/set-user-animation-state', state); },
        setCompatibilityState: function (state) { return patchUserStatState('/stat/set-user-compatibility-state', state); }
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