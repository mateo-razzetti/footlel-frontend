/**
 * FOOTLEL — Pruebas Unitarias: Validación de Autenticación y Formularios
 * tests/authValidation.test.js
 *
 * Técnicas de diseño de pruebas unitarias aplicadas según los requisitos de cátedra:
 * 1. Clases de Equivalencia (Equivalence Partitioning)
 * 2. Valores Límite / Bordes (Boundary Value Analysis)
 * 3. Camino Feliz vs. Camino de Error (Happy Path vs. Error Path)
 */

import {
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
} from '../services/authValidation.js';

describe('Suite de Validación de Autenticación (authValidation.js)', () => {

    /* ==========================================================================
       TÉCNICA 1: CLASES DE EQUIVALENCIA (EQUIVALENCE PARTITIONING)
       ========================================================================== */
    describe('Técnica 1: Clases de Equivalencia', () => {

        describe('Validación de Correo Electrónico (isValidEmail)', () => {
            test('[Clase Válida] Correo estándar con dominio genérico (.com)', () => {
                expect(isValidEmail('usuario@dominio.com')).toBe(true);
            });

            test('[Clase Válida] Correo institucional con subdominios y caracteres válidos', () => {
                expect(isValidEmail('estudiante.final_2026@alumnos.ub.edu.ar')).toBe(true);
            });

            test('[Clase Inválida] Entrada no string (null, undefined, objeto, número)', () => {
                expect(isValidEmail(null)).toBe(false);
                expect(isValidEmail(undefined)).toBe(false);
                expect(isValidEmail(12345)).toBe(false);
                expect(isValidEmail({})).toBe(false);
            });

            test('[Clase Inválida] Cadena vacía o sólo espacios', () => {
                expect(isValidEmail('')).toBe(false);
                expect(isValidEmail('   ')).toBe(false);
            });

            test('[Clase Inválida] Correo sin arroba (@)', () => {
                expect(isValidEmail('usuariodominio.com')).toBe(false);
            });

            test('[Clase Inválida] Correo sin parte local o sin dominio', () => {
                expect(isValidEmail('@dominio.com')).toBe(false);
                expect(isValidEmail('usuario@')).toBe(false);
            });

            test('[Clase Inválida] Correo con espacios intercalados', () => {
                expect(isValidEmail('user name@dominio.com')).toBe(false);
                expect(isValidEmail('user@dom inio.com')).toBe(false);
            });
        });

        describe('Validación de Política de Contraseña (isValidPassword)', () => {
            test('[Clase Válida] Contraseña que cumple todos los criterios (minúscula, mayúscula, dígito, >= 8 chars)', () => {
                expect(isValidPassword('Footlel2026')).toBe(true);
                expect(isValidPassword('ClaveSegura1')).toBe(true);
            });

            test('[Clase Inválida] Entrada no string', () => {
                expect(isValidPassword(null)).toBe(false);
                expect(isValidPassword(undefined)).toBe(false);
                expect(isValidPassword(12345678)).toBe(false);
            });

            test('[Clase Inválida] Contraseña sin mayúsculas', () => {
                expect(isValidPassword('footlel2026')).toBe(false);
            });

            test('[Clase Inválida] Contraseña sin minúsculas', () => {
                expect(isValidPassword('FOOTLEL2026')).toBe(false);
            });

            test('[Clase Inválida] Contraseña sin números', () => {
                expect(isValidPassword('FootlelPassword')).toBe(false);
            });
        });

        describe('Coincidencia de Contraseñas (doPasswordsMatch)', () => {
            test('[Clase Válida] Contraseñas exactamente iguales y no vacías', () => {
                expect(doPasswordsMatch('MiClave123', 'MiClave123')).toBe(true);
            });

            test('[Clase Inválida] Contraseñas con diferencias de mayúsculas/minúsculas', () => {
                expect(doPasswordsMatch('MiClave123', 'miclave123')).toBe(false);
            });

            test('[Clase Inválida] Dos cadenas vacías', () => {
                expect(doPasswordsMatch('', '')).toBe(false);
            });

            test('[Clase Inválida] Argumentos nulos o tipos no string', () => {
                expect(doPasswordsMatch(null, 'Clave123')).toBe(false);
                expect(doPasswordsMatch('Clave123', undefined)).toBe(false);
            });
        });

        describe('Validación de Dígitos OTP (validateOtpInput)', () => {
            test('[Clase Válida] Carácter numérico del 0 al 9', () => {
                expect(validateOtpInput('0')).toBe(true);
                expect(validateOtpInput('5')).toBe(true);
                expect(validateOtpInput('9')).toBe(true);
            });

            test('[Clase Inválida] Carácter alfabético, símbolo o entrada no válida', () => {
                expect(validateOtpInput('a')).toBe(false);
                expect(validateOtpInput('-')).toBe(false);
                expect(validateOtpInput(' ')).toBe(false);
                expect(validateOtpInput(null)).toBe(false);
                expect(validateOtpInput('12')).toBe(false); // Más de 1 char
            });
        });
    });

    /* ==========================================================================
       TÉCNICA 2: VALORES LÍMITE / BORDES (BOUNDARY VALUE ANALYSIS)
       ========================================================================== */
    describe('Técnica 2: Valores Límite (BVA)', () => {

        describe('Límite de Longitud de Contraseña (mínimo 8 caracteres)', () => {
            test('[Borde - 1] 7 caracteres (inválido por 1 carácter faltante)', () => {
                expect(isValidPassword('Pass123')).toBe(false); // 7 chars: Pass123
            });

            test('[Borde Exacto] 8 caracteres (justo en el límite mínimo válido)', () => {
                expect(isValidPassword('Pass1234')).toBe(true); // 8 chars: Pass1234
            });

            test('[Borde + 1] 9 caracteres (un carácter por encima del límite)', () => {
                expect(isValidPassword('Pass12345')).toBe(true); // 9 chars: Pass12345
            });
        });

        describe('Límite de Longitud de Extensión TLD en Email (entre 2 y 8 letras)', () => {
            test('[Borde Inferior - 1] Extensión de 1 letra (inválido, < 2 letras)', () => {
                expect(isValidEmail('admin@dominio.c')).toBe(false);
            });

            test('[Borde Inferior Exacto] Extensión de 2 letras (válido, ej: .ar, .co)', () => {
                expect(isValidEmail('admin@dominio.ar')).toBe(true);
            });

            test('[Borde Superior Exacto] Extensión de 8 letras (válido, ej: .software)', () => {
                expect(isValidEmail('admin@dominio.software')).toBe(true);
            });

            test('[Borde Superior + 1] Extensión de 9 letras (inválido, > 8 letras)', () => {
                expect(isValidEmail('admin@dominio.marketing')).toBe(false); // 9 letras
            });
        });

        describe('Límite de Longitud del Código OTP Completo (exactamente 6 dígitos)', () => {
            test('[Borde Inferior - 1] 5 dígitos numéricos (inválido)', () => {
                expect(validateOtpFullCode('12345')).toBe(false);
            });

            test('[Borde Exacto] 6 dígitos numéricos (válido)', () => {
                expect(validateOtpFullCode('123456')).toBe(true);
                expect(validateOtpFullCode('000000')).toBe(true);
            });

            test('[Borde Superior + 1] 7 dígitos numéricos (inválido)', () => {
                expect(validateOtpFullCode('1234567')).toBe(false);
            });

            test('[Entrada Inválida] 6 caracteres pero con letras', () => {
                expect(validateOtpFullCode('12345A')).toBe(false);
                expect(validateOtpFullCode(null)).toBe(false);
            });
        });
    });

    /* ==========================================================================
       TÉCNICA 3: CAMINO FELIZ VS. CAMINO DE ERROR (HAPPY PATH VS. ERROR PATH)
       ========================================================================== */
    describe('Técnica 3: Camino Feliz vs. Camino de Error', () => {

        describe('Formulario de Login (validateLoginForm)', () => {
            test('[Camino Feliz] Usuario y contraseña válidos ingresados', () => {
                const res = validateLoginForm({ username: 'messi10', password: 'Password2026' });
                expect(res.isValid).toBe(true);
                expect(res.error).toBeNull();
                expect(res.field).toBeNull();
            });

            test('[Camino de Error] Falta ingresar el usuario', () => {
                const res = validateLoginForm({ username: '', password: 'Password2026' });
                expect(res.isValid).toBe(false);
                expect(res.error).toBe('Falta ingresar el usuario.');
                expect(res.field).toBe('username');
            });

            test('[Camino de Error] Falta ingresar la contraseña', () => {
                const res = validateLoginForm({ username: 'messi10', password: '   ' });
                expect(res.isValid).toBe(false);
                expect(res.error).toBe('Falta ingresar la contraseña.');
                expect(res.field).toBe('password');
            });

            test('[Camino de Error] Objeto de entrada vacío o sin parámetros', () => {
                const res = validateLoginForm();
                expect(res.isValid).toBe(false);
                expect(res.field).toBe('username');
            });
        });

        describe('Formulario de Registro (validateRegistrationForm)', () => {
            const validRegistration = {
                email: 'diego@footlel.com',
                username: 'diegomaradona',
                password: 'Password10',
                confirmPassword: 'Password10'
            };

            test('[Camino Feliz] Todos los campos válidos, contraseñas coinciden y cumplen requisitos', () => {
                const res = validateRegistrationForm(validRegistration);
                expect(res.isValid).toBe(true);
                expect(res.error).toBeNull();
                expect(res.field).toBeNull();
            });

            test('[Camino de Error] Falta ingresar el correo', () => {
                const res = validateRegistrationForm({ ...validRegistration, email: '' });
                expect(res.isValid).toBe(false);
                expect(res.error).toBe('Falta ingresar el correo.');
                expect(res.field).toBe('email');
            });

            test('[Camino de Error] Falta crear un usuario', () => {
                const res = validateRegistrationForm({ ...validRegistration, username: '   ' });
                expect(res.isValid).toBe(false);
                expect(res.error).toBe('Falta crear un usuario.');
                expect(res.field).toBe('username');
            });

            test('[Camino de Error] Falta ingresar la contraseña', () => {
                const res = validateRegistrationForm({ ...validRegistration, password: '' });
                expect(res.isValid).toBe(false);
                expect(res.error).toBe('Falta ingresar la contraseña.');
                expect(res.field).toBe('password');
            });

            test('[Camino de Error] Falta confirmar la contraseña', () => {
                const res = validateRegistrationForm({ ...validRegistration, confirmPassword: '' });
                expect(res.isValid).toBe(false);
                expect(res.error).toBe('Falta confirmar la contraseña.');
                expect(res.field).toBe('confirm-password');
            });

            test('[Camino de Error] Correo electrónico con formato inválido', () => {
                const res = validateRegistrationForm({ ...validRegistration, email: 'correo-invalido' });
                expect(res.isValid).toBe(false);
                expect(res.error).toBe('Ingresá un correo electrónico válido.');
                expect(res.field).toBe('email');
            });

            test('[Camino de Error] Contraseña que no cumple requisitos de seguridad', () => {
                const res = validateRegistrationForm({
                    ...validRegistration,
                    password: 'debil',
                    confirmPassword: 'debil'
                });
                expect(res.isValid).toBe(false);
                expect(res.error).toBe(PASSWORD_ERROR_MSG);
                expect(res.field).toBe('password');
            });

            test('[Camino de Error] Las contraseñas no coinciden', () => {
                const res = validateRegistrationForm({
                    ...validRegistration,
                    confirmPassword: 'Password10Distinta'
                });
                expect(res.isValid).toBe(false);
                expect(res.error).toBe('Las contraseñas no coinciden.');
                expect(res.field).toBe('confirm-password');
            });
        });

        describe('Formulario de Nueva Contraseña (validateNewPasswordForm)', () => {
            test('[Camino Feliz] Nueva contraseña válida y confirmación coincidente', () => {
                const res = validateNewPasswordForm({
                    password: 'NuevaClave2026',
                    confirmPassword: 'NuevaClave2026'
                });
                expect(res.isValid).toBe(true);
                expect(res.error).toBeNull();
            });

            test('[Camino de Error] Falta ingresar la nueva contraseña', () => {
                const res = validateNewPasswordForm({ password: '', confirmPassword: 'Clave' });
                expect(res.isValid).toBe(false);
                expect(res.error).toBe('Falta ingresar la nueva contraseña.');
                expect(res.field).toBe('new-password');
            });

            test('[Camino de Error] Falta confirmar la contraseña', () => {
                const res = validateNewPasswordForm({ password: 'NuevaClave2026', confirmPassword: '' });
                expect(res.isValid).toBe(false);
                expect(res.error).toBe('Falta confirmar la contraseña.');
                expect(res.field).toBe('confirm-new-password');
            });

            test('[Camino de Error] Contraseña insegura (sin números)', () => {
                const res = validateNewPasswordForm({
                    password: 'SoloLetrasGrandesYChicas',
                    confirmPassword: 'SoloLetrasGrandesYChicas'
                });
                expect(res.isValid).toBe(false);
                expect(res.error).toBe(PASSWORD_ERROR_MSG);
                expect(res.field).toBe('new-password');
            });

            test('[Camino de Error] Contraseñas no coinciden', () => {
                const res = validateNewPasswordForm({
                    password: 'NuevaClave2026',
                    confirmPassword: 'OtraClave2026'
                });
                expect(res.isValid).toBe(false);
                expect(res.error).toBe('Las contraseñas no coinciden.');
                expect(res.field).toBe('confirm-new-password');
            });
        });

        describe('Formulario de Edición de Perfil (validateEditProfileForm)', () => {
            test('[Camino Feliz] Usuario y email válidos sin cambio de contraseña', () => {
                const res = validateEditProfileForm({
                    username: 'lionel',
                    email: 'lionel@barca.com'
                });
                expect(res.isValid).toBe(true);
                expect(res.error).toBeNull();
            });

            test('[Camino Feliz] Usuario, email y nueva contraseña segura', () => {
                const res = validateEditProfileForm({
                    username: 'lionel',
                    email: 'lionel@barca.com',
                    newPassword: 'NuevaPassword2026'
                });
                expect(res.isValid).toBe(true);
            });

            test('[Camino de Error] Nombre de usuario vacío', () => {
                const res = validateEditProfileForm({ username: '', email: 'lionel@barca.com' });
                expect(res.isValid).toBe(false);
                expect(res.error).toBe('El nombre de usuario no puede estar vacío.');
                expect(res.field).toBe('username');
            });

            test('[Camino de Error] Email inválido', () => {
                const res = validateEditProfileForm({ username: 'lionel', email: 'email-erroneo' });
                expect(res.isValid).toBe(false);
                expect(res.error).toBe('Por favor, ingresá un correo electrónico válido (ej: usuario@dominio.com).');
                expect(res.field).toBe('email');
            });

            test('[Camino de Error] Nueva contraseña provista pero insegura', () => {
                const res = validateEditProfileForm({
                    username: 'lionel',
                    email: 'lionel@barca.com',
                    newPassword: '123'
                });
                expect(res.isValid).toBe(false);
                expect(res.error).toBe(PASSWORD_ERROR_MSG);
                expect(res.field).toBe('new-password');
            });
        });
    });
});
