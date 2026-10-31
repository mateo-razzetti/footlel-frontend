/**
 * FOOTLEL — Pruebas Unitarias: Manipulación y Formateo de Cadenas
 * tests/stringUtils.test.js
 *
 * Técnicas aplicadas:
 * 1. Clases de Equivalencia
 * 2. Valores Límite (Bordes)
 * 3. Camino Feliz vs. Camino de Error
 */

import {
    cleanUsername,
    formatGuestName,
    formatBackendError,
    normalizeSearchText,
    parsePlayerRosterText,
    extractGuestToken,
    decodeJwtSub,
    extractGuestName
} from '../services/stringUtils.js';

describe('Suite de Utilidades de Cadenas (stringUtils.js)', () => {

    /* ==========================================================================
       TÉCNICA 1: CLASES DE EQUIVALENCIA (EQUIVALENCE PARTITIONING)
       ========================================================================== */
    describe('Técnica 1: Clases de Equivalencia', () => {

        describe('Limpieza de Arroba en Nombres de Usuario (cleanUsername)', () => {
            test('[Clase Válida] Nombre estándar sin arroba', () => {
                expect(cleanUsername('julianalvarez')).toBe('julianalvarez');
            });

            test('[Clase Válida] Nombre con arroba inicial', () => {
                expect(cleanUsername('@julianalvarez')).toBe('julianalvarez');
            });

            test('[Clase Válida] Nombre con espacios alrededor y arroba', () => {
                expect(cleanUsername('   @dibu_martinez   ')).toBe('dibu_martinez');
            });

            test('[Clase Válida] Objeto que contiene user_name, username o friend_name', () => {
                expect(cleanUsername({ user_name: '@scaloni' })).toBe('scaloni');
                expect(cleanUsername({ username: '@lautaro' })).toBe('lautaro');
                expect(cleanUsername({ friend_name: '@cuti' })).toBe('cuti');
            });

            test('[Clase Inválida / Vacía] Argumentos nulos, indefinidos o vacíos', () => {
                expect(cleanUsername(null)).toBe('');
                expect(cleanUsername(undefined)).toBe('');
                expect(cleanUsername('')).toBe('');
            });
        });

        describe('Formateo de Nombre de Invitado (formatGuestName)', () => {
            test('[Clase Válida] ID puramente numérico (se convierte a Guest_ID)', () => {
                expect(formatGuestName('84729')).toBe('Guest_84729');
                expect(formatGuestName(1234)).toBe('Guest_1234');
            });

            test('[Clase Válida] Nombre alfanumérico ya existente', () => {
                expect(formatGuestName('Invitado_Pro')).toBe('Invitado_Pro');
            });

            test('[Clase Inválida] Nulo, indefinido o cadenas textuales "null" o "undefined"', () => {
                expect(formatGuestName(null)).toBeNull();
                expect(formatGuestName(undefined)).toBeNull();
                expect(formatGuestName('')).toBeNull();
                expect(formatGuestName('   ')).toBeNull();
                expect(formatGuestName('null')).toBeNull();
                expect(formatGuestName('undefined')).toBeNull();
            });
        });

        describe('Normalización de Texto de Búsqueda (normalizeSearchText)', () => {
            test('[Clase Válida] Palabras con tildes y mayúsculas variadas', () => {
                expect(normalizeSearchText('Ángel Di María')).toBe('angel di maria');
                expect(normalizeSearchText('LÉO MESSI')).toBe('leo messi');
            });

            test('[Clase Válida] Palabras con diéresis o caracteres combinados', () => {
                expect(normalizeSearchText('Agüero')).toBe('aguero');
            });

            test('[Clase Inválida] Valores nulos o indefinidos', () => {
                expect(normalizeSearchText(null)).toBe('');
                expect(normalizeSearchText(undefined)).toBe('');
            });
        });

        describe('Extracción de Token de Invitado (extractGuestToken)', () => {
            const validJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NSJ9.signature';

            test('[Clase Válida] String con estructura JWT válida', () => {
                expect(extractGuestToken(validJwt)).toBe(validJwt);
            });

            test('[Clase Válida] Objeto con propiedad access_token, token o jwt', () => {
                expect(extractGuestToken({ access_token: validJwt })).toBe(validJwt);
                expect(extractGuestToken({ token: validJwt })).toBe(validJwt);
                expect(extractGuestToken({ jwt: validJwt })).toBe(validJwt);
                expect(extractGuestToken({ data: { token: validJwt } })).toBe(validJwt);
            });

            test('[Clase Inválida] Datos nulos o strings que no son tokens válidos', () => {
                expect(extractGuestToken(null)).toBeNull();
                expect(extractGuestToken('string-comun-no-jwt')).toBeNull();
                expect(extractGuestToken({})).toBeNull();
            });
        });
    });

    /* ==========================================================================
       TÉCNICA 2: VALORES LÍMITE / BORDES (BOUNDARY VALUE ANALYSIS)
       ========================================================================== */
    describe('Técnica 2: Valores Límite (BVA)', () => {

        describe('Límite de Cantidad de Arrobas en cleanUsername', () => {
            test('[Borde 0] Sin arrobas al inicio', () => {
                expect(cleanUsername('rodrigo_depaul')).toBe('rodrigo_depaul');
            });

            test('[Borde 1] Exactamente 1 arroba al inicio', () => {
                expect(cleanUsername('@rodrigo_depaul')).toBe('rodrigo_depaul');
            });

            test('[Borde Múltiple] Múltiples arrobas consecutivas al inicio', () => {
                expect(cleanUsername('@@@@rodrigo_depaul')).toBe('rodrigo_depaul');
            });
        });

        describe('Límites de Longitud y Caracteres de formatBackendError', () => {
            test('[Borde Vacío] Longitud 0 (retorna mensaje fallback predeterminado)', () => {
                expect(formatBackendError('')).toBe('Ocurrió un error inesperado.');
                expect(formatBackendError(null)).toBe('Ocurrió un error inesperado.');
            });

            test('[Borde Mínimo 1 carácter] Entrada de 1 sola letra', () => {
                expect(formatBackendError('e')).toBe('E.');
            });

            test('[Borde Puntuación] Mensaje que ya finaliza con punto', () => {
                const res = formatBackendError('El usuario ya existe.');
                expect(res).toBe('El usuario ya existe.');
                expect(res.endsWith('..')).toBe(false); // No duplica el punto final
            });

            test('[Borde Puntuación] Mensaje que finaliza con signo de exclamación', () => {
                const res = formatBackendError('¡Operación completada!');
                expect(res).toBe('¡Operación completada!');
            });
        });

        describe('Límites en formatGuestName', () => {
            test('[Borde Numérico Mínimo] ID numérico de 1 dígito (0)', () => {
                expect(formatGuestName('0')).toBe('Guest_0');
            });

            test('[Borde Numérico Grande] ID numérico de 10 dígitos', () => {
                expect(formatGuestName('1790367964')).toBe('Guest_1790367964');
            });
        });
    });

    /* ==========================================================================
       TÉCNICA 3: CAMINO FELIZ VS. CAMINO DE ERROR (HAPPY PATH VS. ERROR PATH)
       ========================================================================== */
    describe('Técnica 3: Camino Feliz vs. Camino de Error', () => {

        describe('Formateo de Errores de Backend (formatBackendError)', () => {
            test('[Camino Feliz] JSON stringificado con campo detail', () => {
                const raw = JSON.stringify({ detail: 'contrasenia invalida' });
                expect(formatBackendError(raw)).toBe('Contraseña inválida.');
            });

            test('[Camino Feliz] JSON stringificado con campo message', () => {
                const raw = JSON.stringify({ message: 'codigo invalido' });
                expect(formatBackendError(raw)).toBe('Código inválido.');
            });

            test('[Camino Feliz] Quita prefijo técnico redundante y normaliza acentos', () => {
                expect(formatBackendError('error de login: usuario invalido'))
                    .toBe('Usuario inválido.');
                expect(formatBackendError('error de registro: correo electronico ya registrado'))
                    .toBe('Correo electrónico ya registrado.');
            });

            test('[Camino Feliz] Corrección de palabras técnicas de la cátedra (sesion, verificacion, manana, exito)', () => {
                const raw = 'error: sesion expirada, intente manana con exito y verificacion';
                expect(formatBackendError(raw))
                    .toBe('Sesión expirada, intente mañana con éxito y verificación.');
            });

            test('[Camino de Error] JSON malformado (debe manejar la excepción y procesar como texto plano)', () => {
                const brokenJson = '{"detail": error incompleto sin cerrar';
                const formatted = formatBackendError(brokenJson);
                expect(formatted).toBe('{"detail": error incompleto sin cerrar.');
            });

            test('[Camino de Error] Entrada undefined o null', () => {
                expect(formatBackendError(undefined)).toBe('Ocurrió un error inesperado.');
            });
        });

        describe('Decodificación de Token JWT (decodeJwtSub)', () => {
            test('[Camino Feliz] Token JWT con payload y sub válido', () => {
                // Payload: { "sub": "usuario_test_10" }
                const base64Payload = Buffer.from(JSON.stringify({ sub: 'usuario_test_10' })).toString('base64');
                const jwt = `header.${base64Payload}.signature`;
                expect(decodeJwtSub(jwt)).toBe('usuario_test_10');
            });

            test('[Camino Feliz] Token con user_id o user_name en el payload', () => {
                const base64Payload = Buffer.from(JSON.stringify({ user_name: 'enzo_fernandez' })).toString('base64');
                const jwt = `header.${base64Payload}.signature`;
                expect(decodeJwtSub(jwt)).toBe('enzo_fernandez');
            });

            test('[Camino de Error] Token con formato roto (menos de 2 partes o payload corrupto)', () => {
                expect(decodeJwtSub('token-invalido')).toBeNull();
                expect(decodeJwtSub('parte1.base64-no-valido-@@@')).toBeNull();
                expect(decodeJwtSub(null)).toBeNull();
            });
        });

        describe('Extracción de Nombres de Invitado (extractGuestName)', () => {
            test('[Camino Feliz] Objeto de invitado con user_strid numérico', () => {
                expect(extractGuestName({ user_strid: '5566' })).toBe('Guest_5566');
            });

            test('[Camino Feliz] String alfanumérico no numérico', () => {
                expect(extractGuestName('Jugador_Invitado')).toBe('Jugador_Invitado');
            });

            test('[Camino de Error] String que es un JWT en lugar de un nombre (debe retornar null)', () => {
                const jwt = 'header.payload.signature';
                expect(extractGuestName(jwt)).toBeNull();
            });

            test('[Camino de Error] Objeto con result: "success" (no es nombre)', () => {
                expect(extractGuestName({ result: 'success' })).toBeNull();
            });
        });

        describe('Parseo de Roster de Jugadores (parsePlayerRosterText)', () => {
            test('[Camino Feliz] Contenido CSV con cabecera y nombres válidos', () => {
                const csvData = `player_name,club,country\n"Lionel Messi",Inter Miami,Argentina\n"Kylian Mbappé",Real Madrid,France\n"Lionel Messi",Barcelona,Argentina`;
                const roster = parsePlayerRosterText(csvData);
                expect(roster).toEqual(['Lionel Messi', 'Kylian Mbappé']);
                expect(roster.length).toBe(2); // Deduplicado y sin cabecera
            });

            test('[Camino Feliz] Contenido en texto plano línea por línea', () => {
                const textData = `Julián Álvarez\nLautaro Martínez\nJulián Álvarez\n`;
                const roster = parsePlayerRosterText(textData);
                expect(roster).toEqual(['Julián Álvarez', 'Lautaro Martínez']);
            });

            test('[Camino de Error] Texto vacío o no string', () => {
                expect(parsePlayerRosterText('')).toEqual([]);
                expect(parsePlayerRosterText(null)).toEqual([]);
            });
        });
    });
});
