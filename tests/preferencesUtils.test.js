/**
 * FOOTLEL — Pruebas Unitarias: Preferencias y Estado de Partida
 * tests/preferencesUtils.test.js
 *
 * Técnicas aplicadas:
 * 1. Clases de Equivalencia
 * 2. Valores Límite (Bordes)
 * 3. Camino Feliz vs. Camino de Error
 */

import {
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
    getOrAssignAvatar
} from '../services/preferencesUtils.js';

describe('Suite de Preferencias y Estado de Partida (preferencesUtils.js)', () => {

    /* ==========================================================================
       TÉCNICA 1: CLASES DE EQUIVALENCIA (EQUIVALENCE PARTITIONING)
       ========================================================================== */
    describe('Técnica 1: Clases de Equivalencia', () => {

        describe('Resolución de Estado de Tema (resolveThemeState)', () => {
            test('[Clase Tema Claro] Valor almacenado "light" activa modo claro', () => {
                const res = resolveThemeState('light');
                expect(res.isLight).toBe(true);
                expect(res.themeClass).toBe('light-mode');
            });

            test('[Clase Tema Oscuro] Valor almacenado "dark" activa modo oscuro predeterminado', () => {
                const res = resolveThemeState('dark');
                expect(res.isLight).toBe(false);
                expect(res.themeClass).toBe('dark-mode');
            });

            test('[Clase Nula / Predeterminada] Valor nulo o desconocido usa modo oscuro', () => {
                const res = resolveThemeState(null);
                expect(res.isLight).toBe(false);
                expect(res.themeClass).toBe('dark-mode');
            });
        });

        describe('Resolución de Animaciones (resolveAnimationState)', () => {
            test('[Clase Animaciones Desactivadas] Valor "true"', () => {
                const res = resolveAnimationState('true');
                expect(res.animationsDisabled).toBe(true);
                expect(res.animClass).toBe('disable-animations');
            });

            test('[Clase Animaciones Activadas] Valor "false" o nulo', () => {
                expect(resolveAnimationState('false').animationsDisabled).toBe(false);
                expect(resolveAnimationState(null).animationsDisabled).toBe(false);
            });
        });

        describe('Constantes de Almacenamiento', () => {
            test('Claves de almacenamiento requeridas por la cátedra coinciden exactamente', () => {
                expect(THEME_KEY).toBe('footlel_theme');
                expect(ANIM_KEY).toBe('pref_toggle-animaciones');
                expect(COMPAT_KEY).toBe('pref_toggle-compat');
            });

            test('Catálogo base posee los 6 avatares robot solicitados', () => {
                expect(BASE_ROBOT_AVATARS.length).toBe(6);
                BASE_ROBOT_AVATARS.forEach(url => {
                    expect(url).toContain('https://api.dicebear.com/8.x/bottts/svg');
                });
            });
        });

        describe('Extracción de Identificador de Partida (extractGameId)', () => {
            test('[Clase Válida] game_id directo numérico', () => {
                expect(extractGameId({ game_id: 104 })).toBe(104);
            });

            test('[Clase Válida] game_id dentro de data anidada', () => {
                expect(extractGameId({ data: { game_id: 205 } })).toBe(205);
            });

            test('[Clase Válida] id numérico alternativo', () => {
                expect(extractGameId({ id: 308 })).toBe(308);
            });

            test('[Clase Válida] game_id provisto como string numérico', () => {
                expect(extractGameId({ game_id: '450' })).toBe(450);
            });

            test('[Clase Inválida] Argumentos nulos o sin game_id válido', () => {
                expect(extractGameId(null)).toBeNull();
                expect(extractGameId({})).toBeNull();
                expect(extractGameId('no-es-objeto')).toBeNull();
            });
        });
    });

    /* ==========================================================================
       TÉCNICA 2: VALORES LÍMITE / BORDES (BOUNDARY VALUE ANALYSIS)
       ========================================================================== */
    describe('Técnica 2: Valores Límite (BVA)', () => {

        describe('Límites del Generador Aleatorio de Avatar (pickRandomRobotAvatar)', () => {
            test('[Borde Inferior Exacto] Generador retorna 0.0 -> primer avatar (índice 0)', () => {
                const avatar = pickRandomRobotAvatar(() => 0.0);
                expect(avatar).toBe(BASE_ROBOT_AVATARS[0]);
            });

            test('[Borde Superior Exacto] Generador retorna 0.9999 -> último avatar (índice 5)', () => {
                const avatar = pickRandomRobotAvatar(() => 0.9999);
                expect(avatar).toBe(BASE_ROBOT_AVATARS[5]);
            });

            test('[Borde Fuera de Rango Superior] Manejo seguro si rng retorna >= 1.0', () => {
                const avatar = pickRandomRobotAvatar(() => 1.5);
                expect(avatar).toBe(BASE_ROBOT_AVATARS[5]);
            });
        });

        describe('Límites de ID de Partida en extractGameId', () => {
            test('[Borde 0] ID igual a 0 (inválido)', () => {
                expect(extractGameId({ game_id: 0 })).toBeNull();
            });

            test('[Borde 1] ID mínimo válido (1)', () => {
                expect(extractGameId({ game_id: 1 })).toBe(1);
            });

            test('[Borde Negativo] ID negativo (-1) -> inválido', () => {
                expect(extractGameId({ game_id: -1 })).toBeNull();
            });
        });

        describe('Límites de Detección de Tablero en isMatchStarted', () => {
            test('[Borde Inferior de Matriz] Matriz de exactamente 2 filas y 3 columnas con match_started', () => {
                const data = {
                    match_started: true,
                    board: [
                        [1, 2, 3],
                        [4, 5, 6]
                    ]
                };
                expect(isMatchStarted(data)).toBe(true);
            });

            test('[Borde Incompleto] Matriz con sólo 1 fila (insuficiente)', () => {
                const data = {
                    match_started: true,
                    board: [
                        [1, 2, 3]
                    ]
                };
                expect(isMatchStarted(data)).toBe(false);
            });
        });
    });

    /* ==========================================================================
       TÉCNICA 3: CAMINO FELIZ VS. CAMINO DE ERROR (HAPPY PATH VS. ERROR PATH)
       ========================================================================== */
    describe('Técnica 3: Camino Feliz vs. Camino de Error', () => {

        describe('Parseo de Solicitudes de Amistad y Desafíos (parseMatchRequestNames)', () => {
            test('[Camino Feliz] Array de objetos con diferentes propiedades de nombre y duplicados', () => {
                const payload = [
                    { user_name: '@Messi' },
                    { friend_name: 'messi' }, // Duplicado case-insensitive
                    { challenger_name: '@DiMaria' },
                    { username: 'Dibu' }
                ];
                const result = parseMatchRequestNames(payload);
                expect(result).toEqual(['Messi', 'DiMaria', 'Dibu']);
            });

            test('[Camino Feliz] Objeto anidado con clave match_request_names', () => {
                const payload = {
                    match_request_names: ['@Scaloni', 'Aimar']
                };
                const result = parseMatchRequestNames(payload);
                expect(result).toEqual(['Scaloni', 'Aimar']);
            });

            test('[Camino Feliz] Objeto con clave anidada data', () => {
                const payload = {
                    data: {
                        friend_request_names: ['@Tagliafico']
                    }
                };
                const result = parseMatchRequestNames(payload);
                expect(result).toEqual(['Tagliafico']);
            });

            test('[Camino de Error] Entrada nula, vacía o tipo primitivo', () => {
                expect(parseMatchRequestNames(null)).toEqual([]);
                expect(parseMatchRequestNames(undefined)).toEqual([]);
                expect(parseMatchRequestNames('cadena')).toEqual([]);
            });
        });

        describe('Estado de Inicio de Partida Online (isMatchStarted)', () => {
            test('[Camino Feliz] Objeto con match_started: true y cabeceras de fila', () => {
                const matchData = {
                    match_started: true,
                    row_headers: ['Argentina', 'Brasil', 'Francia']
                };
                expect(isMatchStarted(matchData)).toBe(true);
            });

            test('[Camino Feliz] Objeto con game_id válido y board estructurado', () => {
                const matchData = {
                    game_id: 88,
                    board: [
                        [0, 0, 0],
                        [0, 0, 0],
                        [0, 0, 0]
                    ]
                };
                expect(isMatchStarted(matchData)).toBe(true);
            });

            test('[Camino de Error] match_started explícitamente false', () => {
                const matchData = {
                    match_started: false,
                    game_id: 50
                };
                expect(isMatchStarted(matchData)).toBe(false);
            });

            test('[Camino de Error] Entrada nula o vacía', () => {
                expect(isMatchStarted(null)).toBe(false);
                expect(isMatchStarted({})).toBe(false);
            });
        });

        describe('Gestión y Asignación de Avatares (getOrAssignAvatar)', () => {
            // Mock simple de Storage en memoria
            function createMockStorage(initial = {}) {
                const store = { ...initial };
                return {
                    getItem: jest.fn(k => store[k] ?? null),
                    setItem: jest.fn((k, v) => { store[k] = v; }),
                    _store: store
                };
            }

            test('[Camino Feliz] Usuario registrado que ya tiene un avatar personalizado guardado', () => {
                const existingAvatar = BASE_ROBOT_AVATARS[2];
                const storage = createMockStorage({
                    footlel_username: 'leomessi',
                    footlel_avatar_leomessi: existingAvatar
                });

                const result = getOrAssignAvatar('leomessi', false, storage);
                expect(result).toBe(existingAvatar);
            });

            test('[Camino Feliz] Usuario registrado nuevo (sin avatar previo): le asigna uno de los 6 robots', () => {
                const storage = createMockStorage({
                    footlel_username: 'nuevousuario'
                });

                const result = getOrAssignAvatar('nuevousuario', false, storage);
                expect(BASE_ROBOT_AVATARS).toContain(result);
                expect(storage.setItem).toHaveBeenCalledWith('footlel_avatar_nuevousuario', result);
                expect(storage.setItem).toHaveBeenCalledWith('footlel_avatar', result);
            });

            test('[Camino Feliz] Sesión de invitado sin avatar: asigna y guarda avatar de invitado', () => {
                const storage = createMockStorage();
                const result = getOrAssignAvatar('', true, storage);
                expect(BASE_ROBOT_AVATARS).toContain(result);
                expect(storage.setItem).toHaveBeenCalledWith('footlel_guest_avatar', result);
            });

            test('[Camino de Error] Storage no disponible: retorna fallback sin lanzar excepción', () => {
                const result = getOrAssignAvatar('usuario', false, null);
                expect(result).toBe(BASE_ROBOT_AVATARS[0]);
            });
        });
    });
});
