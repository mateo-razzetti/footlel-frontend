/**
 * FOOTLEL — Board & Game Rules Logic
 * services/gameLogic.js
 *
 * Módulo de reglas del juego Tateti, detección de tres en línea (filas, columnas, diagonales),
 * empates, alternancia de turnos, cálculo de rondas decisivas y normalización de celdas.
 */

export const DEFAULT_MAX_ROUNDS = 5;

/**
 * Crea una matriz 3x3 vacía inicializada en 0 (celdas sin conquistar).
 * @returns {number[][]}
 */
export function createEmptyBoard() {
    return [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
}

/**
 * Verifica si el jugador especificado ha conseguido tres en línea en el tablero.
 * Revisa 3 filas, 3 columnas, diagonal principal y diagonal secundaria.
 * @param {number[][]} board Matriz 3x3
 * @param {number} player Identificador del jugador (1 o 2)
 * @returns {boolean}
 */
export function checkWinCondition(board, player) {
    if (!Array.isArray(board) || board.length !== 3) return false;

    // Filas
    for (let row = 0; row < 3; row++) {
        if (board[row]?.[0] === player && board[row]?.[1] === player && board[row]?.[2] === player) {
            return true;
        }
    }

    // Columnas
    for (let col = 0; col < 3; col++) {
        if (board[0]?.[col] === player && board[1]?.[col] === player && board[2]?.[col] === player) {
            return true;
        }
    }

    // Diagonal principal
    if (board[0]?.[0] === player && board[1]?.[1] === player && board[2]?.[2] === player) {
        return true;
    }

    // Diagonal secundaria
    if (board[0]?.[2] === player && board[1]?.[1] === player && board[2]?.[0] === player) {
        return true;
    }

    return false;
}

/**
 * Comprueba si todas las celdas del tablero están ocupadas (ninguna celda es 0).
 * @param {number[][]} board Matriz 3x3
 * @returns {boolean}
 */
export function isBoardFull(board) {
    if (!Array.isArray(board) || board.length !== 3) return false;
    for (let r = 0; r < 3; r++) {
        if (!Array.isArray(board[r]) || board[r].length !== 3) return false;
        for (let c = 0; c < 3; c++) {
            if (board[r][c] === 0) return false;
        }
    }
    return true;
}

/**
 * Verifica la condición de empate:
 * El tablero debe estar completamente lleno y ninguno de los jugadores debe haber ganado.
 * @param {number[][]} board Matriz 3x3
 * @returns {boolean}
 */
export function checkDrawCondition(board) {
    if (!isBoardFull(board)) return false;
    return !checkWinCondition(board, 1) && !checkWinCondition(board, 2);
}

/**
 * Alterna el jugador activo:
 * Si es 1 pasa a 2, si es 2 pasa a 1. Valores inválidos se inicializan en 1.
 * @param {number} currentPlayer
 * @returns {number}
 */
export function switchActivePlayer(currentPlayer) {
    return currentPlayer === 1 ? 2 : 1;
}

/**
 * Calcula la cantidad de rondas necesarias para consagrarse ganador de la partida (mayoría simple).
 * Por ejemplo, en una serie al mejor de 5 rondas, se necesitan ceil(5/2) = 3 victorias.
 * @param {number} maxRounds
 * @returns {number}
 */
export function calculateRoundsToWin(maxRounds = DEFAULT_MAX_ROUNDS) {
    const rounds = Number(maxRounds);
    if (!isFinite(rounds) || rounds <= 0) return 3;
    return Math.ceil(rounds / 2);
}

/**
 * Determina si la ronda actual puede ser definitiva para el resultado de la serie
 * (cuando cualquiera de los dos jugadores está a sólo 1 victoria de la meta).
 * @param {number} scoreP1
 * @param {number} scoreP2
 * @param {number} roundsToWin
 * @returns {boolean}
 */
export function isDecisiveRound(scoreP1, scoreP2, roundsToWin = 3) {
    const target = Number(roundsToWin);
    const threshold = target - 1;
    return (Number(scoreP1) >= threshold || Number(scoreP2) >= threshold);
}

/**
 * Verifica si alguno de los jugadores ha alcanzado las rondas para ganar la partida.
 * @param {number} scoreP1
 * @param {number} scoreP2
 * @param {number} roundsToWin
 * @returns {number | null} 1 o 2 si hay ganador del partido; null si la serie sigue en juego.
 */
export function checkMatchWinner(scoreP1, scoreP2, roundsToWin = 3) {
    const target = Number(roundsToWin);
    if (Number(scoreP1) >= target) return 1;
    if (Number(scoreP2) >= target) return 2;
    return null;
}

/**
 * Normaliza los valores devueltos por los diferentes endpoints del backend para una celda:
 * 1, '1', 'X', 'x' -> Jugador 1
 * -1, 2, '-1', '2', 'O', 'o' -> Jugador 2 (o Bot)
 * Cualquier otro valor -> 0 (vacía)
 * @param {any} value
 * @returns {number} 1, 2 o 0
 */
export function normalizeServerCellValue(value) {
    if (value === 1 || value === '1' || value === 'X' || value === 'x') return 1;
    if (value === -1 || value === 2 || value === '-1' || value === '2' || value === 'O' || value === 'o') return 2;
    return 0;
}

/**
 * Traduce un índice unidimensional del tablero (0 a 8) a coordenadas fila y columna [0..2].
 * Retorna null si el índice está fuera del rango [0..8].
 * @param {number} index
 * @returns {{ row: number, col: number } | null}
 */
export function resolveCellCoordinates(index) {
    const num = Number(index);
    if (!isFinite(num) || num < 0 || num > 8 || !Number.isInteger(num)) {
        return null;
    }
    return {
        row: Math.floor(num / 3),
        col: num % 3
    };
}

/**
 * Comprueba si una jugada en la posición [row, col] es válida en el tablero actual.
 * @param {number[][]} board Matriz 3x3
 * @param {number} row Fila (0, 1 o 2)
 * @param {number} col Columna (0, 1 o 2)
 * @returns {boolean}
 */
export function isValidMove(board, row, col) {
    if (!Array.isArray(board) || board.length !== 3) return false;
    if (row < 0 || row > 2 || col < 0 || col > 2) return false;
    return board[row]?.[col] === 0;
}

/**
 * Aplica una jugada de manera inmutable sobre el tablero.
 * Retorna un nuevo tablero con la jugada aplicada, o null si la jugada no fue válida.
 * @param {number[][]} board Matriz 3x3
 * @param {number} row
 * @param {number} col
 * @param {number} player 1 o 2
 * @returns {number[][] | null}
 */
export function placeMove(board, row, col, player) {
    if (!isValidMove(board, row, col)) return null;
    if (player !== 1 && player !== 2) return null;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = player;
    return newBoard;
}

/**
 * Formatea un conteo regresivo de segundos en formato "MM:SS".
 * @param {number} seconds
 * @returns {string}
 */
export function formatTimerDisplay(seconds) {
    const sec = Math.max(0, Math.floor(Number(seconds) || 0));
    const mm = String(Math.floor(sec / 60)).padStart(2, '0');
    const ss = String(sec % 60).padStart(2, '0');
    return `${mm}:${ss}`;
}

// Compatibilidad con entorno de navegador global
if (typeof window !== 'undefined') {
    window.FootlelGameLogic = {
        DEFAULT_MAX_ROUNDS,
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
        formatTimerDisplay
    };
}
