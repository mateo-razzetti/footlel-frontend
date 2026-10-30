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
        // Call fetchUserConfig() which performs GET /config/get-user-config with Bearer token
        return fetchUserConfig().then(function (cfg) {
            // If no config returned (guest or network error), exit gracefully
            if (!cfg) return null;
            try {
                // Save dark_mode boolean from backend as 'dark' or 'light' in localStorage
                if (typeof cfg.dark_mode === 'boolean') localStorage.setItem(THEME_KEY, cfg.dark_mode ? 'dark' : 'light');
                // Save animation_state boolean from backend as string in localStorage
                if (typeof cfg.animation_state === 'boolean') localStorage.setItem(ANIM_KEY, String(cfg.animation_state));
                // Save compatibility_mode boolean from backend as string in localStorage
                if (typeof cfg.compatibility_mode === 'boolean') localStorage.setItem('pref_toggle-compat', String(cfg.compatibility_mode));
            } catch (e) {}
            // Re-apply CSS classes (.light-mode, .disable-animations) and logo from updated localStorage
            applyFromStorage();
            // Return the configuration object for any caller awaiting it
            return cfg;
        });
    }

    /* Helper to strip leading '@' symbols from any username string */
    function cleanUsername(rawName) {
        // Convert to string, trim spaces, and remove one or more leading '@' characters via regex
        return String(rawName || '').trim().replace(/^@+/, '');
    }

    /* ── 6 Avatares Robot Base (mismos de editar-cuenta.html) ── */
    var BASE_ROBOT_AVATARS = [
        'https://api.dicebear.com/8.x/bottts/svg?seed=footlel-1&backgroundColor=292929',
        'https://api.dicebear.com/8.x/bottts/svg?seed=footlel-2&backgroundColor=292929',
        'https://api.dicebear.com/8.x/bottts/svg?seed=footlel-3&backgroundColor=292929',
        'https://api.dicebear.com/8.x/bottts/svg?seed=footlel-4&backgroundColor=292929',
        'https://api.dicebear.com/8.x/bottts/svg?seed=footlel-5&backgroundColor=292929',
        'https://api.dicebear.com/8.x/bottts/svg?seed=footlel-6&backgroundColor=292929'
    ];

    /* Elige uno de los 6 robots al azar */
    function pickRandomRobotAvatar() {
        return BASE_ROBOT_AVATARS[Math.floor(Math.random() * 6)];
    }

    /* Obtiene el avatar guardado del usuario o invitado, o le asigna un robot aleatorio si no tiene */
    function getOrAssignAvatar(username, isGuest) {
        var guestFlag = (typeof isGuest === 'boolean') ? isGuest : isGuestSession();
        var cleanUser = cleanUsername(username || readStorage('footlel_username') || '');
        if (guestFlag) {
            var guestAv = readStorage('footlel_guest_avatar') || readStorage('footlel_avatar');
            if (!guestAv || guestAv.indexOf('avatar-default.png') !== -1 || guestAv.indexOf('data:image/svg+xml') === 0) {
                guestAv = pickRandomRobotAvatar();
                try {
                    localStorage.setItem('footlel_guest_avatar', guestAv);
                    localStorage.setItem('footlel_avatar', guestAv);
                } catch (e) {}
            }
            return guestAv;
        }
        var userKey = cleanUser ? ('footlel_avatar_' + cleanUser) : null;
        var savedAv = (userKey && readStorage(userKey)) || readStorage('footlel_avatar');
        if (!savedAv || savedAv.indexOf('avatar-default.png') !== -1 || savedAv.indexOf('seed=footlel-default') !== -1) {
            savedAv = pickRandomRobotAvatar();
            try {
                if (userKey) localStorage.setItem(userKey, savedAv);
                localStorage.setItem('footlel_avatar', savedAv);
            } catch (e) {}
        } else if (userKey && !readStorage(userKey)) {
            try { localStorage.setItem(userKey, savedAv); } catch (e) {}
        }
        return savedAv;
    }

    /* Formatea los mensajes de error del Backend (corrige ñ, tildes y capitaliza) */
    function formatBackendError(rawMsg) {
        if (!rawMsg) return 'Ocurrió un error inesperado.';
        var msg = String(rawMsg).trim();
        // Si viene como JSON stringificado (ej: '{"detail":"..."}'), extraer detail
        if (msg.charAt(0) === '{') {
            try {
                var parsed = JSON.parse(msg);
                if (parsed && (parsed.detail || parsed.message)) {
                    msg = String(parsed.detail || parsed.message).trim();
                }
            } catch (e) {}
        }
        // Quitar prefijos técnicos redundantes como "error de login: ", "error de registro: ", "error de inicio de juego: "
        msg = msg.replace(/^error(\s+de\s+[a-záéíóúñ\s]+)?:\s*/i, '');
        // Reemplazar palabras sin ñ o sin tilde que envía el backend
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
        // Capitalizar la primera letra del mensaje
        if (msg.length > 0) {
            msg = msg.charAt(0).toUpperCase() + msg.slice(1);
        }
        // Asegurar punto final si no termina en signo de puntuación
        if (msg.length > 0 && !/[.!?]$/.test(msg)) {
            msg += '.';
        }
        return msg;
    }

    var ALERT_ERROR_ICON_SVG = '<svg class="error-alert-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

    /* Renderiza un mensaje de error estilizado con ícono SVG adentro de un contenedor */
    function renderErrorAlert(containerEl, rawMsg) {
        if (!containerEl) return;
        var cleanText = formatBackendError(rawMsg);
        containerEl.classList.add('field-error', 'error-alert-box');
        containerEl.innerHTML = ALERT_ERROR_ICON_SVG + '<span class="error-alert-text"></span>';
        var span = containerEl.querySelector('.error-alert-text');
        if (span) span.textContent = cleanText;
        containerEl.hidden = false;
        containerEl.style.display = 'flex';
    }

    function bindSessionCleanup() {
        var logoutSelectors = '#ddSessionAction, #btn-logout, a.item-danger[href*="login.html"]';
        document.querySelectorAll(logoutSelectors).forEach(function (el) {
            el.addEventListener('click', function () {
                try { localStorage.removeItem('footlel_token'); } catch (e) {}
            });
        });
    }

    function renderHeaderNotifications(friendReqs) {
        var notifList  = document.getElementById('notifList');
        var notifBadge = document.getElementById('notifBadge');
        if (!notifList || !notifBadge) return;

        var items = [];
        if (friendReqs && typeof friendReqs === 'object') {
            var reqNames = Array.isArray(friendReqs.friend_request_names)
                ? friendReqs.friend_request_names
                : (Array.isArray(friendReqs.friend_requests)
                    ? friendReqs.friend_requests
                    : (Array.isArray(friendReqs.requests)
                        ? friendReqs.requests
                        : (Array.isArray(friendReqs) ? friendReqs : [])));

            reqNames.forEach(function (entry) {
                var rawName = (typeof entry === 'object' && entry !== null)
                    ? (entry.user_name || entry.username || entry.friend_name || entry.sender_name || entry.name || '')
                    : entry;
                var cName = cleanUsername(rawName);
                if (cName) {
                    items.push({
                        type: 'friend_request',
                        text: '¡Tenes una nueva solicitud de amistad de ' + cName + '!',
                        href: 'amigos.html'
                    });
                }
            });

            var matchInvites = Array.isArray(friendReqs.match_request_names)
                ? friendReqs.match_request_names
                : (Array.isArray(friendReqs.match_requests)
                    ? friendReqs.match_requests
                    : (Array.isArray(friendReqs.match_invitations) ? friendReqs.match_invitations : []));

            matchInvites.forEach(function (entry) {
                var rawName = (typeof entry === 'object' && entry !== null)
                    ? (entry.user_name || entry.username || entry.sender_name || entry.name || '')
                    : entry;
                var cName = cleanUsername(rawName);
                if (cName) {
                    items.push({
                        type: 'match_invite',
                        text: 'El usuario ' + cName + ' te invitó a jugar una partida',
                        href: 'amigos.html'
                    });
                }
            });
        }

        notifList.innerHTML = '';

        if (items.length === 0) {
            notifBadge.textContent = '';
            notifBadge.hidden = true;
            notifBadge.style.display = 'none';

            var emptyLi = document.createElement('li');
            emptyLi.className = 'notif-empty';
            emptyLi.textContent = 'No tienes notificaciones nuevas';
            notifList.appendChild(emptyLi);
            return;
        }

        notifBadge.textContent = String(items.length);
        notifBadge.hidden = false;
        notifBadge.style.display = 'inline-flex';

        items.forEach(function (notif) {
            var li = document.createElement('li');
            li.className = 'notif-list-item';

            var link = document.createElement('a');
            link.href = notif.href;
            link.className = 'notif-item';

            var dot = document.createElement('span');
            dot.className = 'notif-item-dot';
            dot.setAttribute('aria-hidden', 'true');

            var textSpan = document.createElement('span');
            textSpan.className = 'notif-item-text';
            textSpan.textContent = notif.text;

            link.appendChild(dot);
            link.appendChild(textSpan);

            link.addEventListener('click', function (e) {
                if (notif.type === 'friend_request') {
                    try { sessionStorage.setItem('footlel_open_tab', 'solicitudes'); } catch (_) {}
                    var solTab = document.querySelector('.amigos-tab[data-tab="solicitudes"]');
                    if (solTab) {
                        e.preventDefault();
                        solTab.click();
                    }
                }
                var dd = document.getElementById('notifDropdown');
                var btn = document.getElementById('notifBtn');
                if (dd) dd.classList.remove('is-open');
                if (btn) btn.setAttribute('aria-expanded', 'false');
            });

            li.appendChild(link);
            notifList.appendChild(li);
        });
    }

    function refreshHeaderNotifications() {
        var token = (readStorage('footlel_token') || '').trim();
        if (!token || token === 'null' || token === 'undefined' || isGuestSession()) {
            return Promise.resolve(null);
        }
        return fetch(getApiBaseUrl() + '/user/get-user-friend-requests', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
            if (data) renderHeaderNotifications(data);
            return data;
        })
        .catch(function () { return null; });
    }

    function setupHeaderNotifications() {
        var notifWrapper  = document.getElementById('notifWrapper');
        var notifBtn      = document.getElementById('notifBtn');
        var notifDropdown = document.getElementById('notifDropdown');
        var profileBtn    = document.getElementById('profileBtn');
        var profileDd     = document.getElementById('profileDropdown');

        if (!notifWrapper || !notifBtn || !notifDropdown) return;

        if (isGuestSession()) {
            notifWrapper.style.display = 'none';
            return;
        }

        function closeNotif() {
            notifDropdown.classList.remove('is-open');
            notifBtn.setAttribute('aria-expanded', 'false');
        }

        function openNotif() {
            if (profileDd) profileDd.classList.remove('is-open');
            if (profileBtn) profileBtn.setAttribute('aria-expanded', 'false');
            notifDropdown.classList.add('is-open');
            notifBtn.setAttribute('aria-expanded', 'true');
        }

        if (notifBtn.dataset.notifBound !== 'true') {
            notifBtn.dataset.notifBound = 'true';
            notifBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                if (notifDropdown.classList.contains('is-open')) {
                    closeNotif();
                } else {
                    openNotif();
                }
            });

            if (profileBtn) {
                profileBtn.addEventListener('click', function () {
                    closeNotif();
                });
            }

            document.addEventListener('click', function (e) {
                if (!notifWrapper.contains(e.target)) {
                    closeNotif();
                }
            });

            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') {
                    closeNotif();
                }
            });
        }

        refreshHeaderNotifications();
    }

    window.FootlelPrefs = {
        applyTheme: applyTheme,
        applyAnimations: applyAnimations,
        applyFromStorage: applyFromStorage,
        fetchUserConfig: fetchUserConfig,
        saveUserConfig: saveUserConfig,
        saveCurrentConfig: saveCurrentConfig,
        syncConfigFromBackend: syncConfigFromBackend,
        cleanUsername: cleanUsername,
        BASE_ROBOT_AVATARS: BASE_ROBOT_AVATARS,
        pickRandomRobotAvatar: pickRandomRobotAvatar,
        getOrAssignAvatar: getOrAssignAvatar,
        formatBackendError: formatBackendError,
        renderErrorAlert: renderErrorAlert,
        renderHeaderNotifications: renderHeaderNotifications,
        refreshHeaderNotifications: refreshHeaderNotifications,
        setDarkModeState: function (state) { return saveCurrentConfig({ dark: state }); },
        setAnimationState: function (state) { return saveCurrentConfig({ anim: state }); },
        setCompatibilityState: function (state) { return saveCurrentConfig({ compat: state }); }
    };

    /* Immediately (<html> always exists, avoids flash of wrong theme). */
    applyFromStorage();

    /* Once <body> exists. */
    document.addEventListener('DOMContentLoaded', function () {
        // 1. Apply stored preferences immediately once body is available (zero flicker)
        applyFromStorage();
        // 2. Bind logout buttons so token is cleared on sign-out
        bindSessionCleanup();
        // 3. Setup header notifications bell & dropdown on any page with the header
        setupHeaderNotifications();
        // 4. Asynchronously fetch GET /config/get-user-config and update localStorage + DOM
        syncConfigFromBackend();
    });

    /* Back/forward cache restores pages without re-running scripts. */
    window.addEventListener('pageshow', applyFromStorage);

    /* Changes made in another tab. */
    window.addEventListener('storage', function (e) {
        if (e.key === THEME_KEY || e.key === ANIM_KEY || e.key === null) applyFromStorage();
    });
})();