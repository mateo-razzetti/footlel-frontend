/**
 * FOOTLEL — Authentication and Form Validations
 * services/authValidation.js
 *
 * Módulo de validación de credenciales, formularios de autenticación,
 * registro, restablecimiento de contraseña y códigos OTP.
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,8}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
export const PASSWORD_ERROR_MSG = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.';

/**
 * Valida si un correo electrónico cumple con el formato estándar local@dominio.ext
 * donde la extensión tiene entre 2 y 8 letras.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
    if (typeof email !== 'string') return false;
    const trimmed = email.trim();
    if (!trimmed) return false;
    return EMAIL_REGEX.test(trimmed);
}

/**
 * Valida una contraseña según la política de seguridad:
 * Mínimo 8 caracteres, al menos 1 minúscula, 1 mayúscula y 1 número.
 * @param {string} password
 * @returns {boolean}
 */
export function isValidPassword(password) {
    if (typeof password !== 'string') return false;
    return PASSWORD_REGEX.test(password);
}

/**
 * Comprueba que dos contraseñas coincidan exactamente y no sean vacías.
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {boolean}
 */
export function doPasswordsMatch(password, confirmPassword) {
    if (typeof password !== 'string' || typeof confirmPassword !== 'string') return false;
    if (password.length === 0) return false;
    return password === confirmPassword;
}

/**
 * Valida los campos requeridos para inicio de sesión.
 * @param {{ username?: string, password?: string }} fields
 * @returns {{ isValid: boolean, error: string | null, field: string | null }}
 */
export function validateLoginForm({ username, password } = {}) {
    const user = typeof username === 'string' ? username.trim() : '';
    const pass = typeof password === 'string' ? password.trim() : '';

    if (!user) {
        return { isValid: false, error: 'Falta ingresar el usuario.', field: 'username' };
    }
    if (!pass) {
        return { isValid: false, error: 'Falta ingresar la contraseña.', field: 'password' };
    }
    return { isValid: true, error: null, field: null };
}

/**
 * Valida de forma secuencial los campos de registro de usuario:
 * 1. Campos vacíos (email, username, password, confirmPassword)
 * 2. Formato de email
 * 3. Fortaleza de contraseña
 * 4. Coincidencia de contraseñas
 * @param {{ email?: string, username?: string, password?: string, confirmPassword?: string }} fields
 * @returns {{ isValid: boolean, error: string | null, field: string | null }}
 */
export function validateRegistrationForm({ email, username, password, confirmPassword } = {}) {
    const emailVal = typeof email === 'string' ? email.trim() : '';
    const userVal  = typeof username === 'string' ? username.trim() : '';
    const passVal  = typeof password === 'string' ? password : '';
    const confVal  = typeof confirmPassword === 'string' ? confirmPassword : '';

    if (!emailVal) {
        return { isValid: false, error: 'Falta ingresar el correo.', field: 'email' };
    }
    if (!userVal) {
        return { isValid: false, error: 'Falta crear un usuario.', field: 'username' };
    }
    if (!passVal) {
        return { isValid: false, error: 'Falta ingresar la contraseña.', field: 'password' };
    }
    if (!confVal) {
        return { isValid: false, error: 'Falta confirmar la contraseña.', field: 'confirm-password' };
    }

    if (!isValidEmail(emailVal)) {
        return { isValid: false, error: 'Ingresá un correo electrónico válido.', field: 'email' };
    }

    if (!isValidPassword(passVal)) {
        return { isValid: false, error: PASSWORD_ERROR_MSG, field: 'password' };
    }

    if (!doPasswordsMatch(passVal, confVal)) {
        return { isValid: false, error: 'Las contraseñas no coinciden.', field: 'confirm-password' };
    }

    return { isValid: true, error: null, field: null };
}

/**
 * Valida los campos para el formulario de restablecimiento / nueva contraseña.
 * @param {{ password?: string, confirmPassword?: string }} fields
 * @returns {{ isValid: boolean, error: string | null, field: string | null }}
 */
export function validateNewPasswordForm({ password, confirmPassword } = {}) {
    const pwdVal     = typeof password === 'string' ? password.trim() : '';
    const confirmVal = typeof confirmPassword === 'string' ? confirmPassword.trim() : '';

    if (!pwdVal) {
        return { isValid: false, error: 'Falta ingresar la nueva contraseña.', field: 'new-password' };
    }
    if (!confirmVal) {
        return { isValid: false, error: 'Falta confirmar la contraseña.', field: 'confirm-new-password' };
    }
    if (!isValidPassword(pwdVal)) {
        return { isValid: false, error: PASSWORD_ERROR_MSG, field: 'new-password' };
    }
    if (!doPasswordsMatch(pwdVal, confirmVal)) {
        return { isValid: false, error: 'Las contraseñas no coinciden.', field: 'confirm-new-password' };
    }
    return { isValid: true, error: null, field: null };
}

/**
 * Valida el formulario de edición de cuenta de usuario:
 * - Usuario no vacío
 * - Email con formato válido
 * - Si se ingresó una nueva contraseña, debe cumplir la política de seguridad
 * @param {{ username?: string, email?: string, newPassword?: string }} fields
 * @returns {{ isValid: boolean, error: string | null, field: string | null }}
 */
export function validateEditProfileForm({ username, email, newPassword } = {}) {
    const userVal = typeof username === 'string' ? username.trim() : '';
    const emailVal = typeof email === 'string' ? email.trim() : '';
    const pwdVal = typeof newPassword === 'string' ? newPassword.trim() : '';

    if (!userVal) {
        return { isValid: false, error: 'El nombre de usuario no puede estar vacío.', field: 'username' };
    }
    if (!emailVal || !isValidEmail(emailVal)) {
        return { isValid: false, error: 'Por favor, ingresá un correo electrónico válido (ej: usuario@dominio.com).', field: 'email' };
    }
    if (pwdVal && !isValidPassword(pwdVal)) {
        return { isValid: false, error: PASSWORD_ERROR_MSG, field: 'new-password' };
    }
    return { isValid: true, error: null, field: null };
}

/**
 * Valida que un carácter individual de OTP sea un dígito numérico (0-9).
 * @param {string} char
 * @returns {boolean}
 */
export function validateOtpInput(char) {
    if (typeof char !== 'string') return false;
    return /^\d$/.test(char);
}

/**
 * Valida que un código OTP completo tenga exactamente 6 dígitos numéricos.
 * @param {string} code
 * @returns {boolean}
 */
export function validateOtpFullCode(code) {
    if (typeof code !== 'string') return false;
    return /^\d{6}$/.test(code.trim());
}

// Compatibilidad con entorno de navegador global
if (typeof window !== 'undefined') {
    window.FootlelAuthValidation = {
        EMAIL_REGEX,
        PASSWORD_REGEX,
        PASSWORD_ERROR_MSG,
        isValidEmail,
        isValidPassword,
        doPasswordsMatch,
        validateLoginForm,
        validateRegistrationForm,
        validateNewPasswordForm,
        validateEditProfileForm,
        validateOtpInput,
        validateOtpFullCode
    };
}
