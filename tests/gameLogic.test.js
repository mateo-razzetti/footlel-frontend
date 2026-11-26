/**
 * FOOTLEL — Pruebas Unitarias: Lógica de Tablero y Reglas de Juego
 * tests/gameLogic.test.js
 *
 * Técnicas aplicadas:
 * 1. Clases de Equivalencia
 * 2. Valores Límite (Bordes)
 * 3. Camino Feliz vs. Camino de Error
 */

import {
    createEmptyBoard,
    checkWinCondition,
    isBoardFull,
    checkDrawCondition,
    switchActivePlayer,
    calculateRoundsToWin,
    isDecisiveRound,
    checkMatchWinner,
    normalizeServerCellValue,
    resolveCellCoordinates,
    isValidMove,
    placeMove,
    formatTimerDisplay,
    DEFAULT_MAX_ROUNDS
} from '../services/gameLogic.js';

describe('Suite de Lógica de Tablero y Tateti (gameLogic.js)', () => {

    /* ==========================================================================
       TÉCNICA 1: CLASES DE EQUIVALENCIA (EQUIVALENCE PARTITIONING)
       ========================================================================== */
    describe('Técnica 1: Clases de Equivalencia', () => {

        describe('Detección de Victoria en el Tablero (checkWinCondition)', () => {
            test('[Clase Válida] Victoria en fila 0 para Jugador 1', () => {
                const board = [
                    [1, 1, 1],
                    [2, 0, 2],
                    [0, 0, 0]
                ];
                expect(checkWinCondition(board, 1)).toBe(true);
                expect(checkWinCondition(board, 2)).toBe(false);
            });

            test('[Clase Válida] Victoria en fila 1 para Jugador 2', () => {
                const board = [
                    [1, 0, 1],
                    [2, 2, 2],
                    [0, 1, 0]
                ];
                expect(checkWinCondition(board, 2)).toBe(true);
            });

            test('[Clase Válida] Victoria en columna 2 para Jugador 1', () => {
                const board = [
                    [0, 2, 1],
                    [2, 0, 1],
                    [0, 2, 1]
                ];
                expect(checkWinCondition(board, 1)).toBe(true);
            });

            test('[Clase Válida] Victoria en diagonal principal para Jugador 1', () => {
                const board = [
                    [1, 2, 0],
                    [0, 1, 2],
                    [0, 2, 1]
                ];
                expect(checkWinCondition(board, 1)).toBe(true);
            });

            test('[Clase Válida] Victoria en diagonal secundaria para Jugador 2', () => {
                const board = [
                    [1, 1, 2],
                    [1, 2, 0],
                    [2, 0, 1]
                ];
                expect(checkWinCondition(board, 2)).toBe(true);
            });

            test('[Clase No Ganadora] Tablero vacío o sin tres en línea', () => {
                const board = createEmptyBoard();
                expect(checkWinCondition(board, 1)).toBe(false);
                expect(checkWinCondition(board, 2)).toBe(false);
            });

            test('[Clase Inválida] Argumento board nulo o malformado', () => {
                expect(checkWinCondition(null, 1)).toBe(false);
                expect(checkWinCondition([1, 2, 3], 1)).toBe(false);
            });
        });

        describe('Condición de Empate (checkDrawCondition)', () => {
            test('[Clase Válida: Empate] Tablero completo de 9 celdas sin ningún ganador', () => {
                const drawBoard = [
                    [1, 2, 1],
                    [1, 2, 2],
                    [2, 1, 1]
                ];
                expect(isBoardFull(drawBoard)).toBe(true);
                expect(checkWinCondition(drawBoard, 1)).toBe(false);
                expect(checkWinCondition(drawBoard, 2)).toBe(false);
                expect(checkDrawCondition(drawBoard)).toBe(true);
            });

            test('[Clase Inválida para Empate] Tablero completo pero con ganador (no es empate)', () => {
                const wonBoard = [
                    [1, 1, 1],
                    [2, 2, 1],
                    [2, 1, 2]
                ];
                expect(isBoardFull(wonBoard)).toBe(true);
                expect(checkDrawCondition(wonBoard)).toBe(false);
            });

            test('[Clase Inválida para Empate] Tablero incompleto con celdas vacías', () => {
                const partialBoard = [
                    [1, 2, 0],
                    [0, 1, 2],
                    [2, 0, 1]
                ];
                expect(checkDrawCondition(partialBoard)).toBe(false);
            });
        });

        describe('Alternancia de Jugador Activo (switchActivePlayer)', () => {
            test('[Clase Válida] Jugador 1 pasa a Jugador 2', () => {
                expect(switchActivePlayer(1)).toBe(2);
            });

            test('[Clase Válida] Jugador 2 pasa a Jugador 1', () => {
                expect(switchActivePlayer(2)).toBe(1);
            });

            test('[Clase Inválida] Cualquier otro valor retorna Jugador 1 por defecto', () => {
                expect(switchActivePlayer(0)).toBe(1);
                expect(switchActivePlayer(undefined)).toBe(1);
            });
        });

        describe('Normalización de Valores de Servidor (normalizeServerCellValue)', () => {
            test('[Clase Jugador 1] 1, "1", "X", "x"', () => {
                expect(normalizeServerCellValue(1)).toBe(1);
                expect(normalizeServerCellValue('1')).toBe(1);
                expect(normalizeServerCellValue('X')).toBe(1);
                expect(normalizeServerCellValue('x')).toBe(1);
            });

            test('[Clase Jugador 2 / Bot] -1, 2, "-1", "2", "O", "o"', () => {
                expect(normalizeServerCellValue(-1)).toBe(2);
                expect(normalizeServerCellValue(2)).toBe(2);
                expect(normalizeServerCellValue('-1')).toBe(2);
                expect(normalizeServerCellValue('2')).toBe(2);
                expect(normalizeServerCellValue('O')).toBe(2);
                expect(normalizeServerCellValue('o')).toBe(2);
            });

            test('[Clase Vacía / Inexistente] 0, nulos, cadenas no reconocidas', () => {
                expect(normalizeServerCellValue(0)).toBe(0);
                expect(normalizeServerCellValue(null)).toBe(0);
                expect(normalizeServerCellValue('?')).toBe(0);
            });
        });
    });

    /* ==========================================================================
       TÉCNICA 2: VALORES LÍMITE / BORDES (BOUNDARY VALUE ANALYSIS)
       ========================================================================== */
    describe('Técnica 2: Valores Límite (BVA)', () => {

        describe('Límites de Índice a Coordenadas (resolveCellCoordinates)', () => {
            test('[Borde Inferior - 1] Índice negativo (-1) -> null', () => {
                expect(resolveCellCoordinates(-1)).toBeNull();
            });

            test('[Borde Inferior Exacto] Índice 0 -> primera celda (fila 0, col 0)', () => {
                expect(resolveCellCoordinates(0)).toEqual({ row: 0, col: 0 });
            });

            test('[Borde Superior Exacto] Índice 8 -> última celda (fila 2, col 2)', () => {
                expect(resolveCellCoordinates(8)).toEqual({ row: 2, col: 2 });
            });

            test('[Borde Superior + 1] Índice 9 -> fuera de límites (null)', () => {
                expect(resolveCellCoordinates(9)).toBeNull();
            });

            test('[Entrada no numérica o decimal]', () => {
                expect(resolveCellCoordinates(4.5)).toBeNull();
                expect(resolveCellCoordinates('celda')).toBeNull();
            });
        });

        describe('Límites de Detección de Ronda Decisiva (isDecisiveRound)', () => {
            const roundsToWin = 3; // Meta de 3 victorias (serie al mejor de 5)
            const threshold = roundsToWin - 1; // 2 victorias es el borde decisivo

            test('[Borde - 1] 1 victoria (1 - 0) -> no decisivo', () => {
                expect(isDecisiveRound(1, 0, roundsToWin)).toBe(false);
            });

            test('[Borde Exacto] 2 victorias (2 - 0) -> borde decisivo alcanzado por P1', () => {
                expect(isDecisiveRound(2, 0, roundsToWin)).toBe(true);
            });

            test('[Borde Exacto] 2 victorias (1 - 2) -> borde decisivo alcanzado por P2', () => {
                expect(isDecisiveRound(1, 2, roundsToWin)).toBe(true);
            });

            test('[Borde + 1] 3 victorias (3 - 1) -> partida ya definida', () => {
                expect(isDecisiveRound(3, 1, roundsToWin)).toBe(true);
            });
        });

        describe('Límites de Cálculo de Rondas para Ganar (calculateRoundsToWin)', () => {
            test('[Borde Serie Corta 1 ronda] Requiere 1 victoria', () => {
                expect(calculateRoundsToWin(1)).toBe(1);
            });

            test('[Borde Serie Estándar 5 rondas] Requiere 3 victorias (Math.ceil(5/2))', () => {
                expect(calculateRoundsToWin(5)).toBe(3);
            });

            test('[Borde Serie de 3 rondas] Requiere 2 victorias (Math.ceil(3/2))', () => {
                expect(calculateRoundsToWin(3)).toBe(2);
            });

            test('[Borde Inválido] Cero o negativo -> retorna valor predeterminado 3', () => {
                expect(calculateRoundsToWin(0)).toBe(3);
                expect(calculateRoundsToWin(-5)).toBe(3);
            });
        });

        describe('Límites del Temporizador de Ronda (formatTimerDisplay)', () => {
            test('[Borde 0 segundos] Muestra 00:00', () => {
                expect(formatTimerDisplay(0)).toBe('00:00');
            });

            test('[Borde Negativo] Trata negativos como 00:00', () => {
                expect(formatTimerDisplay(-10)).toBe('00:00');
            });

            test('[Borde 59 segundos] Muestra 00:59', () => {
                expect(formatTimerDisplay(59)).toBe('00:59');
            });

            test('[Borde 60 segundos] Cruza al minuto exacto: 01:00', () => {
                expect(formatTimerDisplay(60)).toBe('01:00');
            });

            test('[Valores mayores] 75 segundos -> 01:15', () => {
                expect(formatTimerDisplay(75)).toBe('01:15');
            });
        });
    });

    /* ==========================================================================
       TÉCNICA 3: CAMINO FELIZ VS. CAMINO DE ERROR (HAPPY PATH VS. ERROR PATH)
       ========================================================================== */
    describe('Técnica 3: Camino Feliz vs. Camino de Error', () => {

        describe('Flujo de Juego y Realización de Movimientos (placeMove)', () => {
            test('[Camino Feliz] Secuencia de jugadas válidas que culmina en victoria del Jugador 1', () => {
                let board = createEmptyBoard();

                // Turno 1: Jugador 1 marca (0, 0)
                expect(isValidMove(board, 0, 0)).toBe(true);
                board = placeMove(board, 0, 0, 1);
                expect(board[0][0]).toBe(1);

                // Turno 2: Jugador 2 marca (1, 0)
                expect(isValidMove(board, 1, 0)).toBe(true);
                board = placeMove(board, 1, 0, 2);
                expect(board[1][0]).toBe(2);

                // Turno 3: Jugador 1 marca (0, 1)
                board = placeMove(board, 0, 1, 1);
                expect(board[0][1]).toBe(1);

                // Turno 4: Jugador 2 marca (1, 1)
                board = placeMove(board, 1, 1, 2);
                expect(board[1][1]).toBe(2);

                // Turno 5: Jugador 1 marca (0, 2) completando la fila 0
                board = placeMove(board, 0, 2, 1);
                expect(board[0][2]).toBe(1);

                // Verificación de victoria
                expect(checkWinCondition(board, 1)).toBe(true);
                expect(checkWinCondition(board, 2)).toBe(false);
            });

            test('[Camino de Error] Intento de jugar en una celda ya ocupada', () => {
                let board = createEmptyBoard();
                board = placeMove(board, 1, 1, 1);

                expect(isValidMove(board, 1, 1)).toBe(false);
                const invalidAttempt = placeMove(board, 1, 1, 2);
                expect(invalidAttempt).toBeNull();
            });

            test('[Camino de Error] Coordenadas fuera de rango en placeMove', () => {
                const board = createEmptyBoard();
                expect(isValidMove(board, 3, 0)).toBe(false);
                expect(placeMove(board, 3, 0, 1)).toBeNull();
                expect(placeMove(board, 0, -1, 1)).toBeNull();
            });

            test('[Camino de Error] Jugador no válido (distinto de 1 y 2)', () => {
                const board = createEmptyBoard();
                expect(placeMove(board, 0, 0, 3)).toBeNull();
            });
        });

        describe('Determinación de Ganador del Partido (checkMatchWinner)', () => {
            const roundsToWin = 3;

            test('[Camino Feliz] Jugador 1 alcanza la meta de victorias (3 - 1) -> gana P1', () => {
                expect(checkMatchWinner(3, 1, roundsToWin)).toBe(1);
            });

            test('[Camino Feliz] Jugador 2 alcanza la meta de victorias (2 - 3) -> gana P2', () => {
                expect(checkMatchWinner(2, 3, roundsToWin)).toBe(2);
            });

            test('[Camino de Error / En Curso] Serie inconclusa (2 - 2) -> retorna null', () => {
                expect(checkMatchWinner(2, 2, roundsToWin)).toBeNull();
            });
        });
    });
});
