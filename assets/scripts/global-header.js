(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const profileBtn = document.getElementById('profileBtn');
        const profileDropdown = document.getElementById('profileDropdown');
        const profileWrapper = document.getElementById('profileWrapper');

        // Validamos que los elementos existan en la página actual
        if (!profileBtn || !profileDropdown || !profileWrapper) {
            return;
        }

        function closeDropdown() {
            profileDropdown.classList.remove('is-open');
            profileBtn.setAttribute('aria-expanded', 'false');
        }

        function toggleDropdown() {
            const isOpen = profileDropdown.classList.contains('is-open');
            if (isOpen) {
                closeDropdown();
            } else {
                profileDropdown.classList.add('is-open');
                profileBtn.setAttribute('aria-expanded', 'true');
            }
        }

        // 1. Toggle al hacer clic en el botón del perfil
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Evita que el click suba y active el event listener de document
            toggleDropdown();
        });

        // 2. Click Outside: cerrar si se hace clic fuera del menú
        document.addEventListener('click', function(e) {
            if (!profileWrapper.contains(e.target)) {
                closeDropdown();
            }
        });

        // 3. (Extra) Cerrar con la tecla Escape por accesibilidad
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeDropdown();
            }
        });
        
        // 4. Cerrar el menú si se hace click en algún enlace dentro del dropdown
        profileDropdown.querySelectorAll('.dropdown-item').forEach(function (item) {
            item.addEventListener('click', closeDropdown);
        });
    });
})();
