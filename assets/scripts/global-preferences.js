/**
 * FOOTLEL — Preferencias Globales
 * assets/scripts/global-preferences.js
 *
 * 1. Aplica body.light-mode / body.disable-animations en TODAS las páginas.
 * 2. Tras DOMContentLoaded: sincroniza el logo (#main-logo) y los toggles
 *    de configuracion.html de forma defensiva (guarda if-null en cada nodo).
 *
 * Uso: <script src="../../assets/scripts/global-preferences.js" defer></script>
 */
(function applyGlobalPreferences() {
    'use strict';

    /* ── Rutas de logo ──────────────────────────────────────────── */
    var LOGO_DARK  = '../../assets/images/logo-oscuro.png';
    var LOGO_LIGHT = '../../assets/images/logo-claro.png';

    /* ── 1. MODO CLARO / OSCURO ───────────────────────────────────
       Clave : 'footlel_theme'   Valores: 'dark' (defecto) | 'light'
       → Aplica/quita body.light-mode en TODAS las páginas.
    ─────────────────────────────────────────────────────────────── */
    var theme   = localStorage.getItem('footlel_theme') || 'dark';
    var isLight = (theme === 'light');

    /* Aplicar al <html> inmediatamente (siempre existe, incluso desde el <head>)
       para que el CSS tipo html.light-mode body {...} también pueda funcionar */
    document.documentElement.classList.toggle('light-mode', isLight);
    document.documentElement.classList.toggle('disable-animations', animDisabled);

    /* ── 3. Función utilitaria: swap del logo ─────────────────────
       Busca #main-logo (presente en TODAS las páginas tras los edits
       del HTML) y cambia su src según el tema activo.
    ─────────────────────────────────────────────────────────────── */
    function syncLogo(light) {
        var logo = document.getElementById('main-logo');
        if (!logo) return;
        logo.src = light ? LOGO_LIGHT : LOGO_DARK;
    }

    /* ── 4. DOM-DEPENDENT: aplicar al body + sincronizar logo ────────
       Un único DOMContentLoaded. Los toggles de configuracion.html
       tienen su propio script y no necesitan duplicarse aquí.
    ─────────────────────────────────────────────────────────────── */
    document.addEventListener('DOMContentLoaded', function () {

        /* 4a. Aplicar clases al body (ahora que ya existe) */
        document.body.classList.toggle('light-mode', isLight);
        document.body.classList.toggle('disable-animations', animDisabled);

        /* 4b. Sincronizar logo en TODAS las páginas */
        syncLogo(isLight);

    });

})();

