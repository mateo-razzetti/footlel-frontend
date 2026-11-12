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

    var THEME_KEY      = 'footlel_theme';
    var ANIM_KEY       = 'pref_toggle-animaciones';
    var LANG_KEY       = 'footlel_lang';
    var IS_ENGLISH_KEY = 'footlel_is_english';

    /* ════════════════════════════════════════════════════════════════
       I18N ENGINE — Dynamic ES / EN Translation (RNF5)
       Never translates usernames, footballer names, club names, or JSON keys.
       ════════════════════════════════════════════════════════════════ */
    var I18N_PAIRS = [
        // ── Document Titles ──
        ['Footlel - Iniciar Sesión', 'Footlel - Log In'],
        ['Footlel - Crear Cuenta', 'Footlel - Create Account'],
        ['Footlel - Recuperar Cuenta', 'Footlel - Recover Account'],
        ['Footlel - Verificar Identidad', 'Footlel - Verify Identity'],
        ['Footlel - Nueva Contraseña', 'Footlel - New Password'],
        ['Footlel - Correo Enviado', 'Footlel - Email Sent'],
        ['Footlel — Menú Principal', 'Footlel — Main Menu'],
        ['Footlel — Elegí tu modo', 'Footlel — Choose Mode'],
        ['Footlel — Configuración', 'Footlel — Settings'],
        ['Footlel — Editar Cuenta', 'Footlel — Edit Account'],
        ['Footlel — Confirmá tus cambios', 'Footlel — Confirm Changes'],
        ['Footlel — Centro de Ayuda', 'Footlel — Help Center'],
        ['Footlel — Ayuda', 'Footlel — Help'],
        ['Footlel — Tabla de Posiciones', 'Footlel — Leaderboard'],
        ['Footlel — Mis Amigos', 'Footlel — My Friends'],
        ['Footlel — Tateti (1v1 Local)', 'Footlel — Tic-Tac-Toe (1v1 Local)'],
        ['Footlel — Tateti (Desafío Diario)', 'Footlel — Tic-Tac-Toe (Daily Challenge)'],
        ['Footlel — Tateti (1v1 Online)', 'Footlel — Tic-Tac-Toe (1v1 Online)'],

        // ── Shared Header & Notifications Dropdown ──
        ['Notificaciones', 'Notifications'],
        ['No tienes notificaciones nuevas', 'You have no new notifications'],
        ['Configuración', 'Settings'],
        ['Editar Cuenta', 'Edit Account'],
        ['Mis Amigos', 'My Friends'],
        ['Tabla de Posiciones', 'Leaderboard'],
        ['Ayuda', 'Help'],
        ['Cerrar Sesión', 'Log Out'],
        ['Iniciar Sesión', 'Log In'],
        ['Aceptar', 'Accept'],
        ['Rechazar', 'Decline'],
        ['Uniéndote...', 'Joining...'],
        ['Sala de espera', 'Waiting Room'],
        ['Esperando confirmación...', 'Waiting for confirmation...'],
        ['Conectando a la partida...', 'Connecting to match...'],
        ['Cancelar', 'Cancel'],

        // ── login.html ──
        ['Ingresá tu usuario', 'Enter your username'],
        ['Contraseña', 'Password'],
        ['Mostrar contraseña', 'Show password'],
        ['Ocultar contraseña', 'Hide password'],
        ['Olvidé mi contraseña', 'Forgot my password'],
        ['Registrarse', 'Sign Up'],
        ['Continuar como invitado', 'Continue as guest'],
        ['Falta ingresar el usuario.', 'Please enter your username.'],
        ['Falta ingresar la contraseña.', 'Please enter your password.'],
        ['Error al iniciar sesión.', 'Error logging in.'],
        ['No se pudo conectar con el servidor. Intentá más tarde.', 'Could not connect to the server. Please try again later.'],

        // ── registro.html ──
        ['CREÁ TU CUENTA', 'CREATE YOUR ACCOUNT'],
        ['Correo electrónico', 'Email address'],
        ['Usuario', 'Username'],
        ['Confirmar Contraseña', 'Confirm Password'],
        ['Ingresá un correo válido.', 'Enter a valid email address.'],
        ['Ingresá un correo electrónico válido.', 'Enter a valid email address.'],
        ['Las contraseñas no coinciden.', 'Passwords do not match.'],
        ['¿Ya tenés cuenta? Iniciá sesión', 'Already have an account? Log in'],
        ['Falta ingresar el correo.', 'Please enter your email address.'],
        ['Falta crear un usuario.', 'Please create a username.'],
        ['Falta confirmar la contraseña.', 'Please confirm your password.'],
        ['La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.', 'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.'],

        // ── recuperar.html ──
        ['Recuperar cuenta', 'Recover Account'],
        ['Ingresá tu correo electrónico y te enviaremos un código de seguridad', 'Enter your email address and we will send you a security code'],
        ['ejemplo@correo.com', 'example@email.com'],
        ['Enviar código', 'Send Code'],
        ['Volver al Login', 'Back to Login'],

        // ── verificar.html & verificar-edicion.html ──
        ['Verificá tu identidad', 'Verify Your Identity'],
        ['Ingresá el código de 6 dígitos que enviamos a tu correo', 'Enter the 6-digit code we sent to your email'],
        ['Ingresá los 6 dígitos del código de verificación.', 'Please enter all 6 digits of the verification code.'],
        ['Verificar', 'Verify'],
        ['¿No recibiste el código?', "Didn't receive the code?"],
        ['Reenviar en', 'Resend in'],
        ['Reenviar código', 'Resend code'],
        ['Confirmá tus cambios', 'Confirm Your Changes'],
        ['Ingresá el código de 6 dígitos que enviamos a tu correo para autorizar la actualización de tu perfil.', 'Enter the 6-digit code we sent to your email to authorize your profile update.'],
        ['Confirmar Cambios', 'Confirm Changes'],

        // ── nueva-clave.html ──
        ['Cambiar Contraseña', 'Change Password'],
        ['Nueva contraseña', 'New password'],
        ['Nueva Contraseña', 'New Password'],
        ['Ingresá tu nueva clave', 'Enter your new password'],
        ['Reescriba la contraseña', 'Retype password'],
        ['Guardar', 'Save'],
        ['Falta ingresar la nueva contraseña.', 'Please enter the new password.'],

        // ── correo-enviado.html ──
        ['¡Revisá tu correo!', 'Check your email!'],
        ['Te enviamos un enlace de confirmación.', 'We sent you a confirmation link.'],
        ['Hacé clic en él para activar tu cuenta', 'Click on it to activate your account'],
        ['y empezar a jugar.', 'and start playing.'],

        // ── menu.html ──
        ['Bienvenido', 'Welcome'],
        ['Elegí un modo de juego y comenzá a dominar las canchas de trivia.', 'Choose a game mode and start dominating the trivia pitch.'],
        ['Jugar Tateti', 'Play Tic-Tac-Toe'],
        ['El modo estrella de Footlel. Respondé preguntas de fútbol y conquistá el tablero 3×3 antes que tu rival. ¡Estrategia y conocimiento en cada jugada!', 'The signature mode of Footlel. Answer football trivia and conquer the 3×3 board before your rival. Strategy and knowledge in every move!'],
        ['JUGAR AHORA', 'PLAY NOW'],
        ['Tabla de Ranking', 'Leaderboard'],
        ['Mirá en qué posición estás entre todos los jugadores de Footlel. Escalá puestos respondiendo bien y manteniendo tu racha.', 'Check your rank among all Footlel players. Climb the standings by answering correctly and keeping your streak alive.'],
        ['VER MIS PUNTOS', 'VIEW MY POINTS'],
        ['Desafiar Amigos', 'Challenge Friends'],
        ['Invitá a tus amigos a un duelo privado de Tateti y demostrá quién sabe más de fútbol. Compartí el código de partida y a jugar.', 'Invite your friends to a private Tic-Tac-Toe duel and prove who knows more about football.'],
        ['INVITAR AMIGO', 'INVITE FRIEND'],
        ['PORCENTAJE DE ACIERTOS', 'ACCURACY RATE'],
        ['Porcentaje de Aciertos =', 'Accuracy Rate ='],
        ['TU RACHA', 'YOUR STREAK'],
        ['Tu racha aumenta por cada día consecutivo que juegues. ¡Recibís +10 puntos extra por cada día de racha acumulado!', 'Your streak increases for every consecutive day you play. You earn +10 bonus points for each accumulated streak day!'],
        ['PUNTOS TOTALES', 'TOTAL POINTS'],
        ['Suma total de los puntos obtenidos en todas tus partidas y bonificaciones.', 'Total sum of points earned across all your matches and bonuses.'],
        ['PORCENTAJE DE VICTORIAS', 'WIN RATE'],
        ['Porcentaje de Victorias =', 'Win Rate ='],
        ['¡Sumate a la cancha!', 'Join the pitch!'],
        ['Iniciá sesión o creá tu cuenta gratis para desafiar a otros jugadores y guardar tus estadísticas diarias.', 'Log in or create a free account to challenge other players and save your daily stats.'],

        // ── modalidades.html ──
        ['Elegí tu modo de juego', 'Choose your game mode'],
        ['Demostrá cuánto sabés sobre el fútbol nacional e internacional.', 'Show how much you know about national and international football.'],
        ['Desafío Diario', 'Daily Challenge'],
        ['Una partida exclusiva por día. Juga el Tateti del dia, sumá puntos al ranking global y mantené tu racha activa.', 'One exclusive match per day. Play the daily Tic-Tac-Toe, earn global ranking points, and keep your streak alive.'],
        ['1v1 Local', '1v1 Local'],
        ['Jugá en el mismo dispositivo con un amigo. Turno a turno, en el Tateti y demostrá quién sabe más de fútbol.', 'Play on the same device with a friend. Take turns in Tic-Tac-Toe and prove who knows more about football.'],
        ['1v1 Online', '1v1 Online'],
        ['Desafiá a un amigo real a una partida 1v1 en tiempo real. Enviale el desafío desde "Mis Amigos" y jueguen apenas lo acepte.', 'Challenge a real friend to a real-time 1v1 match. Send the challenge from "My Friends" and play as soon as they accept.'],
        ['INGRESAR', 'ENTER'],
        ['Iniciá sesión o registrate gratis para competir online, jugar con amigos y guardar tus estadísticas diarias.', 'Log in or sign up for free to compete online, play with friends, and save your daily stats.'],

        // ── configuracion.html ──
        ['Jugador Invitado', 'Guest Player'],
        ['Invitado', 'Guest'],
        ['Configuración de Cuenta', 'Account Settings'],
        ['Eliminar animaciones', 'Disable animations'],
        ['Reduce el movimiento para mejorar el rendimiento.', 'Reduces motion to improve performance.'],
        ['Modo Oscuro', 'Dark Mode'],
        ['Activa el tema oscuro en toda la aplicación.', 'Enables the dark theme across the entire app.'],
        ['Modo Compatibilidad', 'Compatibility Mode'],
        ['Optimiza Footlel para dispositivos más antiguos.', 'Optimizes Footlel for older devices.'],
        ['Idioma Inglés', 'English Language'],
        ['Cambia el idioma de la interfaz entre español e inglés.', 'Switches the interface language between Spanish and English.'],
        ['Idioma', 'Language'],
        ['Alterna el idioma de la interfaz entre español e inglés.', 'Switches the interface language between Spanish and English.'],
        ['No se pudo sincronizar el idioma.', 'Could not sync language preference.'],
        ['Eliminar Cuenta', 'Delete Account'],
        ['Guardá tu progreso y competí', 'Save your progress and compete'],
        ['Creá una cuenta gratuita para guardar tus estadísticas, subir en el ranking y desafiar amigos.', 'Create a free account to save your stats, climb the leaderboard, and challenge friends.'],
        ['¿Estás seguro?', 'Are you sure?'],
        ['Escribe la palabra', 'Type the word'],
        ["'eliminar'", "'delete'"],
        ['para confirmar la destrucción de tu cuenta.', 'to confirm the permanent deletion of your account.'],
        ['Escribe aquí...', 'Type here...'],
        ['Palabra incorrecta, intenta de nuevo.', 'Incorrect word, please try again.'],
        ["Palabra incorrecta, escribe 'eliminar'.", "Incorrect word, type 'delete'."],
        ['Eliminar', 'Delete'],
        ['Cuenta eliminada con éxito. Redirigiendo...', 'Account successfully deleted. Redirecting...'],
        ['Error al eliminar la cuenta.', 'Error deleting account.'],
        ['No se pudo conectar con el servidor.', 'Could not connect to the server.'],
        ['Ingresá el código que enviamos a tu correo para confirmar los cambios.', 'Enter the code we sent to your email to confirm the changes.'],
        ['Confirmar', 'Confirm'],
        ['Ingresá el código completo.', 'Please enter the full code.'],
        ['✓ Cambios guardados correctamente', '✓ Changes saved successfully'],

        // ── editar-cuenta.html ──
        ['Subir imagen', 'Upload image'],
        ['O elegí un avatar base:', 'Or choose a base avatar:'],
        ['Nombre de Usuario', 'Username'],
        ['Tu nombre de usuario', 'Your username'],
        ['Correo Electrónico', 'Email Address'],
        ['tu@correo.com', 'your@email.com'],
        ['Dejá en blanco para no cambiarla', 'Leave blank to keep current password'],
        ['Guardar Cambios', 'Save Changes'],

        // ── ayuda.html ──
        ['Centro de Ayuda', 'Help Center'],
        ['Resolvemos tus dudas sobre las reglas y tu cuenta.', 'Answers to your questions about the rules and your account.'],
        ['¿Cómo se juega a Footlel?', 'How do you play Footlel?'],
        ['Buscá un futbolista que cumpla la condición del club y la nacionalidad. Las partidas se juegan al mejor de 3 rondas: ¡el primero en conseguir 2 rondas se lleva la victoria!', 'Find a footballer who matches both the club and nationality condition. Matches are played as best of 3 rounds: the first to win 2 rounds takes the victory!'],
        ['¿Cómo se calculan los puntos del ranking?', 'How are leaderboard points calculated?'],
        ['Ganás puntos por cada partida que ganadás. Tu posición en el ranking global depende de la cantidad de victorias acumuladas y de mantener una racha activa. Cuanto más jugás y ganás, más alto subís.', 'You earn points for every match you win. Your global leaderboard rank depends on your total wins and keeping an active streak. The more you play and win, the higher you climb.'],
        ['¿Qué pasa si se acaba mi tiempo?', 'What happens if my time runs out?'],
        ['Si el tiempo de una ronda expira sin que hayas respondido, perdés esa ronda automáticamente. Tu rival puede aprovechar para avanzar, así que prestá atención al cronómetro.', 'If the turn timer expires before you answer, you lose your turn automatically. Your rival can take advantage to get ahead, so keep an eye on the clock.'],
        ['¿Cómo desafío a un amigo?', 'How do I challenge a friend?'],
        ['Desde el Menú Principal, hacé clic en "Desafiar Amigos". El sistema generará un código de partida único que podés compartirle a tu amigo para que se una a la sala privada.', 'From the Main Menu, click "Challenge Friends" or go to "My Friends" to send a 1v1 challenge invitation and play in real time.'],
        ['¿Puedo guardar mi progreso como invitado?', 'Can I save my progress as a guest?'],
        ['No. Los jugadores invitados pueden explorar el menú y ver el juego, pero el progreso, el ranking y las estadísticas solo se guardan para usuarios registrados. Creá una cuenta gratuita para no perder tus logros.', 'No. Guest players can explore the menu and try the game, but progress, rankings, and stats are only saved for registered users. Create a free account so you do not lose your achievements.'],

        // ── leaderboard.html ──
        ['Global', 'Global'],
        ['Amigos', 'Friends'],
        ['Cargando ranking...', 'Loading leaderboard...'],
        ['No hay datos de ranking disponibles.', 'No leaderboard data available.'],
        ['Aún no tienes amigos agregados. ¡Ve a buscar rivales!', 'You have no friends added yet. Go find some rivals!'],
        ['Registrate gratis para guardar tus estadísticas, rachas y subir en el ranking mundial.', 'Sign up for free to save your stats, streaks, and climb the global leaderboard.'],
        ['© 2026 Footlel · Todos los derechos reservados', '© 2026 Footlel · All rights reserved'],

        // ── amigos.html ──
        ['Solicitudes', 'Requests'],
        ['Buscar', 'Search'],
        ['Buscar jugador...', 'Search player...'],
        ['Cargando tus amigos...', 'Loading your friends...'],
        ['Aún no tienes amigos agregados. ¡Busca jugadores en la pestaña Buscar!', 'You have no friends added yet. Find players in the Search tab!'],
        ['No se encontraron amigos con ese nombre.', 'No friends found with that name.'],
        ['Amigo en Footlel', 'Friend on Footlel'],
        ['Desafiar 1v1', 'Challenge 1v1'],
        ['Desafíos 1v1', '1v1 Challenges'],
        ['Cargando desafíos...', 'Loading challenges...'],
        ['No tienes desafíos 1v1 pendientes', 'You have no pending 1v1 challenges'],
        ['Aceptar 1v1', 'Accept 1v1'],
        ['Solicitudes de Amistad', 'Friend Requests'],
        ['Cargando solicitudes...', 'Loading requests...'],
        ['Cargando solicitudes de amistad...', 'Loading friend requests...'],
        ['No tienes solicitudes de amistad pendientes', 'You have no pending friend requests'],
        ['Solicitud de amistad recibida', 'Incoming friend request'],
        ['Solicitudes Enviadas', 'Sent Requests'],
        ['No tenés solicitudes enviadas pendientes.', 'You have no pending sent requests.'],
        ['Solicitud enviada · Pendiente', 'Request sent · Pending'],
        ['Buscar Usuarios', 'Search Users'],
        ['Encontrá a otros fanáticos y amigos para competir en duelos de trivia.', 'Find other fans and friends to compete in trivia duels.'],
        ['Ingresá el usuario...', 'Enter username...'],
        ['JUGADORES SUGERIDOS', 'SUGGESTED PLAYERS'],
        ['RESULTADOS DE BÚSQUEDA', 'SEARCH RESULTS'],
        ['Cargando jugadores...', 'Loading players...'],
        ['No se encontraron usuarios con ese nombre.', 'No users found with that name.'],
        ['No hay jugadores sugeridos disponibles en este momento.', 'No suggested players available right now.'],
        ['+ Agregar', '+ Add'],
        ['✓ ¡Solicitud Enviada!', '✓ Request Sent!'],
        ['✓ ¡Solicitud aceptada!', '✓ Request accepted!'],
        ['Solicitud rechazada', 'Request declined'],

        // ── tateti-local.html, tateti-diario.html & tateti-online.html ──
        ['Generando Tatetí...', 'Generating Tic-Tac-Toe...'],
        ['Armando el tablero...', 'Building the board...'],
        ['Cargando Partida 1v1...', 'Loading 1v1 Match...'],
        ['Sincronizando el tablero con tu rival...', 'Syncing board with your rival...'],
        ['Esperando inicio de partida...', 'Waiting for match to start...'],
        ['Buscar futbolista...', 'Search footballer...'],
        ['Confirmar Jugada', 'Confirm Move'],
        ['¡Escribí un jugador!', 'Type a player!'],
        ['Es el turno de tu rival', "It is your rival's turn"],
        ['¡Es tu turno!', 'It is your turn!'],
        ['Conectando con la partida...', 'Connecting to match...'],
        ['Reconectando con la partida...', 'Reconnecting to match...'],
        ['Jugador 1', 'Player 1'],
        ['Jugador 2', 'Player 2'],
        ['Bot Footlel', 'Footlel Bot'],
        ['Turno: Jugador 1', 'Turn: Player 1'],
        ['Turno: Jugador 2', 'Turn: Player 2'],
        ['Turno: Bot Footlel', 'Turn: Footlel Bot'],
        ['Mejor de 3 · gana quien llegue primero a 2 rondas', 'Best of 3 · first to win 2 rounds wins'],
        ['Partida 1v1 Online en tiempo real', 'Real-time 1v1 Online Match'],
        ['¡Golazo! La clavaste en el ángulo', 'What a goal! Top corner!'],
        ['¡Ta tan ta tan... Nooo Fabbiani!', 'Oh no... Missed it!'],
        ['Siguiente Ronda', 'Next Round'],
        ['¡Ganaste!', 'You Won!'],
        ['¡Perdiste!', 'You Lost!'],
        ['¡Ganaste la partida!', 'You won the match!'],
        ['¡Empate!', 'Draw!'],
        ['Partida finalizada', 'Match finished'],
        ['Resultado final', 'Final Score'],
        ['Casillas conquistadas', 'Cells conquered'],
        ['+10 Puntos de Ranking', '+10 Ranking Points'],
        ['+2 Puntos de Ranking', '+2 Ranking Points'],
        ['Jugar de nuevo', 'Play Again'],
        ['Jugar revancha', 'Play Rematch'],
        ['Volver al Menú', 'Back to Menu'],
        ['Volver a Amigos', 'Back to Friends'],
        ['Elegir otro modo', 'Choose Another Mode'],
        ['¡Desafío completado!', 'Challenge Completed!'],
        ['Ya completaste el desafío diario de hoy. ¡Volvé mañana para jugar una nueva partida y seguir sumando racha! El próximo desafío se desbloquea en:', 'You already completed today\'s daily challenge. Come back tomorrow to play a new match and keep your streak going! Next challenge unlocks in:']
    ];

    var ES_TO_EN = Object.create(null);
    var EN_TO_ES = Object.create(null);
    function normalizeI18nKey(str) {
        return String(str || '').replace(/\s+/g, ' ').trim();
    }
    I18N_PAIRS.forEach(function (pair) {
        var esKey = normalizeI18nKey(pair[0]);
        var enKey = normalizeI18nKey(pair[1]);
        ES_TO_EN[esKey] = pair[1];
        EN_TO_ES[enKey] = pair[0];
    });

    function isEnglishStored() {
        var isEng = readStorage(IS_ENGLISH_KEY);
        if (isEng === 'true') return true;
        if (isEng === 'false') return false;
        return readStorage(LANG_KEY) === 'en';
    }

    function getLanguage() {
        return isEnglishStored() ? 'en' : 'es';
    }

    function translateDynamicPattern(normStr, targetLang) {
        var m;
        if (targetLang === 'en') {
            // Streak: "🔥 5 Días" / "🔥 1 Día"
            if ((m = normStr.match(/^(🔥\s*\d+)\s+D[ií]as?$/i))) return m[1] + ' Days';
            // Accuracy / Wins tooltips
            if ((m = normStr.match(/^(\d+)\s+aciertos?$/i))) return m[1] + ' hits';
            if ((m = normStr.match(/^(\d+)\s+intentos?$/i))) return m[1] + ' attempts';
            if ((m = normStr.match(/^(\d+)\s+ganadas?$/i))) return m[1] + ' won';
            if ((m = normStr.match(/^(\d+)\s+jugadas?$/i))) return m[1] + ' played';
            // Turn indicators & round titles
            if ((m = normStr.match(/^Turno:\s*Jugador\s+(\d+)$/i))) return 'Turn: Player ' + m[1];
            if ((m = normStr.match(/^¡?Jugador\s+(\d+)\s+ganó\s+la\s+ronda!?$/i))) return 'Player ' + m[1] + ' won the round!';
            if ((m = normStr.match(/^¡?Ganó\s+el\s+Jugador\s+(\d+)!?$/i))) return 'Player ' + m[1] + ' won!';
            if ((m = normStr.match(/^Jugador\s+1\s+(\d+)\s*-\s*(\d+)\s+Jugador\s+2$/i))) return 'Player 1  ' + m[1] + ' - ' + m[2] + '  Player 2';
            // Online / Notifications with dynamic username (preserves username intact)
            if ((m = normStr.match(/^¡Tenes una nueva solicitud de amistad de (.+)!$/))) return 'You have a new friend request from ' + m[1] + '!';
            if ((m = normStr.match(/^¡(.+) te invitó a jugar una partida 1v1!$/))) return m[1] + ' invited you to play a 1v1 match!';
            if ((m = normStr.match(/^Esperando a que (.+) acepte el desafío\.\.\.$/))) return 'Waiting for ' + m[1] + ' to accept the challenge...';
            if ((m = normStr.match(/^Esperando confirmación \((.+)\)\.\.\.$/))) return 'Waiting for confirmation (' + m[1] + ')...';
            if ((m = normStr.match(/^Esperando a (.+)\.\.\.$/))) return 'Waiting for ' + m[1] + '...';
            if ((m = normStr.match(/^Turno de (.+)$/))) return m[1] + "'s turn";
            if ((m = normStr.match(/^¡Ganó (.+)!$/))) return m[1] + ' won!';
        } else {
            if ((m = normStr.match(/^(🔥\s*\d+)\s+Days?$/i))) return m[1] + ' Días';
            if ((m = normStr.match(/^(\d+)\s+hits?$/i))) return m[1] + ' aciertos';
            if ((m = normStr.match(/^(\d+)\s+attempts?$/i))) return m[1] + ' intentos';
            if ((m = normStr.match(/^(\d+)\s+won$/i))) return m[1] + ' ganadas';
            if ((m = normStr.match(/^(\d+)\s+played$/i))) return m[1] + ' jugadas';
            if ((m = normStr.match(/^Turn:\s*Player\s+(\d+)$/i))) return 'Turno: Jugador ' + m[1];
            if ((m = normStr.match(/^Player\s+(\d+)\s+won\s+the\s+round!$/i))) return '¡Jugador ' + m[1] + ' ganó la ronda!';
            if ((m = normStr.match(/^Player\s+(\d+)\s+won!$/i))) return '¡Ganó el Jugador ' + m[1] + '!';
            if ((m = normStr.match(/^Player\s+1\s+(\d+)\s*-\s*(\d+)\s+Player\s+2$/i))) return 'Jugador 1  ' + m[1] + ' - ' + m[2] + '  Jugador 2';
            if ((m = normStr.match(/^You have a new friend request from (.+)!$/))) return '¡Tenes una nueva solicitud de amistad de ' + m[1] + '!';
            if ((m = normStr.match(/^(.+) invited you to play a 1v1 match!$/))) return '¡' + m[1] + ' te invitó a jugar una partida 1v1!';
            if ((m = normStr.match(/^Waiting for (.+) to accept the challenge\.\.\.$/))) return 'Esperando a que ' + m[1] + ' acepte el desafío...';
            if ((m = normStr.match(/^Waiting for confirmation \((.+)\)\.\.\.$/))) return 'Esperando confirmación (' + m[1] + ')...';
            if ((m = normStr.match(/^Waiting for (.+)\.\.\.$/))) return 'Esperando a ' + m[1] + '...';
            if ((m = normStr.match(/^(.+)'s turn$/))) return 'Turno de ' + m[1];
            if ((m = normStr.match(/^(.+) won!$/))) return '¡Ganó ' + m[1] + '!';
        }
        return null;
    }

    function translateTextString(rawStr, targetLang) {
        if (!rawStr) return null;
        var norm = normalizeI18nKey(rawStr);
        if (!norm) return null;

        var dict = targetLang === 'en' ? ES_TO_EN : EN_TO_ES;
        var translated = dict[norm];
        if (!translated) {
            translated = translateDynamicPattern(norm, targetLang);
        }
        if (!translated) return null;

        // Preserve leading and trailing whitespace around the text node
        var leadMatch = String(rawStr).match(/^\s*/);
        var trailMatch = String(rawStr).match(/\s*$/);
        var lead = leadMatch ? leadMatch[0] : '';
        var trail = trailMatch ? trailMatch[0] : '';
        return lead + translated + trail;
    }

    function shouldSkipElementForI18n(el) {
        if (!el || el.nodeType !== 1) return false;
        var tag = el.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'SVG') return true;
        // CRITICAL RULE: Never translate usernames, footballer names, or club names
        var id = el.id || '';
        if (id === 'profileUsername' || id === 'config-username' || id === 'user-display' ||
            id === 'autocomplete-results' || id === 'language-selector' ||
            id === 'score-team-1' || id === 'score-team-2') {
            return true;
        }
        if (el.classList && (
            el.classList.contains('friend-name') ||
            el.classList.contains('lb-username') ||
            el.classList.contains('profile-username') ||
            el.classList.contains('username-highlight') ||
            el.classList.contains('autocomplete-results') ||
            el.classList.contains('cell-mark') ||
            el.classList.contains('cond-top') ||
            el.classList.contains('cond-left') ||
            el.classList.contains('lang-segmented') ||
            el.classList.contains('lang-seg-btn')
        )) {
            return true;
        }
        if (el.closest && el.closest('#autocomplete-results, .friend-name, .lb-username, #profileUsername, #config-username, #user-display, #language-selector')) {
            return true;
        }
        return false;
    }

    var isApplyingI18n = false;

    function applyLanguageToRoot(rootEl, lang) {
        var targetLang = lang === 'en' ? 'en' : 'es';
        if (!rootEl) return;

        isApplyingI18n = true;
        try {
            document.documentElement.lang = targetLang;

            // 1. Translate document.title
            var newTitle = translateTextString(document.title, targetLang);
            if (newTitle) document.title = newTitle.trim();

            // 2. Walk text nodes without destroying child elements or event listeners
            var walker = document.createTreeWalker(
                rootEl,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function (node) {
                        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                        var parent = node.parentElement;
                        if (!parent || shouldSkipElementForI18n(parent)) return NodeFilter.FILTER_REJECT;
                        return NodeFilter.FILTER_ACCEPT;
                    }
                },
                false
            );

            var textNodes = [];
            var current;
            while ((current = walker.nextNode())) {
                textNodes.push(current);
            }

            for (var i = 0; i < textNodes.length; i++) {
                var tNode = textNodes[i];
                var updated = translateTextString(tNode.nodeValue, targetLang);
                if (updated !== null && updated !== tNode.nodeValue) {
                    tNode.nodeValue = updated;
                }
            }

            // 3. Translate input/textarea placeholders & aria-labels
            var inputs = rootEl.querySelectorAll ? rootEl.querySelectorAll('input[placeholder], textarea[placeholder]') : [];
            for (var j = 0; j < inputs.length; j++) {
                var inp = inputs[j];
                var ph = inp.getAttribute('placeholder');
                var newPh = translateTextString(ph, targetLang);
                if (newPh !== null && newPh.trim() !== ph) {
                    inp.setAttribute('placeholder', newPh.trim());
                }
            }

            // 4. Sync #toggle-english switch & #language-selector UI if present
            var toggleEng = document.getElementById('toggle-english');
            if (toggleEng) {
                toggleEng.checked = (targetLang === 'en');
            }
            var selector = document.getElementById('language-selector');
            if (selector) {
                selector.dataset.value = targetLang;
                var btns = selector.querySelectorAll('.lang-seg-btn[data-lang]');
                for (var k = 0; k < btns.length; k++) {
                    var isActive = btns[k].getAttribute('data-lang') === targetLang;
                    btns[k].classList.toggle('is-active', isActive);
                    btns[k].setAttribute('aria-pressed', String(isActive));
                }
            }
        } finally {
            isApplyingI18n = false;
        }
    }

    function applyLanguage(lang) {
        var isEng = (lang === true || lang === 'en' || (lang === undefined && isEnglishStored()));
        var targetLang = isEng ? 'en' : 'es';
        document.documentElement.lang = targetLang;
        if (document.body) {
            applyLanguageToRoot(document.body, targetLang);
        }
    }

    function setLanguage(lang) {
        var isEng = (lang === true || lang === 'en');
        var normLang = isEng ? 'en' : 'es';
        try {
            localStorage.setItem(IS_ENGLISH_KEY, String(isEng));
            localStorage.setItem(LANG_KEY, normLang);
        } catch (e) {}
        applyLanguage(normLang);
        try {
            window.dispatchEvent(new CustomEvent('footlel:language-changed', {
                detail: { lang: normLang, isEnglish: isEng }
            }));
        } catch (e) {}
        return normLang;
    }

    function translateHelper(text) {
        var lang = getLanguage();
        var res = translateTextString(text, lang);
        return res !== null ? res.trim() : text;
    }

    function setupLanguageObserver() {
        if (!document.body || window.__footlelI18nObserver) return;
        var observer = new MutationObserver(function (mutations) {
            if (isApplyingI18n) return;
            var currentLang = getLanguage();
            if (currentLang !== 'en') return;
            for (var i = 0; i < mutations.length; i++) {
                var m = mutations[i];
                if (m.type === 'childList' && m.addedNodes && m.addedNodes.length > 0) {
                    applyLanguageToRoot(document.body, 'en');
                    return;
                }
                if (m.type === 'characterData' && m.target && m.target.nodeType === 3) {
                    var parent = m.target.parentElement;
                    if (parent && !shouldSkipElementForI18n(parent)) {
                        var tr = translateTextString(m.target.nodeValue, 'en');
                        if (tr !== null && tr !== m.target.nodeValue) {
                            isApplyingI18n = true;
                            m.target.nodeValue = tr;
                            isApplyingI18n = false;
                        }
                    }
                }
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
        window.__footlelI18nObserver = observer;
    }

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

    /* Applies a theme to <html> and <body> (if it already exists) + logo + toggle. */
    function applyTheme(isLight) {
        var light = Boolean(isLight);
        document.documentElement.classList.toggle('light-mode', light);
        if (document.body) {
            document.body.classList.toggle('light-mode', light);
            syncLogo(light);
            var toggleDark = document.getElementById('toggle-dark') || document.getElementById('toggle-dark-mode');
            if (toggleDark) toggleDark.checked = !light;
        }
    }

    function applyAnimations(disabled) {
        var off = Boolean(disabled);
        document.documentElement.classList.toggle('disable-animations', off);
        if (document.body) {
            document.body.classList.toggle('disable-animations', off);
            var toggleAnim = document.getElementById('toggle-animaciones') || document.getElementById('toggle-animations');
            if (toggleAnim) toggleAnim.checked = off;
        }
    }

    function applyCompatibility(enabled) {
        var on = Boolean(enabled);
        document.documentElement.classList.toggle('compatibility-mode', on);
        if (document.body) {
            document.body.classList.toggle('compatibility-mode', on);
            var toggleCompat = document.getElementById('toggle-compat') || document.getElementById('toggle-compatibility');
            if (toggleCompat) toggleCompat.checked = on;
        }
    }

    /* Re-reads localStorage and applies everything. */
    function applyFromStorage() {
        applyTheme(isLightStored());
        applyAnimations(isAnimDisabledStored());
        applyCompatibility(readCompatStored());
        applyLanguage(getLanguage());
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

    /* GET /config/get-user-config (whenever footlel_token exists). */
    function fetchUserConfig() {
        var token = (readStorage('footlel_token') || '').trim();
        if (!token || token === 'null' || token === 'undefined') return Promise.resolve(null);
        return fetch(getApiBaseUrl() + '/config/get-user-config', {
            headers: { 'Authorization': 'Bearer ' + token }
        }).then(function (r) { return r.ok ? r.json() : null; })
          .catch(function () { return null; });
    }

    /* PATCH /config/set-user-config, always sends the full object with the 4 states. */
    function saveUserConfig(darkModeState, animationState, compatibilityState, isEnglishState) {
        var token = (readStorage('footlel_token') || '').trim();
        if (!token || token === 'null' || token === 'undefined') return Promise.resolve(null);
        var resolvedIsEnglish = (typeof isEnglishState === 'boolean') ? isEnglishState : isEnglishStored();
        return fetch(getApiBaseUrl() + '/config/set-user-config', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                dark_mode: Boolean(darkModeState),
                animation_state: Boolean(animationState),
                compatibility_mode: Boolean(compatibilityState),
                is_english: Boolean(resolvedIsEnglish)
            })
        });
    }

    /* Current states from localStorage, with one override applied. */
    function saveCurrentConfig(overrides) {
        var o = overrides || {};
        var dark = ('dark' in o) ? o.dark : !isLightStored();
        var anim = ('anim' in o) ? o.anim : isAnimDisabledStored();
        var compat = ('compat' in o) ? o.compat : readCompatStored();
        var isEnglish = ('is_english' in o) ? o.is_english : (('isEnglish' in o) ? o.isEnglish : isEnglishStored());
        return saveUserConfig(dark, anim, compat, isEnglish);
    }

    /* Pulls the backend config into localStorage and applies it. */
    function syncConfigFromBackend() {
        // Call fetchUserConfig() which performs GET /config/get-user-config with Bearer token
        return fetchUserConfig().then(function (cfg) {
            // If no config returned (no token or network error), exit gracefully
            if (!cfg) return null;
            try {
                // Save dark_mode boolean from backend as 'dark' or 'light' in localStorage
                if (typeof cfg.dark_mode === 'boolean') {
                    localStorage.setItem(THEME_KEY, cfg.dark_mode ? 'dark' : 'light');
                    localStorage.setItem('footlel_dark_mode', String(cfg.dark_mode));
                }
                // Save animation_state boolean from backend as string in localStorage
                if (typeof cfg.animation_state === 'boolean') {
                    localStorage.setItem(ANIM_KEY, String(cfg.animation_state));
                    localStorage.setItem('footlel_animation_state', String(cfg.animation_state));
                }
                // Save compatibility_mode boolean from backend as string in localStorage
                if (typeof cfg.compatibility_mode === 'boolean') {
                    localStorage.setItem('pref_toggle-compat', String(cfg.compatibility_mode));
                    localStorage.setItem('footlel_compatibility_mode', String(cfg.compatibility_mode));
                }
                // Save is_english boolean from backend in localStorage (RNF5)
                if (typeof cfg.is_english === 'boolean') {
                    localStorage.setItem(IS_ENGLISH_KEY, String(cfg.is_english));
                    localStorage.setItem(LANG_KEY, cfg.is_english ? 'en' : 'es');
                }
            } catch (e) {}
            // Re-apply CSS classes (.light-mode, .disable-animations, .compatibility-mode), logo, language and toggles from updated localStorage
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
        applyCompatibility: applyCompatibility,
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
        getLanguage: getLanguage,
        setLanguage: setLanguage,
        applyLanguage: applyLanguage,
        t: translateHelper,
        setDarkModeState: function (state) { return saveCurrentConfig({ dark: state }); },
        setAnimationState: function (state) { return saveCurrentConfig({ anim: state }); },
        setCompatibilityState: function (state) { return saveCurrentConfig({ compat: state }); },
        setEnglishState: function (state) { return saveCurrentConfig({ is_english: state }); }
    };

    /* Immediately (<html> always exists, avoids flash of wrong theme). */
    applyFromStorage();

    /* Once <body> exists. */
    document.addEventListener('DOMContentLoaded', function () {
        // 1. Apply stored preferences immediately once body is available (zero flicker)
        applyFromStorage();
        // 1b. Observe dynamic DOM text updates for active language (RNF5)
        setupLanguageObserver();
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
        if (e.key === THEME_KEY || e.key === ANIM_KEY || e.key === LANG_KEY || e.key === IS_ENGLISH_KEY || e.key === null) applyFromStorage();
    });
})();