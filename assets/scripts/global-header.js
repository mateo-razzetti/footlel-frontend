(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const profileBtn = document.getElementById('profileBtn');
        const profileDropdown = document.getElementById('profileDropdown');
        const profileWrapper = document.getElementById('profileWrapper');

        // Validate that the elements exist on the current page
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

        // 1. Toggle on profile button click
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevents the click from bubbling up and triggering the document event listener
            toggleDropdown();
        });

        // 2. Click Outside: close if the click is outside the menu
        document.addEventListener('click', function(e) {
            if (!profileWrapper.contains(e.target)) {
                closeDropdown();
            }
        });

        // 3. (Extra) Close with the Escape key for accessibility
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeDropdown();
            }
        });
        
        // 4. Close the menu when any link inside the dropdown is clicked
        profileDropdown.querySelectorAll('.dropdown-item').forEach(function (item) {
            item.addEventListener('click', closeDropdown);
        });
    });
})();
