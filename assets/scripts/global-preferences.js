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

    /* ── 1v1 MATCH REQUESTS (invitaciones de partida multijugador) ──────
       Endpoints (todos con Authorization: Bearer <token>):
         GET  /user/get-user-match-requests
         POST /user/reply-user-match-request  { friend_name, reply }
         POST /game/join-multiplayer-game     (sin body)
       La sesión de la partida se guarda en sessionStorage[MP_SESSION_KEY]
       y la consume tateti-online.html. */
    var MP_SESSION_KEY = 'footlel_mp_session';
    function getBoardPageUrl() {
        if (window.location.pathname.indexOf('/componentes/pages/') !== -1) {
            return 'tateti-online.html';
        }
        return 'componentes/pages/tateti-online.html';
    }
    var MP_BOARD_PAGE = 'tateti-online.html';
    var MP_JOIN_MAX_ATTEMPTS = 12;
    var MP_JOIN_RETRY_MS = 1500;
    var NOTIFICATIONS_POLL_MS = 5000;

    function getAuthToken() {
        var t = (readStorage('footlel_token') || '').trim();
        return (!t || t === 'null' || t === 'undefined') ? '' : t;
    }

    function extractErrorDetail(data) {
        if (!data) return '';
        if (typeof data === 'string') return data;
        if (typeof data.detail === 'string') return data.detail;
        if (Array.isArray(data.detail) && data.detail.length > 0) {
            var first = data.detail[0];
            if (first && typeof first.msg === 'string') return first.msg;
        }
        if (typeof data.message === 'string') return data.message;
        return '';
    }

    /* JSON request helper. Always resolves: { ok, status, data, detail }. */
    function mpRequest(method, path, body) {
        var headers = { 'Authorization': 'Bearer ' + getAuthToken() };
        var opts = { method: method, headers: headers };
        if (body !== undefined) {
            headers['Content-Type'] = 'application/json';
            opts.body = JSON.stringify(body);
        }
        return fetch(getApiBaseUrl() + path, opts).then(function (resp) {
            return resp.text().then(function (txt) {
                var data = null;
                try { data = txt ? JSON.parse(txt) : null; } catch (e) {}
                return { ok: resp.ok, status: resp.status, data: data, detail: extractErrorDetail(data) };
            });
        }).catch(function () {
            return { ok: false, status: 0, data: null, detail: 'No pudimos conectar con el servidor.' };
        });
    }

    function matchEntryName(entry) {
        if (entry && typeof entry === 'object') {
            return cleanUsername(entry.user_name || entry.username || entry.friend_name ||
                entry.sender_name || entry.challenger_name || entry.name || '');
        }
        return cleanUsername(entry);
    }

    /* Accepts parallel arrays (match_request_names / friend_request_names) or
       an array of strings/objects. Returns a de-duplicated array of names. */
    function parseMatchRequestNames(data) {
        if (!data) return [];
        var list = null;
        if (Array.isArray(data)) {
            list = data;
        } else if (typeof data === 'object') {
            var keys = ['match_request_names', 'friend_request_names', 'match_requests', 'match_invitations', 'requests'];
            for (var i = 0; i < keys.length; i++) {
                if (Array.isArray(data[keys[i]])) { list = data[keys[i]]; break; }
            }
            if (!list && data.data && typeof data.data === 'object') return parseMatchRequestNames(data.data);
        }
        if (!list) return [];
        var seen = {};
        var names = [];
        list.forEach(function (entry) {
            var n = matchEntryName(entry);
            if (n && !seen[n.toLowerCase()]) {
                seen[n.toLowerCase()] = true;
                names.push(n);
            }
        });
        return names;
    }

    /* GET /user/get-user-match-requests -> Promise<string[] | null> (null on failure). */
    function fetchMatchRequests() {
        if (!getAuthToken() || isGuestSession()) return Promise.resolve(null);
        return mpRequest('GET', '/user/get-user-match-requests').then(function (res) {
            if (res.ok) return parseMatchRequestNames(res.data);
            if (res.status === 404) return [];
            return null;
        });
    }

    /* POST /user/reply-user-match-request { friend_name, reply } */
    function replyMatchRequest(challengerName, accept) {
        return mpRequest('POST', '/user/reply-user-match-request', {
            friend_name: String(challengerName),
            reply: Boolean(accept)
        });
    }

    function extractGameId(data) {
        if (!data || typeof data !== 'object') return null;
        var raw = data.game_id;
        if ((raw === undefined || raw === null) && data.data && typeof data.data === 'object') raw = data.data.game_id;
        if ((raw === undefined || raw === null)) raw = data.id;
        var n = Number(raw);
        return (raw !== undefined && raw !== null && raw !== '' && isFinite(n)) ? n : null;
    }

    function saveMatchSession(session) {
        try { sessionStorage.setItem(MP_SESSION_KEY, JSON.stringify(session)); } catch (e) {}
    }

    function clearMatchSession() {
        try { sessionStorage.removeItem(MP_SESSION_KEY); } catch (e) {}
    }

    function readMatchSession() {
        try {
            var raw = sessionStorage.getItem(MP_SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

    /* ── Máquina de estados del modo 1v1 Online ──────────────────────────
       A (desafía):  send-user-match-request -> sala de espera ->
                     join-multiplayer-game cada 5s hasta match_started === true
       B (acepta):   reply-user-match-request(true) -> start-multiplayer-game
                     -> sala de espera -> join-multiplayer-game cada 5s
                     hasta match_started === true
       Con match_started === true el JSON de join trae game_id, equipos y
       países: se guarda en sessionStorage y se redirige al tablero. */
    var MP_JOIN_POLL_MS = 5000;
    var MP_JOIN_TIMEOUT_MS = 180000;

    function isMatchStarted(data) {
        if (!data || typeof data !== 'object') return false;
        var rawStarted = data.match_started !== undefined ? data.match_started : (data.data && data.data.match_started);
        var isStarted = (rawStarted === true || rawStarted === 'true' || rawStarted === 1 || rawStarted === '1');
        if (!isStarted) {
            var alt = data.game_started || data.started || (data.data && (data.data.game_started || data.data.started));
            if (alt === true || alt === 'true' || alt === 1 || alt === '1') isStarted = true;
        }
        var gid = extractGameId(data);
        if (gid !== null && gid > 0 && rawStarted !== false && rawStarted !== 'false') isStarted = true;
        if (!isStarted) return false;

        // Ensure board clubs and countries have arrived before leaving waiting room
        var b = (data && data.board) || (data && data.data && data.data.board);
        if (Array.isArray(b) && b.length >= 2 && Array.isArray(b[0]) && b[0].length >= 3) {
            return true;
        }
        if (data.row_headers || (data.data && data.data.row_headers)) return true;
        return false;
    }

    /* Polls POST /game/join-multiplayer-game every 5s (no overlap between calls).
       Returns { promise, cancel }. promise resolves { ok, data } | { ok:false, cancelled?, detail? }. */
    function createJoinPoller() {
        var cancelled = false;
        var timer = null;
        var resolveFn = null;
        var startedAt = Date.now();

        var promise = new Promise(function (resolve) {
            resolveFn = resolve;
            function tick() {
                if (cancelled) return;
                mpRequest('POST', '/game/join-multiplayer-game').then(function (res) {
                    if (cancelled) return;
                    try {
                        if (res.ok && isMatchStarted(res.data)) {
                            resolve({ ok: true, data: res.data });
                            return;
                        }
                        if (res.status === 401 || res.status === 403) {
                            resolve({ ok: false, detail: res.detail || 'Tu sesión expiró. Volvé a iniciar sesión.' });
                            return;
                        }
                    } catch (err) {
                        console.warn('Error procesando respuesta de join:', err);
                    }
                    if (Date.now() - startedAt > MP_JOIN_TIMEOUT_MS) {
                        resolve({ ok: false, detail: 'La partida no comenzó a tiempo. Intentá de nuevo.' });
                        return;
                    }
                    timer = setTimeout(tick, MP_JOIN_POLL_MS);
                }).catch(function (err) {
                    if (cancelled) return;
                    console.warn('Error de red en polling de join:', err);
                    if (Date.now() - startedAt > MP_JOIN_TIMEOUT_MS) {
                        resolve({ ok: false, detail: 'La partida no comenzó a tiempo. Intentá de nuevo.' });
                        return;
                    }
                    timer = setTimeout(tick, MP_JOIN_POLL_MS);
                });
            }
            tick();
        });

        return {
            promise: promise,
            cancel: function () {
                cancelled = true;
                if (timer) clearTimeout(timer);
                if (resolveFn) resolveFn({ ok: false, cancelled: true });
            }
        };
    }

    /* ── Overlay "Sala de espera" reutilizable en cualquier página ── */
    var matchWaitTimerId = null;

    function showMatchWaitRoom(title, text, onCancel) {
        var overlay = document.getElementById('matchWaitOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'matchWaitOverlay';
            overlay.className = 'match-wait-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.innerHTML =
                '<div class="match-wait-card">' +
                '<div class="match-wait-spinner" aria-hidden="true"></div>' +
                '<h2 class="match-wait-title"></h2>' +
                '<p class="match-wait-text"></p>' +
                '<p class="match-wait-status" style="font-size:12px;color:rgba(158,158,158,0.85);margin:-10px 0 16px;"></p>' +
                '<button type="button" class="match-wait-cancel">Cancelar</button>' +
                '</div>';
            document.body.appendChild(overlay);
        }
        overlay.querySelector('.match-wait-title').textContent = title || 'Sala de espera';
        var textEl = overlay.querySelector('.match-wait-text');
        var statusEl = overlay.querySelector('.match-wait-status');
        if (textEl) textEl.textContent = text || '';
        if (statusEl) statusEl.textContent = 'Esperando confirmación...';

        var cancelBtn = overlay.querySelector('.match-wait-cancel');
        cancelBtn.onclick = function () {
            hideMatchWaitRoom();
            if (typeof onCancel === 'function') onCancel();
        };

        if (matchWaitTimerId) {
            clearInterval(matchWaitTimerId);
            matchWaitTimerId = null;
        }
        var secondsElapsed = 0;
        matchWaitTimerId = setInterval(function () {
            secondsElapsed += 1;
            var mins = Math.floor(secondsElapsed / 60);
            var secs = secondsElapsed % 60;
            var timeStr = (mins > 0 ? (mins + ':' + (secs < 10 ? '0' : '') + secs) : (secs + 's'));
            if (statusEl) {
                statusEl.textContent = 'Esperando confirmación (' + timeStr + ')...';
            }
        }, 1000);

        overlay.hidden = false;
        overlay.style.display = 'flex';
    }

    function hideMatchWaitRoom() {
        if (matchWaitTimerId) {
            clearInterval(matchWaitTimerId);
            matchWaitTimerId = null;
        }
        var overlay = document.getElementById('matchWaitOverlay');
        if (overlay) {
            overlay.hidden = true;
            overlay.style.display = 'none';
        }
    }

    /* Waits (with the waiting room open) until match_started === true, then
       stores the session and redirects to the board. */
    function waitRoomThenEnterBoard(role, opponentName, title, text) {
        var poller = createJoinPoller();
        showMatchWaitRoom(title, text, function () { poller.cancel(); });
        return poller.promise.then(function (result) {
            hideMatchWaitRoom();
            if (!result.ok) return result;
            var gameId = extractGameId(result.data);
            if (gameId === null) {
                return { ok: false, detail: 'El servidor no devolvió el game_id de la partida.' };
            }
            saveMatchSession({
                role: role,
                opponent: opponentName,
                gameId: gameId,
                matchStarted: true,
                startData: result.data,
                createdAt: Date.now()
            });
            window.location.href = getBoardPageUrl();
            return { ok: true };
        });
    }

    /* Player A, after POST /user/send-user-match-request succeeded. */
    function startChallengeWait(friendName) {
        var name = String(friendName);
        return waitRoomThenEnterBoard('host', name, 'Sala de espera',
            'Esperando a que ' + name + ' acepte el desafío...');
    }

    /* Player B accepts: reply(true) -> start-multiplayer-game -> wait for match_started. */
    function acceptMatchAndJoin(challengerName) {
        var name = String(challengerName);
        return replyMatchRequest(name, true).then(function (reply) {
            if (!reply.ok) {
                return { ok: false, detail: reply.detail || 'No se pudo aceptar el desafío.' };
            }
            return mpRequest('POST', '/game/start-multiplayer-game', { friend_name: name }).then(function (start) {
                if (start.ok) return start;
                // Fallback: backend may expect the name of the user who accepted.
                var myName = cleanUsername(readStorage('footlel_username'));
                if (!myName || myName.toLowerCase() === name.toLowerCase()) return start;
                return mpRequest('POST', '/game/start-multiplayer-game', { friend_name: myName }).then(function (retry) {
                    return retry.ok ? retry : start;
                });
            }).then(function (start) {
                if (start.ok && isMatchStarted(start.data)) {
                    var gid = extractGameId(start.data);
                    if (gid !== null && gid > 0) {
                        saveMatchSession({
                            role: 'guest',
                            opponent: name,
                            gameId: gid,
                            matchStarted: true,
                            startData: start.data,
                            createdAt: Date.now()
                        });
                        window.location.href = getBoardPageUrl();
                        return { ok: true };
                    }
                }
                var alreadyStarted = /ya\s|already|started|iniciad|en\s+curso/i.test(start.detail || '');
                if (!start.ok && !alreadyStarted) {
                    return { ok: false, detail: start.detail || 'No se pudo iniciar la partida.' };
                }
                return waitRoomThenEnterBoard('guest', name, 'Sala de espera', 'Conectando a la partida...');
            });
        });
    }

    function notifyMatchRequestsChanged(names) {
        try {
            window.dispatchEvent(new CustomEvent('footlel:match-requests-updated', { detail: { names: names || [] } }));
        } catch (e) {}
    }

    function buildMatchInviteNotification(notif) {
        var wrap = document.createElement('div');
        wrap.className = 'notif-item notif-item--match';

        var dot = document.createElement('span');
        dot.className = 'notif-item-dot';
        dot.setAttribute('aria-hidden', 'true');

        var body = document.createElement('div');
        body.className = 'notif-match-body';

        var textSpan = document.createElement('span');
        textSpan.className = 'notif-item-text';
        textSpan.textContent = notif.text;

        var errorSpan = document.createElement('span');
        errorSpan.className = 'notif-match-error';
        errorSpan.hidden = true;

        var actions = document.createElement('div');
        actions.className = 'notif-actions';

        var acceptBtn = document.createElement('button');
        acceptBtn.type = 'button';
        acceptBtn.className = 'notif-match-btn notif-match-btn--accept';
        acceptBtn.textContent = 'Aceptar';

        var rejectBtn = document.createElement('button');
        rejectBtn.type = 'button';
        rejectBtn.className = 'notif-match-btn notif-match-btn--reject';
        rejectBtn.textContent = 'Rechazar';

        function setBusy(busy, label) {
            acceptBtn.disabled = busy;
            rejectBtn.disabled = busy;
            if (label) acceptBtn.textContent = label;
        }

        function showError(msg) {
            errorSpan.textContent = formatBackendError(msg);
            errorSpan.hidden = false;
        }

        acceptBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            errorSpan.hidden = true;
            setBusy(true, 'Uniéndote...');
            acceptMatchAndJoin(notif.name).then(function (res) {
                if (!res.ok) {
                    acceptBtn.textContent = 'Aceptar';
                    setBusy(false);
                    if (!res.cancelled) showError(res.detail);
                }
            });
        });

        rejectBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            errorSpan.hidden = true;
            setBusy(true);
            replyMatchRequest(notif.name, false).then(function (res) {
                if (!res.ok) {
                    setBusy(false);
                    showError(res.detail || 'No se pudo rechazar el desafío.');
                    return;
                }
                refreshHeaderNotifications();
            });
        });

        actions.appendChild(acceptBtn);
        actions.appendChild(rejectBtn);
        body.appendChild(textSpan);
        body.appendChild(errorSpan);
        body.appendChild(actions);
        wrap.appendChild(dot);
        wrap.appendChild(body);
        return wrap;
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
                        name: cName,
                        text: '¡' + cName + ' te invitó a jugar una partida 1v1!',
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

            if (notif.type === 'match_invite') {
                li.appendChild(buildMatchInviteNotification(notif));
                notifList.appendChild(li);
                return;
            }

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
        var friendReqPromise = fetch(getApiBaseUrl() + '/user/get-user-friend-requests', {
            headers: { 'Authorization': 'Bearer ' + token }
        })
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; });

        return Promise.all([friendReqPromise, fetchMatchRequests()]).then(function (results) {
            var friendData = results[0];
            var matchNames = results[1];
            if (!friendData && matchNames === null) return null;

            var combined = (friendData && typeof friendData === 'object' && !Array.isArray(friendData))
                ? Object.assign({}, friendData)
                : { friend_request_names: Array.isArray(friendData) ? friendData : [] };
            // Match invitations come exclusively from GET /user/get-user-match-requests
            combined.match_request_names = matchNames || [];
            renderHeaderNotifications(combined);
            notifyMatchRequestsChanged(matchNames || []);
            return combined;
        });
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

        if (!window.__footlelNotifPollId) {
            window.__footlelNotifPollId = setInterval(function () {
                if (!document.hidden) refreshHeaderNotifications();
            }, NOTIFICATIONS_POLL_MS);
        }
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
        mpRequest: mpRequest,
        parseMatchRequestNames: parseMatchRequestNames,
        fetchMatchRequests: fetchMatchRequests,
        replyMatchRequest: replyMatchRequest,
        startChallengeWait: startChallengeWait,
        showMatchWaitRoom: showMatchWaitRoom,
        hideMatchWaitRoom: hideMatchWaitRoom,
        acceptMatchAndJoin: acceptMatchAndJoin,
        saveMatchSession: saveMatchSession,
        readMatchSession: readMatchSession,
        clearMatchSession: clearMatchSession,
        extractGameId: extractGameId,
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